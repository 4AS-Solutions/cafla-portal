"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { formatFinanceDate, formatFinanceDateTime, monthValueToPeriodEnd } from "@/src/lib/finance/dates"
import { formatUsdFromCents } from "@/src/lib/finance/money"
import type { AdminClosingPreview, AdminFinanceClosing, AdminFinanceSnapshot } from "@/src/lib/finance/types"

type Mode = "initial" | "draft" | "restate"

export function NewClosingWorkflow({ unavailablePeriods }: { unavailablePeriods: string[] }) {
  const [month, setMonth] = useState("")
  const periodEnd = monthValueToPeriodEnd(month)
  const unavailable = periodEnd ? unavailablePeriods.includes(periodEnd) : false
  return <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/70 p-4 sm:p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h2 className="font-semibold text-white">Close a month</h2><p className="mt-1 text-sm text-gray-500">Preview balances before creating an official closing.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row"><Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="w-full border-white/10 bg-black/20 text-white sm:w-44" />{periodEnd && !unavailable && <ClosingWorkflow mode="initial" periodEnd={periodEnd} />}</div>
    </div>
    {unavailable && <p className="mt-3 text-sm text-amber-200/80">This month already has a closing. Select its version below to review or continue it.</p>}
  </div>
}

export function ExistingClosingWorkflow({ closing, snapshots }: { closing: AdminFinanceClosing; snapshots: AdminFinanceSnapshot[] }) {
  if (closing.status === "superseded") return null
  return <ClosingWorkflow mode={closing.status === "draft" ? "draft" : "restate"} periodEnd={closing.period_end} closing={closing} snapshots={snapshots} />
}

