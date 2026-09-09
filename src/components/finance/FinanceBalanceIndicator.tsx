"use client"

import Link from "next/link"
import { WalletCards } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { useAuth } from "@/src/components/providers/AuthProvider"
import { supabase } from "@/src/lib/supabase/client"
import {
  formatUsdFromCents,
  getBalanceMeaningLabel,
} from "@/src/lib/finance/money"
import type { MemberBalanceResult, MemberBalanceRow } from "@/src/lib/finance/types"

type IndicatorState = MemberBalanceResult | { status: "loading" }

export function FinanceBalanceIndicator() {
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState<IndicatorState>({ status: "loading" })

  const loadBalance = useCallback(async () => {
    if (!user?.id) return

    const { data, error } = await supabase
      .schema("finance")
      .from("member_balances")
      .select("member_id, currency, balance_cents, last_transaction_at")
      .maybeSingle()

    if (error) {
      console.error("[FINANCE] Header balance query failed:", error)
      setState({ status: "error", message: "Balance unavailable" })
      return
    }

    if (!data) {
      setState({ status: "success", activity: "none", data: null })
      return
    }

    setState({
      status: "success",
      activity: "present",
      data: data as MemberBalanceRow,
    })
  }, [user?.id])

  useEffect(() => {
    if (authLoading || !user?.id) return

    const initialLoad = window.setTimeout(() => void loadBalance(), 0)

    const refresh = () => void loadBalance()
    window.addEventListener("finance:changed", refresh)

    return () => {
      window.clearTimeout(initialLoad)
      window.removeEventListener("finance:changed", refresh)
    }
  }, [authLoading, loadBalance, user?.id])

  if (authLoading || state.status === "loading") {
    return (
      <div
        aria-label="Loading financial balance"
        className="h-10 w-28 animate-pulse rounded-xl border border-white/8 bg-white/[0.04] sm:w-36"
      />
    )
  }

  if (state.status === "error") {
    return (
      <Link
        href="/portal/finances"
        className="flex min-h-10 items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-2.5 text-amber-200 transition hover:bg-amber-500/10 sm:px-3"
      >
        <WalletCards className="h-4 w-4 shrink-0" />
        <span className="text-[10px] font-medium leading-tight sm:text-xs">
          Balance unavailable
        </span>
      </Link>
    )
  }

  if (state.activity === "none") {
    return (
      <Link
        href="/portal/finances"
        className="flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-2.5 text-gray-300 transition hover:border-yellow-400/25 hover:text-white sm:px-3"
      >
        <WalletCards className="h-4 w-4 shrink-0 text-yellow-400" />
        <span className="text-[10px] font-medium leading-tight sm:text-xs">
          No finance activity
        </span>
      </Link>
    )
  }

  const amount = formatUsdFromCents(state.data.balance_cents, {
    showPositiveSign: true,
  })
  const meaning = getBalanceMeaningLabel(state.data.balance_cents)

  return (
    <Link
      href="/portal/finances"
      className="flex min-h-10 items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] px-2.5 transition hover:border-yellow-400/30 hover:bg-emerald-500/10 sm:px-3"
      aria-label={`Balance ${amount}. ${meaning}`}
    >
      <WalletCards className="hidden h-4 w-4 shrink-0 text-yellow-400 sm:block" />
      <span className="min-w-0 leading-tight">
        <span className="block text-xs font-semibold text-white sm:text-sm">
          {amount}
        </span>
        <span className="block whitespace-nowrap text-[9px] text-gray-400 sm:text-[10px]">
          {meaning}
        </span>
      </span>
    </Link>
  )
}
