import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { AdminFinanceBalances } from "@/src/components/admin/finance/AdminFinanceBalances"
import { AdminFinanceClosings } from "@/src/components/admin/finance/AdminFinanceClosings"
import { FinanceSectionTabs } from "@/src/components/admin/finance/FinanceSectionTabs"
import { AdminFinanceTransactions } from "@/src/components/admin/finance/AdminFinanceTransactions"
import { RecordTransactionDialog } from "@/src/components/admin/finance/RecordTransactionDialog"
import { FileSpreadsheet, UserRoundSearch } from "lucide-react"
import Link from "next/link"
import { requireBoard } from "@/src/lib/auth/require-board"
import { getAdminFinanceBalances, getAdminFinanceClosings, getAdminFinanceMembers, getAdminFinanceTransactions } from "@/src/lib/finance/admin-queries"

const PAGE_SIZE = 20

type FinanceSearchParams = {
  section?: string; search?: string; status?: string; balance?: string; type?: string
  payment?: string; from?: string; to?: string; page?: string; closing?: string
}

export default async function AdminFinancePage({ searchParams }: { searchParams: Promise<FinanceSearchParams> }) {
  await requireBoard()
  const params = await searchParams
  const section = ["balances", "transactions", "closings"].includes(params.section ?? "") ? params.section! : "balances"
  const parsedPage = Number(params.page ?? 0)
  const page = Number.isInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0
  const members = await getAdminFinanceMembers()

  const content = section === "transactions"
    ? <AdminFinanceTransactions page={page} limit={PAGE_SIZE} result={await getAdminFinanceTransactions({ search: params.search, transactionType: params.type, paymentMethod: params.payment, dateFrom: params.from, dateTo: params.to, page, limit: PAGE_SIZE })} />
    : section === "closings"
      ? <AdminFinanceClosings result={await getAdminFinanceClosings(params.closing)} />
      : <AdminFinanceBalances page={page} limit={PAGE_SIZE} result={await getAdminFinanceBalances({ search: params.search, status: params.status, balance: params.balance, page, limit: PAGE_SIZE })} />

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><PortalPageHeader eyebrow="Board Tools" title="Finance Management" subtitle="Manage member balances, ledger activity and official monthly financial history." /><div className="flex shrink-0 flex-wrap gap-2"><Link href="/admin/finance/unregistered" className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-900/40 bg-[#0b1513] px-4 text-sm font-medium text-white transition hover:border-yellow-400/40 hover:text-yellow-300"><UserRoundSearch size={16}/>Pending Accounts</Link><Link href="/admin/finance/arbiter-fees" className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-900/40 bg-[#0b1513] px-4 text-sm font-medium text-white transition hover:border-yellow-400/40 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40"><FileSpreadsheet size={16} />Import Arbiter Fees</Link><RecordTransactionDialog members={members.status === "success" ? members.data : []} />{members.status === "error" && <p className="mt-2 w-full text-xs text-amber-300">Member selector unavailable</p>}</div></div>
    <FinanceSectionTabs active={section} />
    {content}
  </div>
}
