import AttendanceSessionsTable from "./AttendanceSessionsTable"

export default function UpcomingAttendanceSessions({
  sessions
}: {
  sessions: any[]
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