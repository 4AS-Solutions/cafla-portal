import { supabaseServer } from "@/src/lib/supabase/server"
import { getUserAttendance } from "@/src/lib/queries/get-user-attendance"


import AttendanceScoreCard from "@/src/components/attendance/AttendanceScoreCard"
import AttendanceHistoryTable from "@/src/components/attendance/AttendanceHistoryTable"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default async function AttendancePage() {

  const supabase = await supabaseServer()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const { sessions, stats } = await getUserAttendance(user.id)

  return (

    <div className="space-y-6">

      <PortalPageHeader
        title="Attendance"
        subtitle="Track your attendance for referee training sessions and meetings."
      />

      <div className="max-w-md">
        <AttendanceScoreCard score={stats.percentage} />
      </div>

      <div>

        <h2 className="text-lg font-semibold mb-3">
          Attendance History
        </h2>

        <AttendanceHistoryTable records={sessions} />

      </div>

    </div>

  )
}