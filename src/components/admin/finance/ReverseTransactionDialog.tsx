"use client"

import { useState } from "react"
import { Loader2, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { formatFinanceDate, getTodayInLosAngeles } from "@/src/lib/finance/dates"
import { formatUsdFromCents, getTransactionTypeLabel } from "@/src/lib/finance/money"
import type { AdminFinanceTransaction } from "@/src/lib/finance/types"

export function ReverseTransactionDialog({ transaction }: { transaction: AdminFinanceTransaction }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [idempotencyKey, setIdempotencyKey] = useState("")

  function handleOpenChange(next: boolean) {
    if (pending) return
    if (next && !open) setIdempotencyKey(crypto.randomUUID())
    setOpen(next)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = new FormData(event.currentTarget)
    setPending(true)
    try {
      const response = await fetch(`/api/admin/finance/transactions/${transaction.id}/reverse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_date: form.get("transaction_date"),
          description: form.get("description"),
          reversal_reason: form.get("reversal_reason"),
          internal_notes: form.get("internal_notes") || null,
          idempotency_key: idempotencyKey,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error ?? "Unable to reverse the transaction.")

      toast.success("Transaction reversed successfully.")
      window.dispatchEvent(new Event("finance:changed"))
      setOpen(false)
      setIdempotencyKey("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reverse the transaction.")
    } finally {
      setPending(false)
    }
  }

  return <Dialog open={open} onOpenChange={handleOpenChange}>
    <DialogTrigger asChild><Button size="sm" variant="ghost" className="border border-white/10 bg-white/[0.02] text-gray-400 hover:border-yellow-400/25 hover:bg-white/[0.06] hover:text-white focus-visible:ring-yellow-400/40 disabled:text-gray-600"><RotateCcw />Reverse transaction</Button></DialogTrigger>
    <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-[#07100E] text-white sm:max-w-xl">
      <DialogHeader><DialogTitle>Reverse transaction</DialogTitle><DialogDescription>This will not delete or edit the original transaction. A new correcting ledger entry will be created.</DialogDescription></DialogHeader>
      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2"><div><p className="text-xs text-gray-500">Original</p><p className="font-medium text-white">{getTransactionTypeLabel(transaction.transaction_type)}</p><p className="text-xs text-gray-400">{formatFinanceDate(transaction.transaction_date)}</p></div><div className="sm:text-right"><p className="text-xs text-gray-500">Original amount</p><p className="font-semibold text-white">{formatUsdFromCents(transaction.amount_cents, { showPositiveSign: true })}</p><p className="mt-2 text-xs text-gray-500">Reversal effect</p><p className="font-semibold text-yellow-300">{formatUsdFromCents(-BigInt(transaction.amount_cents), { showPositiveSign: true })}</p></div></div>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Reversal date"><Input name="transaction_date" type="date" required defaultValue={getTodayInLosAngeles()} /></Field>
        <Field label="Public description" hint="Visible to the member"><Input name="description" required maxLength={500} defaultValue={`Reversal: ${transaction.description}`} /></Field>
        <Field label="Reversal reason" hint="Required · Board only"><Textarea name="reversal_reason" required maxLength={1000} /></Field>
        <Field label="Internal note" hint="Optional · Board only"><Textarea name="internal_notes" maxLength={2000} /></Field>
        <DialogFooter><Button type="button" variant="ghost" className="border border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.06] hover:text-white focus-visible:ring-yellow-400/40" disabled={pending} onClick={() => handleOpenChange(false)}>Cancel</Button><Button type="submit" disabled={pending || !idempotencyKey} className="bg-yellow-400 text-black hover:bg-yellow-300">{pending && <Loader2 className="animate-spin" />}{pending ? "Reversing..." : "Confirm reversal"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><div className="flex items-baseline justify-between gap-2"><Label>{label}</Label>{hint && <span className="text-xs text-gray-500">{hint}</span>}</div>{children}</div>
}
