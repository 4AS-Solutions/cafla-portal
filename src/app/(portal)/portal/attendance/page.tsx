import { createClient } from "@/src/lib/supabase/server"
import { getUserAttendance } from "@/src/lib/queries/get-user-attendance"
import { calculateAttendanceScore } from "@/src/lib/attendance/calculate-score"

import AttendanceScoreCard from "@/src/components/attendance/AttendanceScoreCard"
import AttendanceHistoryTable from "@/src/components/attendance/AttendanceHistoryTable"

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

    <div className="max-w-5xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        My Attendance
      </h1>

      <AttendanceScoreCard score={score} />

      <div>

        <h2 className="text-lg font-semibold mb-3">
          Attendance History
        </h2>

        <AttendanceHistoryTable records={records} />

      </div>

    </div>
  )
}