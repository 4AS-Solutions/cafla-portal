import "server-only"

import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

import type {
  AdminFinanceBalance,
  AdminFinanceClosing,
  AdminFinanceMember,
  AdminFinancePageResult,
  AdminFinanceSnapshot,
  AdminFinanceTransaction,
  AdminClosingPreview,
  FinanceClosingStatus,
  FinancePaymentMethod,
  FinanceQueryResult,
  FinanceTransactionType,
} from "./types"

const DATABASE_PAGE_SIZE = 500
const MEMBER_BATCH_SIZE = 100

type RawTransaction = Omit<AdminFinanceTransaction, "member" | "creator"> & {
  currency: "USD"
}

type AdminFinanceFilters = {
  search?: string
  status?: string
  balance?: string
  transactionType?: string
  paymentMethod?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

function safePage(value?: number) {
  return Number.isInteger(value) && (value ?? 0) >= 0 ? value! : 0
}

function normalizeSearch(value?: string) {
  return value?.trim().toLocaleLowerCase() ?? ""
}

function paginate<T>(rows: T[], page = 0, limit = 20) {
  const start = safePage(page) * limit
  return { rows: rows.slice(start, start + limit), count: rows.length }
}

async function getMembersByIds(ids: string[]): Promise<Map<string, AdminFinanceMember>> {
  const supabase = getSupabaseAdmin()
  const members = new Map<string, AdminFinanceMember>()
  const uniqueIds = [...new Set(ids)]

  for (let index = 0; index < uniqueIds.length; index += MEMBER_BATCH_SIZE) {
    const batch = uniqueIds.slice(index, index + MEMBER_BATCH_SIZE)
    if (batch.length === 0) continue

    const { data, error } = await supabase
      .from("members")
      .select("id, full_name, email, status")
      .in("id", batch)

    if (error) throw error

    for (const member of (data ?? []) as AdminFinanceMember[]) {
      members.set(member.id, member)
    }
  }

  return members
}

export async function getAdminFinanceMembers(): Promise<FinanceQueryResult<AdminFinanceMember[]>> {
  try {
    const supabase = getSupabaseAdmin()
    const rows: AdminFinanceMember[] = []

    for (let from = 0; ; from += DATABASE_PAGE_SIZE) {
      const { data, error } = await supabase
        .from("members")
        .select("id, full_name, email, status")
        .order("full_name", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + DATABASE_PAGE_SIZE - 1)
      if (error) throw error
      const page = (data ?? []) as AdminFinanceMember[]
      rows.push(...page)
      if (page.length < DATABASE_PAGE_SIZE) break
    }

    return { status: "success", data: rows }
  } catch (error) {
    console.error("[FINANCE ADMIN] Member selector query failed:", error)
    return { status: "error", message: "Members are unavailable." }
  }
}

async function getAllTransactions(memberId?: string): Promise<RawTransaction[]> {
  const supabase = getSupabaseAdmin()
  const rows: RawTransaction[] = []

  for (let from = 0; ; from += DATABASE_PAGE_SIZE) {
    let query = supabase
      .schema("finance")
      .from("transactions")
      .select(`
        id, member_id, transaction_date, transaction_type, amount_cents,
        currency, description, internal_notes, payment_method, match_id,
        source_type, source_id, reversal_of_transaction_id, reversal_reason,
        created_by, created_at, metadata
      `)

    if (memberId) query = query.eq("member_id", memberId)

    const { data, error } = await query
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + DATABASE_PAGE_SIZE - 1)

    if (error) throw error

    const page = (data ?? []) as RawTransaction[]
    rows.push(...page)
    if (page.length < DATABASE_PAGE_SIZE) break
  }

  return rows
}

function transactionMatches(row: AdminFinanceTransaction, filters: AdminFinanceFilters) {
  const search = normalizeSearch(filters.search)
  if (search && ![
    row.member.full_name,
    row.member.email,
    row.description,
  ].some((value) => value.toLocaleLowerCase().includes(search))) return false

  if (filters.transactionType && row.transaction_type !== filters.transactionType) return false
  if (filters.paymentMethod && row.payment_method !== filters.paymentMethod) return false
  if (filters.dateFrom && row.transaction_date < filters.dateFrom) return false
  if (filters.dateTo && row.transaction_date > filters.dateTo) return false
  return true
}

