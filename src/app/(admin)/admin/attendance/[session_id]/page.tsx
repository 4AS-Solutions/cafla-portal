import { requireBoard } from "@/src/lib/auth/require-board"
import { getSessionAttendance } from "@/src/lib/queries/get-session-attendance"

import AttendanceGrid from "@/src/components/attendance/AttendanceGrid"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default async function AttendanceManagerPage({
  params
}: {
  params: Promise<{ session_id: string }>
}) {

  await requireBoard()

  const { session_id } = await params

  const { members, statusMap } = await getSessionAttendance(session_id)

  return (

    <div className="space-y-6 px-6">

      <PortalPageHeader
        title="Manage Attendance"
        subtitle="Mark attendance for this session."
      />

      <div className="flex gap-4 text-xs">
        <span className="text-emerald-400">● Present (1.0)</span>
        <span className="text-blue-400">● Excused (0.75)</span>
        <span className="text-yellow-400">● Late (0.5)</span>
      </div>

      <AttendanceGrid
        members={members}
        statusMap={statusMap}
        sessionId={session_id}
      />

    </div>

  )
}