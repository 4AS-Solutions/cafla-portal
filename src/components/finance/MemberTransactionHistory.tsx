import { ReceiptText } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { formatFinanceDate } from "@/src/lib/finance/dates"
import {
  formatUsdFromCents,
  getPaymentMethodLabel,
  getTransactionTypeLabel,
} from "@/src/lib/finance/money"
import type {
  MemberFinanceData,
  MemberTransactionRow,
} from "@/src/lib/finance/types"

export function MemberTransactionHistory({
  result,
}: {
  result: MemberFinanceData["transactions"]
}) {
  if (result.status === "error") {
    return <UnavailableState message={result.message} />
  }

  if (result.data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-10 text-center">
        <ReceiptText className="mx-auto h-8 w-8 text-gray-600" />
        <p className="mt-3 font-medium text-gray-300">No transactions yet</p>
        <p className="mt-1 text-sm text-gray-500">Financial activity will appear here.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {result.data.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Payment method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="whitespace-nowrap text-gray-400">
                  {formatFinanceDate(transaction.transaction_date)}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-white">{transaction.description}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {getTransactionTypeLabel(transaction.transaction_type)}
                  </p>
                </TableCell>
                <TableCell>{getPaymentMethodLabel(transaction.payment_method) ?? "—"}</TableCell>
                <TableCell className="text-right font-semibold text-white">
                  {formatUsdFromCents(transaction.amount_cents, { showPositiveSign: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

function TransactionCard({
  transaction,
}: {
  transaction: MemberTransactionRow
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/70 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-white">{transaction.description}</p>
          <p className="mt-1 text-xs text-gray-500">
            {formatFinanceDate(transaction.transaction_date)} · {getTransactionTypeLabel(transaction.transaction_type)}
          </p>
          {transaction.payment_method && (
            <p className="mt-1 text-xs text-gray-400">
              {getPaymentMethodLabel(transaction.payment_method)}
            </p>
          )}
        </div>
        <p className="shrink-0 font-semibold text-white">
          {formatUsdFromCents(transaction.amount_cents, { showPositiveSign: true })}
        </p>
      </div>
    </div>
  )
}

function UnavailableState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-8">
      <p className="font-semibold text-amber-100">Transaction history unavailable</p>
      <p className="mt-1 text-sm text-amber-100/70">{message}</p>
    </div>
  )
}
