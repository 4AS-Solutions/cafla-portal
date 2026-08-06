export default function AttendanceScoreCard({
  score,
}: {
  score: number
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm text-gray-400">
            Attendance Score
          </h2>

          <div className="mt-1 text-4xl font-bold">
            {Number(score.toFixed(2))}%
          </div>
        </div>

        <div className="max-w-[160px] text-right text-xs text-gray-400">
          Based on your recorded attendance.
        </div>
      </div>
    </div>
  )
}