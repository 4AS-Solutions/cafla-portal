import AttendanceSessionsTable from "./AttendanceSessionsTable"
import type { AttendanceSession } from "@/src/lib/queries/get-attendance-sessions"

export default function UpcomingAttendanceSessions({
  sessions
}: {
  sessions: AttendanceSession[]
}) {

  if (!sessions.length) return null

  return (
    <div className="space-y-4">

      <h3 className="text-lg text-white font-semibold">
        Upcoming Sessions
      </h3>

      <AttendanceSessionsTable 
        sessions={sessions} 
        showAction={false} 
      />

    </div>
  )
}