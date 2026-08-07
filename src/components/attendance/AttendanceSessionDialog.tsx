"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  Users,
  X,
  XCircle,
} from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"

import AttendanceStatusBadge from "./AttendanceStatusBadge"

type AttendanceStatus =
  | "present"
  | "late"
  | "excused"
  | "absent"

type AttendanceMember = {
  memberId?: string
  name: string
  status: AttendanceStatus
}

type AttendanceSessionDialogProps = {
  sessionId: string
  open: boolean
  onClose: () => void
}

const attendanceStatusOrder: Record<AttendanceStatus, number> = {
  present: 0,
  late: 1,
  excused: 2,
  absent: 3,
}

export default function AttendanceSessionDialog({
  sessionId,
  open,
  onClose,
}: AttendanceSessionDialogProps) {
  const [list, setList] = useState<AttendanceMember[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  useEffect(() => {
    if (!open || !sessionId) return

    const controller = new AbortController()

    async function loadSessionAttendance() {
      setLoading(true)
      setErrorMessage(null)

      try {
        const params = new URLSearchParams({
          session_id: sessionId,
        })

        const response = await fetch(
          `/api/attendance/session-list?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load session attendance."
          )
        }

        /*
         * Supports either:
         *   [...]
         * or:
         *   { members: [...] }
         */
        const members = Array.isArray(data)
          ? data
          : data?.members

        setList(
          Array.isArray(members)
            ? members
            : []
        )
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return
        }

        setList([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load session attendance."
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadSessionAttendance()

    return () => {
      controller.abort()
    }
  }, [open, sessionId])

  const summary = useMemo(() => {
    return list.reduce(
      (result, member) => {
        result.total += 1
        result[member.status] += 1

        return result
      },
      {
        total: 0,
        present: 0,
        late: 0,
        excused: 0,
        absent: 0,
      }
    )
  }, [list])

  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => {
      const statusDifference =
        attendanceStatusOrder[a.status] -
        attendanceStatusOrder[b.status]

      if (statusDifference !== 0) {
        return statusDifference
      }

      return a.name.localeCompare(b.name, "en", {
        sensitivity: "base",
      })
    })
  }, [list])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        showCloseButton={false}
        className="
          w-[94vw]
          max-w-2xl
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-[#07100E]
          p-0
          text-white
          shadow-2xl
          sm:w-full
        "
      >
        <DialogHeader
          className="
            relative
            shrink-0
            border-b
            border-white/10
            bg-gradient-to-r
            from-emerald-950/70
            to-[#07100E]
            px-5
            py-4
            pr-16
            text-left
            sm:px-6
          "
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold text-white sm:text-lg">
                Session Attendance
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm leading-5 text-gray-400">
                Review the recorded attendance for this activity.
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close attendance details"
            className="
              absolute
              right-4
              top-4
              z-20
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-white/15
              bg-[#111a18]
              text-white
              shadow-lg
              transition-colors
              hover:bg-white/10
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500/30
            "
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="px-4 py-4 sm:px-6">
          {!loading && !errorMessage && list.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <SummaryItem
                label="Present"
                value={summary.present}
                icon={
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                }
              />

              <SummaryItem
                label="Late"
                value={summary.late}
                icon={
                  <Clock3 className="h-4 w-4 text-amber-400" />
                }
              />

              <SummaryItem
                label="Excused"
                value={summary.excused}
                icon={
                  <CheckCircle2 className="h-4 w-4 text-sky-400" />
                }
              />

              <SummaryItem
                label="Absent"
                value={summary.absent}
                icon={
                  <XCircle className="h-4 w-4 text-red-400" />
                }
              />
            </div>
          )}

          {loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading attendance...
              </div>
            </div>
          ) : errorMessage ? (
            <div className="flex min-h-48 items-center justify-center">
              <div className="max-w-sm rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              </div>
            </div>
          ) : list.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center text-center">
              <div>
                <Users className="mx-auto h-8 w-8 text-gray-600" />

                <p className="mt-3 font-medium text-white">
                  No attendance data
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  No participants were found for this session.
                </p>
              </div>
            </div>
          ) : (
            <div className="
              max-h-[42vh]
              space-y-2
              overflow-y-auto
              pr-1
              sm:max-h-[360px]
            ">
              {sortedList.map((member, index) => (
                <div
                  key={
                    member.memberId ??
                    `${member.name}-${index}`
                  }
                  className="
                    flex
                    min-h-12
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-white/5
                    bg-white/[0.025]
                    px-3
                    py-2.5
                    transition
                    hover:border-white/10
                    hover:bg-white/[0.04]
                  "
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {member.name}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <AttendanceStatusBadge
                      status={member.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-black/20 px-4 py-3 sm:px-6">
          <p className="text-center text-xs text-gray-500">
            {summary.total} participant
            {summary.total === 1 ? "" : "s"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SummaryItem({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
          {label}
        </span>

        {icon}
      </div>

      <p className="mt-1 text-lg font-bold text-white">
        {value}
      </p>
    </div>
  )
}