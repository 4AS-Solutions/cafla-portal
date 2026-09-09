export const FINANCE_TRANSACTION_TYPES = [
  "opening_balance",
  "match_fee",
  "annual_membership_fee",
  "payment",
  "manual_charge",
  "manual_credit",
  "adjustment",
  "reversal",
] as const

export type FinanceTransactionType =
  (typeof FINANCE_TRANSACTION_TYPES)[number]

export type FinancePaymentMethod =
  | "zelle"
  | "cash"
  | "check"
  | "other"

export type FinanceCents = number | string | bigint

export type MemberBalanceRow = {
  member_id: string
  currency: "USD"
  balance_cents: FinanceCents
  last_transaction_at: string
}

export type MemberTransactionRow = {
  id: string
  member_id: string
  transaction_date: string
  transaction_type: FinanceTransactionType
  amount_cents: FinanceCents
  currency: "USD"
  description: string
  payment_method: FinancePaymentMethod | null
  match_id: string | null
  reversal_of_transaction_id: string | null
  created_at: string
}

export type MemberMonthlyBalanceRow = {
  member_id: string
  period_end: string
  version: number
  balance_cents: FinanceCents
  currency: "USD"
  finalized_at: string
  is_restated: boolean
}

export type FinanceQueryResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string }

export type MemberBalanceResult =
  | { status: "success"; activity: "present"; data: MemberBalanceRow }
  | { status: "success"; activity: "none"; data: null }
  | { status: "error"; message: string }

export type MemberFinanceData = {
  balance: MemberBalanceResult
  transactions: FinanceQueryResult<MemberTransactionRow[]>
  monthlyHistory: FinanceQueryResult<MemberMonthlyBalanceRow[]>
}

export type FinanceClosingStatus = "draft" | "finalized" | "superseded"

export type AdminFinanceMember = {
  id: string
  full_name: string
  email: string
  status: string
}

export type AdminFinanceBalance = AdminFinanceMember & {
  currency: "USD"
  balance_cents: FinanceCents
  last_transaction_at: string
}

export type AdminFinanceTransaction = MemberTransactionRow & {
  member: AdminFinanceMember
  internal_notes: string | null
  reversal_reason: string | null
  source_type: string | null
  source_id: string | null
  created_by: string
  creator: AdminFinanceMember | null
  metadata: Record<string, unknown>
}

export type AdminFinanceClosing = {
  id: string
  period_end: string
  version: number
  status: FinanceClosingStatus
  supersedes_closing_id: string | null
  restatement_reason: string | null
  ledger_cutoff_at: string
  created_at: string
  finalized_at: string | null
  snapshot_count: number
}

export type AdminFinanceSnapshot = {
  id: string
  closing_id: string
  member_id: string
  balance_cents: FinanceCents
  currency: "USD"
  created_at: string
  member: AdminFinanceMember
}

export type AdminClosingPreview = {
  period_end: string
  preview_cutoff: string
  rows: AdminFinanceBalance[]
}

export type AdminFinancePageResult<T> = FinanceQueryResult<{
  rows: T[]
  count: number
}>
