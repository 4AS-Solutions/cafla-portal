import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AdminMemberStatement, StatementBalance } from "@/src/components/admin/finance/AdminMemberStatement"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { FinanceBadge as Badge } from "@/src/components/admin/finance/FinanceBadge"
import { RecordTransactionDialog } from "@/src/components/admin/finance/RecordTransactionDialog"
import { requireBoard } from "@/src/lib/auth/require-board"
import { getAdminMemberFinance } from "@/src/lib/finance/admin-queries"

export default async function AdminMemberFinancePage({ params }: { params: Promise<{ member_id: string }> }) {
  await requireBoard()
  const { member_id: memberId } = await params
  const result = await getAdminMemberFinance(memberId)

  if (result.status === "error") return <div className="space-y-6"><Link href="/admin/finance" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"><ArrowLeft size={16} />Finance Management</Link><div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-6"><h1 className="font-semibold text-amber-100">Financial statement unavailable</h1><p className="mt-1 text-sm text-amber-100/70">{result.message}</p></div></div>

  const { member, balanceCents, transactions } = result.data
  return <div className="space-y-7 pb-10">
    <Link href="/admin/finance" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"><ArrowLeft size={16} />Finance Management</Link>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><PortalPageHeader eyebrow="Board financial statement" title={member.full_name} subtitle={member.email} /><Badge variant="secondary" className="mt-3 w-fit">{member.status.toUpperCase()}</Badge></div><RecordTransactionDialog preselectedMember={member} /></div>
    <div className="max-w-xl"><StatementBalance value={balanceCents} /></div>
    <section className="space-y-3"><div><h2 className="text-lg font-semibold text-white">Complete transaction history</h2><p className="mt-1 text-sm text-gray-500">Immutable ledger activity and Board-only audit context.</p></div><AdminMemberStatement rows={transactions} /></section>
  </div>
}
