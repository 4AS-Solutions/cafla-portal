import Link from "next/link"

import QueryFilters from "@/src/components/shared/filters/QueryFilter"
import Pagination from "@/src/components/shared/pagination/Pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { formatFinanceDate, formatFinanceDateTime } from "@/src/lib/finance/dates"
import { formatUsdFromCents, getPaymentMethodLabel, getTransactionTypeLabel } from "@/src/lib/finance/money"
import { ADMIN_PAYMENT_METHOD_OPTIONS, ADMIN_TRANSACTION_TYPE_OPTIONS } from "@/src/lib/finance/admin-queries"
import type { AdminFinancePageResult, AdminFinanceTransaction } from "@/src/lib/finance/types"
import { EmptyState, ErrorState } from "./AdminFinanceBalances"

export function AdminFinanceTransactions({ result, page, limit }: { result: AdminFinancePageResult<AdminFinanceTransaction>; page: number; limit: number }) {
  return <section className="space-y-5">
    <QueryFilters preserveOnReset={["section"]} filters={[
      { type: "search", key: "search", placeholder: "Member, email or description..." },
      { type: "select", key: "type", placeholder: "Transaction type", options: ADMIN_TRANSACTION_TYPE_OPTIONS.map((value) => ({ value, label: getTransactionTypeLabel(value) })) },
      { type: "select", key: "payment", placeholder: "Payment method", options: ADMIN_PAYMENT_METHOD_OPTIONS.map((value) => ({ value, label: getPaymentMethodLabel(value) ?? value })) },
      { type: "date", key: "from" }, { type: "date", key: "to" },
    ]} />
    {result.status === "error" ? <ErrorState message={result.message} /> : result.data.rows.length === 0 ? <EmptyState title="No transactions found" detail="No immutable ledger rows match the current filters." /> : <>
      <div className="space-y-3 md:hidden">{result.data.rows.map((row) => <TransactionCard key={row.id} row={row} />)}</div>
      <div className="hidden overflow-x-auto rounded-2xl border border-white/10 bg-[#0B0F0F]/70 md:block"><Table>
        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Member</TableHead><TableHead>Transaction</TableHead><TableHead>Payment method</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Created at</TableHead></TableRow></TableHeader>
        <TableBody>{result.data.rows.map((row) => <TableRow key={row.id}>
          <TableCell className="whitespace-nowrap text-gray-400">{formatFinanceDate(row.transaction_date)}</TableCell>
          <TableCell><Link href={`/admin/finance/members/${row.member_id}`} className="font-medium text-white hover:text-yellow-300">{row.member.full_name}</Link><p className="text-xs text-gray-500">{row.member.email}</p></TableCell>
          <TableCell><p className="text-white">{row.description}</p><p className="text-xs text-gray-500">{getTransactionTypeLabel(row.transaction_type)}</p></TableCell>
          <TableCell>{getPaymentMethodLabel(row.payment_method) ?? "—"}</TableCell>
          <TableCell className="text-right font-semibold text-white">{formatUsdFromCents(row.amount_cents, { showPositiveSign: true })}</TableCell>
          <TableCell className="whitespace-nowrap text-gray-400">{formatFinanceDateTime(row.created_at)}</TableCell>
        </TableRow>)}</TableBody>
      </Table></div>
      <Pagination currentPage={page} totalItems={result.data.count} itemsPerPage={limit} basePath="/admin/finance" />
    </>}
  </section>
}

function TransactionCard({ row }: { row: AdminFinanceTransaction }) {
  return <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/70 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`/admin/finance/members/${row.member_id}`} className="font-semibold text-white hover:text-yellow-300">{row.member.full_name}</Link><p className="truncate text-xs text-gray-500">{row.description}</p></div><p className="shrink-0 font-semibold text-white">{formatUsdFromCents(row.amount_cents, { showPositiveSign: true })}</p></div><div className="mt-3 flex justify-between gap-3 text-xs text-gray-400"><span>{formatFinanceDate(row.transaction_date)} · {getTransactionTypeLabel(row.transaction_type)}</span><span>{getPaymentMethodLabel(row.payment_method) ?? "No payment method"}</span></div></div>
}