function ClosingWorkflow({ mode, periodEnd, closing, snapshots = [] }: { mode: Mode; periodEnd: string; closing?: AdminFinanceClosing; snapshots?: AdminFinanceSnapshot[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [preview, setPreview] = useState<AdminClosingPreview | null>(null)
  const [reason, setReason] = useState("")

  const diff = useMemo(() => buildDiff(preview, snapshots), [preview, snapshots])

  async function previewClosing() {
    setPending(true)
    try {
      const response = await fetch("/api/admin/finance/closings/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_end: periodEnd,
          preview_cutoff: mode === "draft" ? closing?.ledger_cutoff_at : undefined,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error ?? "Closing preview is unavailable.")
      setPreview(payload.preview)
      setOpen(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Closing preview is unavailable.")
    } finally {
      setPending(false)
    }
  }

  async function confirm(event: React.FormEvent) {
    event.preventDefault()
    if (!preview || pending) return
    setPending(true)
    try {
      if (mode === "draft") {
        await post(`/api/admin/finance/closings/${closing?.id}/finalize`, {})
      } else if (mode === "restate") {
        await post("/api/admin/finance/closings/restate", { period_end: periodEnd, preview_cutoff: preview.preview_cutoff, restatement_reason: reason })
      } else {
        const created = await post("/api/admin/finance/closings", { period_end: periodEnd, preview_cutoff: preview.preview_cutoff })
        const closingId = created?.closing?.id
        if (!closingId) throw new Error("The draft was created, but its identifier was unavailable. Refresh and resume the visible draft.")
        try {
          await post(`/api/admin/finance/closings/${closingId}/finalize`, {})
        } catch (error) {
          throw new Error(`The draft was created but could not be finalized. Refresh and use Finalize Draft. ${error instanceof Error ? error.message : ""}`.trim())
        }
      }
      toast.success(mode === "restate" ? "Closing restated successfully." : "Closing finalized successfully.")
      setOpen(false)
      setPreview(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete the closing.")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const label = mode === "initial" ? "Preview Closing" : mode === "draft" ? "Review Draft" : "Restate Closing"
  return <>
    {mode === "draft" ? <div className="flex flex-wrap gap-2"><Button onClick={previewClosing} disabled={pending} className={subtleButton}>{pending && <Loader2 className="animate-spin" />}Review Draft</Button><Button onClick={previewClosing} disabled={pending} className="bg-yellow-400 text-black hover:bg-yellow-300">Finalize Draft</Button></div> : <Button onClick={previewClosing} disabled={pending} className={mode === "restate" ? subtleButton : "bg-yellow-400 text-black hover:bg-yellow-300"}>{pending && <Loader2 className="animate-spin" />}{label}</Button>}
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-[#07100E] p-0 text-white sm:max-w-4xl">
        <DialogHeader className="border-b border-white/10 px-5 py-5 sm:px-6"><DialogTitle>{mode === "restate" ? "Restatement preview" : mode === "draft" ? "Review existing draft" : "Closing preview"}</DialogTitle><DialogDescription>{preview ? `${formatFinanceDate(preview.period_end)} · cutoff ${formatFinanceDateTime(preview.preview_cutoff)} · ${preview.rows.length} financial accounts` : "Loading preview…"}</DialogDescription></DialogHeader>
        {preview && <form onSubmit={confirm} className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
          {mode === "restate" && <DiffSummary changed={diff.changed} unchanged={diff.unchanged} />}
          <PreviewRows preview={preview} mode={mode} snapshots={snapshots} />
          {mode === "restate" && <div className="space-y-2"><label className="text-sm font-medium text-white">Restatement reason <span className="text-gray-500">· Board audit</span></label><Textarea required value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} placeholder="Explain why this official month must be restated" /></div>}
          <p className="rounded-xl border border-yellow-400/15 bg-yellow-400/[0.05] p-3 text-sm text-gray-300">You are about to {mode === "restate" ? "replace the current official version without deleting its history" : `finalize the official financial balances for ${formatFinanceDate(periodEnd)}`}. The exact preview cutoff shown above will be used.</p>
          <DialogFooter><Button type="button" className={subtleButton} disabled={pending} onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={pending || (mode === "restate" && !reason.trim())} className="bg-yellow-400 text-black hover:bg-yellow-300">{pending && <Loader2 className="animate-spin" />}{pending ? "Processing…" : mode === "restate" ? "Confirm Restatement" : "Finalize Official Balances"}</Button></DialogFooter>
        </form>}
      </DialogContent>
    </Dialog>
  </>
}

async function post(url: string, body: object) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.error ?? "Finance closing operation failed.")
  return payload
}

function PreviewRows({ preview, mode, snapshots }: { preview: AdminClosingPreview; mode: Mode; snapshots: AdminFinanceSnapshot[] }) {
  const official = new Map(snapshots.map((row) => [`${row.member_id}:${row.currency}`, BigInt(row.balance_cents)]))
  const previewKeys = new Set(preview.rows.map((row) => `${row.id}:${row.currency}`))
  const removed = mode === "restate" ? snapshots.filter((row) => !previewKeys.has(`${row.member_id}:${row.currency}`)) : []
  return <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">{preview.rows.map((row) => {
    const current = official.get(`${row.id}:${row.currency}`)
    const proposed = BigInt(row.balance_cents)
    return <div key={`${row.id}:${row.currency}`} className={`grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 ${mode === "restate" ? "sm:grid-cols-4" : "sm:grid-cols-[1fr_auto]"}`}><div className="min-w-0"><p className="truncate font-medium text-white">{row.full_name}</p><p className="text-xs text-gray-500">{row.status}</p></div>{mode === "restate" && <Amount label="Current" value={current} /> }<Amount label="Proposed" value={proposed} />{mode === "restate" && <Amount label="Difference" value={proposed - (current ?? BigInt(0))} />}</div>
  })}{removed.map((row) => <div key={`removed:${row.id}`} className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 sm:grid-cols-4"><div><p className="font-medium text-white">{row.member.full_name}</p><p className="text-xs text-gray-500">{row.member.status}</p></div><Amount label="Current" value={BigInt(row.balance_cents)} /><Amount label="Proposed" value={undefined} /><Amount label="Difference" value={-BigInt(row.balance_cents)} /></div>)}{preview.rows.length === 0 && removed.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No applicable Finance transactions for this period.</p>}</div>
}

function Amount({ label, value }: { label: string; value: bigint | undefined }) { return <div className="sm:text-right"><p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p><p className="whitespace-nowrap font-semibold text-white">{value === undefined ? "Not included" : formatUsdFromCents(value, { showPositiveSign: true })}</p></div> }
function buildDiff(preview: AdminClosingPreview | null, snapshots: AdminFinanceSnapshot[]) {
  if (!preview) return { changed: 0, unchanged: 0 }
  const old = new Map(snapshots.map((row) => [`${row.member_id}:${row.currency}`, BigInt(row.balance_cents)]))
  let changed = 0
  let unchanged = 0
  for (const row of preview.rows) {
    if (old.get(`${row.id}:${row.currency}`) === BigInt(row.balance_cents)) unchanged += 1
    else changed += 1
  }
  for (const key of old.keys()) {
    if (!preview.rows.some((row) => `${row.id}:${row.currency}` === key)) changed += 1
  }
  return { changed, unchanged }
}
function DiffSummary({ changed, unchanged }: { changed: number; unchanged: number }) { return <div className="flex flex-wrap gap-3 text-sm"><span className="rounded-lg border border-yellow-400/15 bg-yellow-400/[0.05] px-3 py-2 text-yellow-100">Accounts changed: {changed}</span><span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-gray-300">Unchanged: {unchanged}</span></div> }
const subtleButton = "border border-white/10 bg-white/[0.03] text-gray-300 hover:border-yellow-400/25 hover:bg-white/[0.06] hover:text-white focus-visible:ring-yellow-400/40"