export async function getAdminFinanceBalances(
  filters: AdminFinanceFilters = {}
): Promise<AdminFinancePageResult<AdminFinanceBalance>> {
  try {
    const transactions = await getAllTransactions()
    const members = await getMembersByIds(transactions.map((row) => row.member_id))
    const aggregates = new Map<string, { balance: bigint; last: string; currency: "USD" }>()

    for (const transaction of transactions) {
      const current = aggregates.get(transaction.member_id)
      aggregates.set(transaction.member_id, {
        balance: (current?.balance ?? BigInt(0)) + BigInt(transaction.amount_cents),
        last: !current || transaction.created_at > current.last
          ? transaction.created_at
          : current.last,
        currency: transaction.currency,
      })
    }

    const search = normalizeSearch(filters.search)
    const rows: AdminFinanceBalance[] = []
    for (const [memberId, aggregate] of aggregates) {
      const member = members.get(memberId)
      if (!member) continue
      if (search && !`${member.full_name} ${member.email}`.toLocaleLowerCase().includes(search)) continue
      if (filters.status && member.status !== filters.status) continue
      if (filters.balance === "owes" && aggregate.balance >= BigInt(0)) continue
      if (filters.balance === "owed" && aggregate.balance <= BigInt(0)) continue
      if (filters.balance === "balanced" && aggregate.balance !== BigInt(0)) continue

      rows.push({
        ...member,
        currency: aggregate.currency,
        balance_cents: aggregate.balance,
        last_transaction_at: aggregate.last,
      })
    }

    rows.sort((a, b) => a.full_name.localeCompare(b.full_name) || a.id.localeCompare(b.id))
    return { status: "success", data: paginate(rows, filters.page, filters.limit) }
  } catch (error) {
    console.error("[FINANCE ADMIN] Balance query failed:", error)
    return { status: "error", message: "Finance balances are unavailable." }
  }
}

export async function getAdminFinanceTransactions(
  filters: AdminFinanceFilters = {}
): Promise<AdminFinancePageResult<AdminFinanceTransaction>> {
  try {
    const transactions = await getAllTransactions()
    const identities = await getMembersByIds(
      transactions.flatMap((row) => [row.member_id, row.created_by])
    )
    const rows = transactions.flatMap((row) => {
      const member = identities.get(row.member_id)
      if (!member) return []
      return [{ ...row, member, creator: identities.get(row.created_by) ?? null }]
    }).filter((row) => transactionMatches(row, filters))

    return { status: "success", data: paginate(rows, filters.page, filters.limit) }
  } catch (error) {
    console.error("[FINANCE ADMIN] Transaction query failed:", error)
    return { status: "error", message: "The Finance ledger is unavailable." }
  }
}

export async function getAdminMemberFinance(memberId: string): Promise<FinanceQueryResult<{
  member: AdminFinanceMember
  balanceCents: bigint | null
  transactions: AdminFinanceTransaction[]
}>> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(memberId)) {
    return { status: "error", message: "Invalid member ID." }
  }

  try {
    const members = await getMembersByIds([memberId])
    const member = members.get(memberId)
    if (!member) return { status: "error", message: "Member not found." }

    const all = await getAllTransactions(memberId)
    const identities = await getMembersByIds(all.map((row) => row.created_by))
    const transactions = all.map((row) => ({
      ...row,
      member,
      creator: identities.get(row.created_by) ?? null,
    }))
    const balanceCents = transactions.length === 0
      ? null
      : transactions.reduce((sum, row) => sum + BigInt(row.amount_cents), BigInt(0))

    return { status: "success", data: { member, balanceCents, transactions } }
  } catch (error) {
    console.error("[FINANCE ADMIN] Member statement query failed:", error)
    return { status: "error", message: "The member financial statement is unavailable." }
  }
}

