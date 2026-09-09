"use client"

import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { getTodayInLosAngeles } from "@/src/lib/finance/dates"
import type { AdminFinanceMember } from "@/src/lib/finance/types"

const types = [
  { value: "payment", label: "Payment" },
  { value: "annual_membership_fee", label: "Annual Membership Fee" },
  { value: "manual_charge", label: "Manual Charge" },
  { value: "manual_credit", label: "Manual Credit" },
  { value: "adjustment", label: "Adjustment" },
] as const

type TransactionType = (typeof types)[number]["value"]

const defaultDescriptions: Record<TransactionType, string> = {
  payment: "Payment received",
  annual_membership_fee: `${new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "America/Los_Angeles" }).format(new Date())} Annual Membership Fee`,
  manual_charge: "Manual charge",
  manual_credit: "Manual credit",
  adjustment: "Balance adjustment",
}

export function RecordTransactionDialog({ members, preselectedMember }: { members?: AdminFinanceMember[]; preselectedMember?: AdminFinanceMember }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [idempotencyKey, setIdempotencyKey] = useState("")
  const [type, setType] = useState<TransactionType>("payment")
  const [description, setDescription] = useState(defaultDescriptions.payment)

  function handleOpenChange(next: boolean) {
    if (pending) return
    if (next && !open) setIdempotencyKey(crypto.randomUUID())
    setOpen(next)
  }

  function changeType(next: TransactionType) {
    setType(next)
    setDescription(defaultDescriptions[next])
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = new FormData(event.currentTarget)
    setPending(true)
    try {
      const response = await fetch("/api/admin/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: preselectedMember?.id ?? form.get("member_id"),
          transaction_type: type,
          amount: form.get("amount"),
          transaction_date: form.get("transaction_date"),
          description,
          internal_notes: form.get("internal_notes") || null,
          payment_method: type === "payment" ? form.get("payment_method") : null,
          adjustment_direction: type === "adjustment" ? form.get("adjustment_direction") : null,
          idempotency_key: idempotencyKey,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error ?? "Unable to record the transaction.")

      toast.success(type === "payment" ? "Payment recorded successfully." : "Transaction recorded successfully.")
      window.dispatchEvent(new Event("finance:changed"))
      setOpen(false)
      setIdempotencyKey("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to record the transaction.")
    } finally {
      setPending(false)
    }
  }

  const noMembers = !preselectedMember && (!members || members.length === 0)
  return <Dialog open={open} onOpenChange={handleOpenChange}>
    <DialogTrigger asChild><Button disabled={noMembers} className="bg-yellow-400 text-black hover:bg-yellow-300"><Plus />Record Transaction</Button></DialogTrigger>
    <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-[#07100E] text-white sm:max-w-xl">
      <DialogHeader><DialogTitle>Record Transaction</DialogTitle><DialogDescription>Create a new immutable Finance ledger entry.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-5">
        {preselectedMember ? <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><p className="font-medium text-white">{preselectedMember.full_name}</p><p className="text-xs text-gray-500">{preselectedMember.email} · {preselectedMember.status}</p></div> : <Field label="Member"><select name="member_id" required defaultValue="" className={selectClass}><option value="" disabled>Select a member</option>{members?.map((member) => <option key={member.id} value={member.id}>{member.full_name} — {member.email} ({member.status})</option>)}</select></Field>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Transaction type"><select value={type} onChange={(event) => changeType(event.target.value as TransactionType)} className={selectClass}>{types.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
          <Field label="Amount (USD)"><Input name="amount" required inputMode="decimal" placeholder="0.00" autoComplete="off" /></Field>
          <Field label="Transaction date"><Input name="transaction_date" type="date" required defaultValue={getTodayInLosAngeles()} /></Field>
          {type === "payment" && <Field label="Payment method"><select name="payment_method" required defaultValue="" className={selectClass}><option value="" disabled>Select method</option><option value="zelle">Zelle</option><option value="cash">Cash</option><option value="check">Check</option><option value="other">Other</option></select></Field>}
          {type === "adjustment" && <Field label="Adjustment direction"><select name="adjustment_direction" required defaultValue="" className={selectClass}><option value="" disabled>Select direction</option><option value="member_owes_cafla">Member owes CAFLA</option><option value="cafla_owes_member">CAFLA owes member</option></select></Field>}
        </div>
        <Field label="Description" hint="Visible to the member"><Input value={description} onChange={(event) => setDescription(event.target.value)} required maxLength={500} /></Field>
        <Field label="Internal note" hint="Board only"><Textarea name="internal_notes" maxLength={2000} placeholder="Optional internal context" /></Field>
        <DialogFooter><Button type="button" variant="ghost" className="border border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.06] hover:text-white focus-visible:ring-yellow-400/40" disabled={pending} onClick={() => handleOpenChange(false)}>Cancel</Button><Button type="submit" disabled={pending || !idempotencyKey} className="bg-yellow-400 text-black hover:bg-yellow-300">{pending && <Loader2 className="animate-spin" />}{pending ? "Recording..." : "Record Transaction"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><div className="flex items-baseline justify-between gap-2"><Label>{label}</Label>{hint && <span className="text-xs text-gray-500">{hint}</span>}</div>{children}</div>
}

const selectClass = "flex h-9 w-full rounded-md border border-input bg-[#07100E] px-2.5 text-sm text-white outline-none focus:border-yellow-400/50"
