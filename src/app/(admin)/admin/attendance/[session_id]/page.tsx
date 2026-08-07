import { requireBoard } from "@/src/lib/auth/require-board"
import { getSessionAttendance } from "@/src/lib/queries/get-session-attendance"
import { formatDate } from "@/src/lib/utils/format-date"

import AttendanceGrid from "@/src/components/attendance/AttendanceGrid"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import OpenAttendanceButton from "@/src/components/attendance/OpenAttendanceButton"
import CompleteAttendanceButton from "@/src/components/attendance/CompleteAttendanceButton"

const statusStyles = {
  scheduled:
    "border-sky-500/20 bg-sky-500/10 text-sky-300",
  open:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  completed:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  cancelled:
    "border-red-500/20 bg-red-500/10 text-red-300",
}

export default async function AttendanceManagerPage({
  params,
}: {
  params: Promise<{ session_id: string }>
}) {
  await requireBoard()

  const { session_id } = await params

  const {
    session,
    members,
    statusMap,
    summary,
  } = await getSessionAttendance(session_id)

  const isScheduled =
    session.status === "scheduled"

  const isOpen =
    session.status === "open"

  const isCompleted =
    session.status === "completed"

  const isCancelled =
    session.status === "cancelled"

  const gridDisabled =
    isScheduled || isCancelled

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <PortalPageHeader
        title="Manage Attendance"
        subtitle="Open, record, and complete attendance for this session."
      />

      {/* SESSION INFORMATION */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-white">
                {session.title}
              </h2>

              <span
                className={`
                  rounded-full
                  border
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  ${statusStyles[session.status]}
                `}
              >
                {session.status}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-sm text-gray-400">
              <p>
                {formatDate(session.scheduledAt)}
              </p>

              {session.location && (
                <p>{session.location}</p>
              )}

              <p>
                Development Cycle:{" "}
                <span className="text-gray-200">
                  {session.cycleName}
                </span>
              </p>

              <p>
                Counts toward score:{" "}
                <span className="text-gray-200">
                  {session.countsForScore
                    ? "Yes"
                    : "No"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {isScheduled && (
              <OpenAttendanceButton
                sessionId={session.id}
              />
            )}

            {isOpen && (
              <CompleteAttendanceButton
                sessionId={session.id}
                sessionTitle={session.title}
              />
            )}
          </div>
        </div>
      </section>

      {/* OPEN SESSION ALERT */}
      {isOpen && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-200">
          <p className="font-semibold">
            Attendance is open
          </p>

          <p className="mt-1 text-amber-200/70">
            Record attendance and complete the session when the list is ready.
            Until then, this session will not affect member percentages.
          </p>
        </div>
      )}

      {/* COMPLETED INFORMATION */}
      {isCompleted && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
          <p className="font-semibold">
            Session completed
          </p>

          <p className="mt-1 text-emerald-200/70">
            Attendance is already affecting member metrics. Board members may
            still correct individual attendance records.
          </p>
        </div>
      )}

      {/* CANCELLED INFORMATION */}
      {isCancelled && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200">
          This session was cancelled and does not affect attendance metrics.
        </div>
      )}

      {/* SUMMARY */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Present"
          value={summary.present}
        />

        <SummaryCard
          label="Late"
          value={summary.late}
        />

        <SummaryCard
          label="Excused"
          value={summary.excused}
        />

        <SummaryCard
          label={
            isCompleted
              ? "Absent"
              : "Unmarked"
          }
          value={
            isCompleted
              ? summary.absent
              : summary.unmarked
          }
        />
      </section>

      {/* SCORING LEGEND */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <span className="text-emerald-400">
          ● Present (1.0)
        </span>

        <span className="text-yellow-400">
          ● Late (0.6)
        </span>

        <span className="text-sky-400">
          ● Excused (0.5)
        </span>

        <span className="text-red-400">
          ● Absent (0.0)
        </span>
      </div>

      {isScheduled && (
        <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-gray-400">
          Open attendance before marking member statuses.
        </div>
      )}

      <AttendanceGrid
        members={members}
        statusMap={statusMap}
        sessionId={session.id}
        disabled={gridDisabled}
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0B0F0F] px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}