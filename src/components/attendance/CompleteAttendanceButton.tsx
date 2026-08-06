"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"

type AttendanceSummary = {
  total: number
  marked: number
  present: number
  late: number
  excused: number
  unmarked: number
  absent: number
}

type CompleteAttendanceButtonProps = {
  sessionId: string
  sessionTitle: string
}

export default function CompleteAttendanceButton({
  sessionId,
  sessionTitle,
}: CompleteAttendanceButtonProps) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loadingPreview, setLoadingPreview] =
    useState(false)
  const [completing, setCompleting] =
    useState(false)

  const [summary, setSummary] =
    useState<AttendanceSummary | null>(null)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  async function loadCompletionPreview() {
    setLoadingPreview(true)
    setErrorMessage(null)

    try {
      const response = await fetch(
        `/api/admin/attendance/${sessionId}/complete`,
        {
          method: "GET",
          cache: "no-store",
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to review attendance."
        )
      }

      setSummary(result.summary)
      setOpen(true)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to review attendance."
      )
    } finally {
      setLoadingPreview(false)
    }
  }

  async function completeSession() {
    setCompleting(true)
    setErrorMessage(null)

    try {
      const response = await fetch(
        `/api/admin/attendance/${sessionId}/complete`,
        {
          method: "POST",
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to complete attendance."
        )
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete attendance."
      )
    } finally {
      setCompleting(false)
    }
  }

  function handleDialogChange(
    nextOpen: boolean
  ) {
    if (completing) return

    setOpen(nextOpen)

    if (!nextOpen) {
      setSummary(null)
      setErrorMessage(null)
    }
  }

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          onClick={loadCompletionPreview}
          disabled={loadingPreview}
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-emerald-500
            px-5
            py-2.5
            text-sm
            font-semibold
            text-black
            transition
            hover:bg-emerald-400
            disabled:cursor-not-allowed
            disabled:opacity-60
            sm:w-auto
          "
        >
          {loadingPreview ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}

          {loadingPreview
            ? "Reviewing..."
            : "Complete Session"}
        </button>

        {errorMessage && !open && (
          <p className="max-w-sm text-sm text-red-400">
            {errorMessage}
          </p>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={handleDialogChange}
      >
        <DialogContent
          className="
            w-[95vw]
            max-w-lg
            rounded-2xl
            border
            border-white/10
            bg-[#07100E]
            p-0
            text-white
            shadow-2xl
          "
        >
          <DialogHeader className="border-b border-white/10 px-5 py-5 text-left sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>

              <div>
                <DialogTitle className="text-lg text-white">
                  Complete Attendance
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm text-gray-400">
                  Review the final attendance totals before closing this session.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">
                Session
              </p>

              <p className="mt-1 font-semibold text-white">
                {sessionTitle}
              </p>
            </div>

            {summary && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <SummaryItem
                    label="Present"
                    value={summary.present}
                  />

                  <SummaryItem
                    label="Late"
                    value={summary.late}
                  />

                  <SummaryItem
                    label="Excused"
                    value={summary.excused}
                  />

                  <SummaryItem
                    label="Absent"
                    value={summary.unmarked}
                    warning={
                      summary.unmarked > 0
                    }
                  />
                </div>

                {summary.unmarked > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    <p className="font-semibold">
                      {summary.unmarked}{" "}
                      {summary.unmarked === 1
                        ? "referee has"
                        : "referees have"}{" "}
                      not been marked.
                    </p>

                    <p className="mt-1 text-amber-100/70">
                      They will count as absent
                      automatically. No individual
                      absent records will be created.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-gray-400">
                  Once completed, this session will
                  begin affecting attendance,
                  development, dashboard, and ranking
                  metrics. Board members may still
                  correct individual records later.
                </div>
              </>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}
          </div>

          <DialogFooter className="flex-row gap-3 border-t border-white/10 px-5 py-4 sm:justify-end sm:px-6">
            <button
              type="button"
              disabled={completing}
              onClick={() =>
                handleDialogChange(false)
              }
              className="
                flex-1
                rounded-xl
                border
                border-white/10
                bg-white/[0.03]
                px-4
                py-2.5
                text-sm
                font-medium
                text-gray-300
                transition
                hover:bg-white/[0.07]
                disabled:opacity-60
                sm:flex-none
              "
            >
              Go Back
            </button>

            <button
              type="button"
              disabled={
                completing || !summary
              }
              onClick={completeSession}
              className="
                inline-flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-500
                px-4
                py-2.5
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-emerald-400
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:flex-none
              "
            >
              {completing && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {completing
                ? "Completing..."
                : "Complete Session"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SummaryItem({
  label,
  value,
  warning = false,
}: {
  label: string
  value: number
  warning?: boolean
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        px-4
        py-3
        ${
          warning
            ? "border-amber-500/20 bg-amber-500/10"
            : "border-white/10 bg-white/[0.025]"
        }
      `}
    >
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p
        className={`
          mt-1
          text-2xl
          font-bold
          ${
            warning
              ? "text-amber-300"
              : "text-white"
          }
        `}
      >
        {value}
      </p>
    </div>
  )
}