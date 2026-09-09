import Link from "next/link"
import { WalletCards } from "lucide-react"

import QueryFilters from "@/src/components/shared/filters/QueryFilter"
import Pagination from "@/src/components/shared/pagination/Pagination"
import { FinanceBadge as Badge } from "./FinanceBadge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { formatFinanceDateTime } from "@/src/lib/finance/dates"
import { formatUsdFromCents, getAdminBalanceMeaningLabel } from "@/src/lib/finance/money"
import type { AdminFinancePageResult, AdminFinanceBalance } from "@/src/lib/finance/types"

export function AdminFinanceBalances({
  result,
  page,
  limit,
}: {
  result: AdminFinancePageResult<AdminFinanceBalance>
  page: number
  limit: number
}) {
  return (
    <section className="space-y-5">
      <QueryFilters preserveOnReset={["section"]} filters={[
        { type: "search", key: "search", placeholder: "Search name or email..." },
        { type: "select", key: "status", placeholder: "Membership status", options: [
          { label: "Active", value: "active" },
          { label: "Invited", value: "invited" },
          { label: "Inactive", value: "inactive" },
          { label: "Suspended", value: "suspended" },
        ] },
        { type: "select", key: "balance", placeholder: "Balance state", options: [
          { label: "Owes CAFLA", value: "owes" },
          { label: "CAFLA owes member", value: "owed" },
          { label: "Balanced", value: "balanced" },
        ] },
      ]} />

      {result.status === "error" ? <ErrorState message={result.message} /> : result.data.rows.length === 0 ? (
        <EmptyState title="No Finance accounts found" detail="No ledger activity matches the current filters." />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {result.data.rows.map((row) => <BalanceCard key={row.id} row={row} />)}
          </div>
          <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/70 md:block">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Member</TableHead><TableHead>Status</TableHead>
                <TableHead className="text-right">Current balance</TableHead>
                <TableHead>Meaning</TableHead><TableHead>Last activity</TableHead>
              </TableRow></TableHeader>
              <TableBody>{result.data.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell><MemberLink row={row} /></TableCell>
                  <TableCell><Badge className="border border-white/10 bg-white/[0.05] text-gray-300">{row.status.toUpperCase()}</Badge></TableCell>
                  <TableCell className="text-right font-semibold text-white">{formatUsdFromCents(row.balance_cents, { showPositiveSign: true })}</TableCell>
                  <TableCell className="text-gray-300">{getAdminBalanceMeaningLabel(row.balance_cents)}</TableCell>
                  <TableCell className="whitespace-nowrap text-gray-400">{formatFinanceDateTime(row.last_transaction_at)}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </div>
          <Pagination currentPage={page} totalItems={result.data.count} itemsPerPage={limit} basePath="/admin/finance" />
        </>
      )}
    </section>
  )
}

function MemberLink({ row }: { row: AdminFinanceBalance }) {
  return <Link href={`/admin/finance/members/${row.id}`} className="font-medium text-white hover:text-yellow-300">
    <span className="block">{row.full_name}</span><span className="block text-xs font-normal text-gray-500">{row.email}</span>
  </Link>
}

function BalanceCard({ row }: { row: AdminFinanceBalance }) {
  return <Link href={`/admin/finance/members/${row.id}`} className="block rounded-2xl border border-white/10 bg-[#0B0F0F]/70 p-4 hover:border-yellow-400/25">
    <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-white">{row.full_name}</p><p className="text-xs text-gray-500">{row.email}</p></div><Badge className="border border-white/10 bg-white/[0.05] text-gray-300">{row.status}</Badge></div>
    <div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-xl font-semibold text-white">{formatUsdFromCents(row.balance_cents, { showPositiveSign: true })}</p><p className="text-xs text-gray-400">{getAdminBalanceMeaningLabel(row.balance_cents)}</p></div><p className="text-right text-xs text-gray-500">{formatFinanceDateTime(row.last_transaction_at)}</p></div>
  </Link>
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-10 text-center"><WalletCards className="mx-auto h-8 w-8 text-gray-600" /><p className="mt-3 font-medium text-gray-300">{title}</p><p className="mt-1 text-sm text-gray-500">{detail}</p></div>
}

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-8"><p className="font-semibold text-amber-100">Finance data unavailable</p><p className="mt-1 text-sm text-amber-100/70">{message}</p></div>
}
