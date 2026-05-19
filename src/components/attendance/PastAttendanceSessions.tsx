"use client"

import AttendanceSessionsTable from "./AttendanceSessionsTable"

export default function PastAttendanceSessions({
  sessions,
  total,
  page,
  limit
}: {
  sessions: any[]
  total: number
  page: number
  limit: number
}) {

  if (!sessions.length) return null

  return (
    <div className="space-y-6">

      <h3 className="text-lg text-white font-semibold">
        Past Sessions
      </h3>

      <AttendanceSessionsTable sessions={sessions} />

    </div>
  )
}