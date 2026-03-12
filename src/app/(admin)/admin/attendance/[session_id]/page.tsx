import { requireBoard } from "@/src/lib/auth/require-board"
import { getSessionAttendance } from "@/src/lib/queries/get-session-attendance"

import AttendanceGrid from "@/src/components/attendance/AttendanceGrid"

export default async function AttendanceManagerPage({
  params
}: {
  params: Promise<{ session_id: string }>
}) {

  await requireBoard()

  const { session_id } = await params

  const { members, statusMap } = await getSessionAttendance(session_id)

  return (

    <div className="max-w-6xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        Manage Attendance
      </h1>

      <AttendanceGrid
        members={members}
        statusMap={statusMap}
        sessionId={session_id}
      />

    </div>

  )
}