export async function getAdminFinanceClosings(
  selectedClosingId?: string
): Promise<FinanceQueryResult<{
  closings: AdminFinanceClosing[]
  selectedClosing: AdminFinanceClosing | null
  snapshots: AdminFinanceSnapshot[]
}>> {
  try {
    const supabase = getSupabaseAdmin()
    const rawClosings: Omit<AdminFinanceClosing, "snapshot_count">[] = []
    for (let from = 0; ; from += DATABASE_PAGE_SIZE) {
      const response = await supabase
        .schema("finance")
        .from("monthly_closings")
        .select("id, period_end, version, status, supersedes_closing_id, restatement_reason, ledger_cutoff_at, created_at, finalized_at")
        .order("period_end", { ascending: false })
        .order("version", { ascending: false })
        .order("id", { ascending: false })
        .range(from, from + DATABASE_PAGE_SIZE - 1)
      if (response.error) throw response.error
      const page = (response.data ?? []) as Omit<AdminFinanceClosing, "snapshot_count">[]
      rawClosings.push(...page)
      if (page.length < DATABASE_PAGE_SIZE) break
    }
    const snapshotCounts = new Map<string, number>()
    const allSnapshots: Omit<AdminFinanceSnapshot, "member">[] = []

    for (let from = 0; ; from += DATABASE_PAGE_SIZE) {
      const response = await supabase
        .schema("finance")
        .from("monthly_balance_snapshots")
        .select("id, closing_id, member_id, balance_cents, currency, created_at")
        .order("closing_id", { ascending: true })
        .order("member_id", { ascending: true })
        .range(from, from + DATABASE_PAGE_SIZE - 1)
      if (response.error) throw response.error
      const page = (response.data ?? []) as Omit<AdminFinanceSnapshot, "member">[]
      for (const row of page) snapshotCounts.set(row.closing_id, (snapshotCounts.get(row.closing_id) ?? 0) + 1)
      allSnapshots.push(...page)
      if (page.length < DATABASE_PAGE_SIZE) break
    }

    const closings = rawClosings.map((row) => ({ ...row, snapshot_count: snapshotCounts.get(row.id) ?? 0 }))
    const selectedClosing = selectedClosingId
      ? closings.find((row) => row.id === selectedClosingId) ?? null
      : null
    const selectedRows = selectedClosing
      ? allSnapshots.filter((row) => row.closing_id === selectedClosing.id)
      : []
    const members = await getMembersByIds(selectedRows.map((row) => row.member_id))
    const snapshots = selectedRows.flatMap((row) => {
      const member = members.get(row.member_id)
      return member ? [{ ...row, member }] : []
    })

    return { status: "success", data: { closings, selectedClosing, snapshots } }
  } catch (error) {
    console.error("[FINANCE ADMIN] Closing query failed:", error)
    return { status: "error", message: "Monthly closing history is unavailable." }
  }
}

export async function getAdminClosingPreview(periodEnd: string, cutoff: string): Promise<FinanceQueryResult<AdminClosingPreview>> {
  try {
    const cutoffTime = new Date(cutoff).getTime()
    if (!Number.isFinite(cutoffTime)) return { status: "error", message: "Invalid preview cutoff." }
    const transactions = (await getAllTransactions()).filter((row) => row.transaction_date <= periodEnd && new Date(row.created_at).getTime() <= cutoffTime)
    const members = await getMembersByIds(transactions.map((row) => row.member_id))
    const aggregates = new Map<string, { memberId: string; balance: bigint; last: string; currency: "USD" }>()
    for (const row of transactions) {
      const key = `${row.member_id}:${row.currency}`
      const current = aggregates.get(key)
      aggregates.set(key, { memberId: row.member_id, balance: (current?.balance ?? BigInt(0)) + BigInt(row.amount_cents), last: !current || new Date(row.created_at).getTime() > new Date(current.last).getTime() ? row.created_at : current.last, currency: row.currency })
    }
    const rows = [...aggregates.values()].flatMap((value) => {
      const member = members.get(value.memberId)
      return member ? [{ ...member, currency: value.currency, balance_cents: value.balance.toString(), last_transaction_at: value.last }] : []
    }).sort((a, b) => a.full_name.localeCompare(b.full_name) || a.id.localeCompare(b.id))
    return { status: "success", data: { period_end: periodEnd, preview_cutoff: cutoff, rows } }
  } catch (error) {
    console.error("[FINANCE ADMIN] Closing preview failed:", error)
    return { status: "error", message: "Closing preview is unavailable." }
  }
}

export const ADMIN_TRANSACTION_TYPE_OPTIONS = [
  "opening_balance", "match_fee", "annual_membership_fee", "payment",
  "manual_charge", "manual_credit", "adjustment", "reversal",
] satisfies FinanceTransactionType[]

export const ADMIN_PAYMENT_METHOD_OPTIONS = ["zelle", "cash", "check", "other"] satisfies FinancePaymentMethod[]
export const ADMIN_CLOSING_STATUSES = ["draft", "finalized", "superseded"] satisfies FinanceClosingStatus[]
