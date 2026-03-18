import { requireBoard } from "@/src/lib/auth/require-board"
import { getAttendanceSessions } from "@/src/lib/queries/get-attendance-sessions"

import CreateSessionForm from "@/src/components/attendance/CreateSessionForm"
import AttendanceSessionsTable from "@/src/components/attendance/AttendanceSessionsTable"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default async function AdminAttendancePage() {

  await requireBoard()

  const sessions = await getAttendanceSessions()

  return (

    <div className="space-y-6 px-6">

      <PortalPageHeader 
        title="Attendance Management"
        subtitle="Track referee participation and session performance."
      />

      <div className="
          bg-[#080F0F]
          border border-white/10 
          rounded-2xl
          p-6"
        >
        <CreateSessionForm />
      </div>

      <AttendanceSessionsTable sessions={sessions} />

    </div>
  )
}