import { createClient } from "@/src/lib/supabase/server"
import { getUserAttendance } from "@/src/lib/queries/get-user-attendance"
import { calculateAttendanceScore } from "@/src/lib/attendance/calculate-score"


import AttendanceScoreCard from "@/src/components/attendance/AttendanceScoreCard"
import AttendanceHistoryTable from "@/src/components/attendance/AttendanceHistoryTable"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default async function AttendancePage() {

  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const records = await getUserAttendance(user.id)

  const score = calculateAttendanceScore(records)

  return (

    <div className="space-y-6">

      <PortalPageHeader
        title="Attendance"
        subtitle="Track your attendance for referee training sessions and meetings."
      />

      <div className="max-w-md">
        <AttendanceScoreCard score={score} />
      </div>

      <div>

        <h2 className="text-lg font-semibold mb-3">
          Attendance History
        </h2>

        <AttendanceHistoryTable records={records} />

      </div>

    </div>

  )
}