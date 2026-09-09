import { CircleDollarSign, WalletCards } from "lucide-react"

import { Card, CardContent } from "@/src/components/ui/card"
import {
  formatUsdFromCents,
  getBalanceMeaning,
  getBalanceMeaningLabel,
} from "@/src/lib/finance/money"
import type { MemberBalanceResult } from "@/src/lib/finance/types"

export function MemberBalanceCard({ balance }: { balance: MemberBalanceResult }) {
  if (balance.status === "error") {
    return (
      <Card className="border-amber-500/20 bg-amber-500/[0.06]">
        <CardContent>
          <p className="font-semibold text-amber-100">Balance unavailable</p>
          <p className="mt-1 text-sm text-amber-100/70">{balance.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (balance.activity === "none") {
    return (
      <Card>
        <CardContent className="flex items-start gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <WalletCards className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Current balance
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">No financial activity</p>
            <p className="mt-1 text-sm text-gray-400">
              Your Finance ledger does not contain any transactions yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const meaning = getBalanceMeaning(balance.data.balance_cents)
  const amount = formatUsdFromCents(balance.data.balance_cents, {
    showPositiveSign: true,
  })
  const tone = meaning === "member_owes_cafla"
    ? "border-amber-500/20 bg-amber-500/[0.055]"
    : meaning === "cafla_owes_member"
      ? "border-emerald-500/20 bg-emerald-500/[0.055]"
      : "border-white/10 bg-white/[0.035]"

  return (
    <Card className={tone}>
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Current balance
          </p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {amount}
          </p>
          <p className="mt-2 text-sm font-medium text-gray-200 sm:text-base">
            {getBalanceMeaningLabel(balance.data.balance_cents, { includeAmount: true })}
          </p>
        </div>

        <CircleDollarSign className="h-12 w-12 text-yellow-400/80 sm:h-16 sm:w-16" />
      </CardContent>
    </Card>
  )
}
