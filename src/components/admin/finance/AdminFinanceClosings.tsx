import Link from "next/link"
import { CalendarClock } from "lucide-react"

import { FinanceBadge as Badge } from "./FinanceBadge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { formatFinanceDate, formatFinanceDateTime } from "@/src/lib/finance/dates"
import { formatUsdFromCents } from "@/src/lib/finance/money"
import type { AdminFinanceClosing, AdminFinanceSnapshot, FinanceQueryResult } from "@/src/lib/finance/types"
import { EmptyState, ErrorState } from "./AdminFinanceBalances"
import { ExistingClosingWorkflow, NewClosingWorkflow } from "./ClosingWorkflow"

type ClosingResult = FinanceQueryResult<{
  closings: AdminFinanceClosing[]
  selectedClosing: AdminFinanceClosing | null
  snapshots: AdminFinanceSnapshot[]
}>

export function AdminFinanceClosings({ result }: { result: ClosingResult }) {
  if (result.status === "error") return <ErrorState message={result.message} />

  return <div className="space-y-6">
    <NewClosingWorkflow unavailablePeriods={[...new Set(result.data.closings.map((closing) => closing.period_end))]} />
    {result.data.closings.length === 0 ? <EmptyState title="No monthly closings" detail="Choose a month above to preview its first official closing." /> : <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
    <section className="space-y-3">
      <div><h2 className="text-lg font-semibold text-white">Closing history</h2><p className="mt-1 text-sm text-gray-500">All versions remain visible for Board audit.</p></div>
      {result.data.closings.map((closing) => <ClosingCard key={closing.id} closing={closing} selected={result.data.selectedClosing?.id === closing.id} />)}
    </section>
    <section className="space-y-3">
      <div><h2 className="text-lg font-semibold text-white">Closing snapshots</h2><p className="mt-1 text-sm text-gray-500">Select a version to inspect its recorded member balances.</p></div>
      {result.data.selectedClosing && <ExistingClosingWorkflow closing={result.data.selectedClosing} snapshots={result.data.snapshots} />}
      {!result.data.selectedClosing ? <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-12 text-center"><CalendarClock className="mx-auto h-8 w-8 text-gray-600" /><p className="mt-3 text-sm text-gray-400">Choose a closing version.</p></div> : result.data.snapshots.length === 0 ? <EmptyState title="No snapshots in this version" detail="This closing does not contain member balance snapshots." /> : <SnapshotList rows={result.data.snapshots} />}
    </section>
    </div>}
  </div>
}

function ClosingCard({ closing, selected }: { closing: AdminFinanceClosing; selected: boolean }) {
  const isCurrent = closing.status === "finalized"
  return <Link href={`/admin/finance?section=closings&closing=${closing.id}`} className={`block rounded-2xl border p-4 transition ${selected ? "border-yellow-400/35 bg-yellow-400/[0.07]" : "border-white/10 bg-[#0B0F0F]/70 hover:border-white/20"}`}>
    <div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-white">{formatFinanceDate(closing.period_end)}</p><p className="mt-1 text-xs text-gray-500">Version {closing.version} · {closing.snapshot_count} balances</p></div><div className="flex flex-wrap justify-end gap-2"><Badge variant="secondary">{closing.status.toUpperCase()}</Badge>{isCurrent && <Badge className="border border-yellow-400/25 bg-yellow-400/10 text-yellow-300">CURRENT OFFICIAL</Badge>}{closing.version > 1 && <Badge className="border border-blue-400/20 bg-blue-400/10 text-blue-200">RESTATED</Badge>}</div></div>
    {closing.finalized_at && <p className="mt-3 text-xs text-gray-400">Finalized {formatFinanceDateTime(closing.finalized_at)}</p>}
    {closing.restatement_reason && <p className="mt-2 text-xs text-gray-500">Reason: {closing.restatement_reason}</p>}
  </Link>
}

function SnapshotList({ rows }: { rows: AdminFinanceSnapshot[] }) {
  return <>
    <div className="space-y-2 md:hidden">{rows.map((row) => <Link key={row.id} href={`/admin/finance/members/${row.member_id}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0B0F0F]/70 p-3"><div><p className="font-medium text-white">{row.member.full_name}</p><p className="text-xs text-gray-500">{row.member.status}</p></div><p className="font-semibold text-white">{formatUsdFromCents(row.balance_cents, { showPositiveSign: true })}</p></Link>)}</div>
    <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/70 md:block"><Table><TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Official balance</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell><Link href={`/admin/finance/members/${row.member_id}`} className="font-medium text-white hover:text-yellow-300">{row.member.full_name}</Link></TableCell><TableCell className="text-gray-400">{row.member.status}</TableCell><TableCell className="text-right font-semibold text-white">{formatUsdFromCents(row.balance_cents, { showPositiveSign: true })}</TableCell></TableRow>)}</TableBody></Table></div>
  </>
}
