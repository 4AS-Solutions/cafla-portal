type Props = {
  sessions_present: number
  sessions_excused: number
  sessions_late: number
  sessions_total: number
  attendance_percentage: string
}

export function AttendanceStatsCard({
  sessions_present,
  sessions_excused,
  sessions_late,
  sessions_total,
  attendance_percentage
}: Props) {

  return (
    <div className="space-y-2 text-sm">

      <div className="flex justify-between">
        <span>Present</span>
        <span>{sessions_present}</span>
      </div>

      <div className="flex justify-between">
        <span>Excused</span>
        <span>{sessions_excused}</span>
      </div>

      <div className="flex justify-between">
        <span>Late</span>
        <span>{sessions_late}</span>
      </div>

      <div className="flex justify-between">
        <span>Total Sessions</span>
        <span>{sessions_total}</span>
      </div>

      <div className="flex justify-between font-semibold">
        <span>Attendance</span>
        <span>{attendance_percentage}%</span>
      </div>

    </div>
  )
}