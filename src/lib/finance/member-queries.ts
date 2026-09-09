import "server-only"

import { supabaseServer } from "@/src/lib/supabase/server"

import type {
  MemberBalanceRow,
  MemberFinanceData,
  MemberMonthlyBalanceRow,
  MemberTransactionRow,
} from "./types"

const PAGE_SIZE = 500
type FinanceSupabaseClient = Awaited<ReturnType<typeof supabaseServer>>

async function getAllMemberTransactions(
  supabase: FinanceSupabaseClient
): Promise<
  MemberFinanceData["transactions"]
> {
  const rows: MemberTransactionRow[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .schema("finance")
      .from("member_transaction_history")
      .select(`
        id,
        member_id,
        transaction_date,
        transaction_type,
        amount_cents,
        currency,
        description,
        payment_method,
        match_id,
        reversal_of_transaction_id,
        created_at
      `)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error("[FINANCE] Member transaction history query failed:", error)
      return { status: "error", message: "Transaction history is unavailable." }
    }

    const page = (data ?? []) as MemberTransactionRow[]
    rows.push(...page)

    if (page.length < PAGE_SIZE) break
  }

  return { status: "success", data: rows }
}

async function getAllMemberMonthlyHistory(
  supabase: FinanceSupabaseClient
): Promise<
  MemberFinanceData["monthlyHistory"]
> {
  const rows: MemberMonthlyBalanceRow[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .schema("finance")
      .from("member_monthly_balance_history")
      .select(`
        member_id,
        period_end,
        version,
        balance_cents,
        currency,
        finalized_at,
        is_restated
      `)
      .order("period_end", { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error("[FINANCE] Member monthly history query failed:", error)
      return { status: "error", message: "Monthly balance history is unavailable." }
    }

    const page = (data ?? []) as MemberMonthlyBalanceRow[]
    rows.push(...page)

    if (page.length < PAGE_SIZE) break
  }

  return { status: "success", data: rows }
}

export async function getMemberFinanceData(): Promise<MemberFinanceData> {
  const supabase = await supabaseServer()

  const balancePromise = supabase
    .schema("finance")
    .from("member_balances")
    .select("member_id, currency, balance_cents, last_transaction_at")
    .maybeSingle()

  const [balanceResponse, transactions, monthlyHistory] = await Promise.all([
    balancePromise,
    getAllMemberTransactions(supabase),
    getAllMemberMonthlyHistory(supabase),
  ])

  const balance: MemberFinanceData["balance"] = balanceResponse.error
    ? (() => {
        console.error("[FINANCE] Member balance query failed:", balanceResponse.error)
        return { status: "error", message: "Your current balance is unavailable." }
      })()
    : balanceResponse.data
      ? {
          status: "success",
          activity: "present",
          data: balanceResponse.data as MemberBalanceRow,
        }
      : { status: "success", activity: "none", data: null }

  return { balance, transactions, monthlyHistory }
}
