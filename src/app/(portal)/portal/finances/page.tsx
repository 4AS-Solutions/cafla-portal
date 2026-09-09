import { MemberBalanceCard } from "@/src/components/finance/MemberBalanceCard"
import { MemberMonthlyHistory } from "@/src/components/finance/MemberMonthlyHistory"
import { MemberTransactionHistory } from "@/src/components/finance/MemberTransactionHistory"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { requireUser } from "@/src/lib/auth/require-user"
import { getMemberFinanceData } from "@/src/lib/finance/member-queries"

export default async function FinancesPage() {
  await requireUser()
  const finance = await getMemberFinanceData()

  return (
    <div className="space-y-8 pb-10">
      <PortalPageHeader
        eyebrow="Personal finances"
        title="Finances"
        subtitle="Understand your current balance and review the activity behind it."
      />

      <div className="max-w-3xl">
        <MemberBalanceCard balance={finance.balance} />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Transaction history</h2>
          <p className="mt-1 text-sm text-gray-500">
            Payments, fees, credits and corrections recorded on your account.
          </p>
        </div>
        <MemberTransactionHistory result={finance.transactions} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Official monthly balance history</h2>
          <p className="mt-1 text-sm text-gray-500">
            The current official finalized balance for each available month.
          </p>
        </div>
        <MemberMonthlyHistory result={finance.monthlyHistory} />
      </section>
    </div>
  )
}
