import { requireBoard } from "@/src/lib/auth/require-board"
import { getAttendanceSessions } from "@/src/lib/queries/get-attendance-sessions"

import CreateSessionForm from "@/src/components/attendance/CreateSessionForm"
import AttendanceSessionsTable from "@/src/components/attendance/AttendanceSessionsTable"

export default async function AdminAttendancePage() {

  await requireBoard()

  const sessions = await getAttendanceSessions()

  return (

    <div className="max-w-6xl mx-auto space-y-6">

      <div>

        <h1 className="text-2xl font-bold">
          Attendance Sessions
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage training sessions and attendance
        </p>

      </div>

      <CreateSessionForm />

      <AttendanceSessionsTable sessions={sessions} />

    </div>
  )
}