import { Badge } from "@/src/components/ui/badge"
import { formatFinanceDateTime, formatFinanceMonth } from "@/src/lib/finance/dates"
import { formatUsdFromCents, getBalanceMeaningLabel } from "@/src/lib/finance/money"
import type { MemberFinanceData } from "@/src/lib/finance/types"

export function MemberMonthlyHistory({
  result,
}: {
  result: MemberFinanceData["monthlyHistory"]
}) {
  if (result.status === "error") {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-8">
        <p className="font-semibold text-amber-100">Monthly history unavailable</p>
        <p className="mt-1 text-sm text-amber-100/70">{result.message}</p>
      </div>
    )
  }

  if (result.data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-10 text-center">
        <p className="font-medium text-gray-300">No official monthly balances yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Finalized monthly balances will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/70">
      {result.data.map((closing) => (
        <div
          key={`${closing.period_end}-${closing.version}`}
          className="flex flex-col gap-3 border-b border-white/6 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-white">{formatFinanceMonth(closing.period_end)}</p>
              {closing.is_restated && (
                <Badge className="border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
                  Restated · v{closing.version}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Finalized {formatFinanceDateTime(closing.finalized_at)}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-lg font-semibold text-white">
              {formatUsdFromCents(closing.balance_cents, { showPositiveSign: true })}
            </p>
            <p className="text-xs text-gray-400">
              {getBalanceMeaningLabel(closing.balance_cents)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
