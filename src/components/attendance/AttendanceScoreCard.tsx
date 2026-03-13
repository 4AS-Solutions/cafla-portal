export default function AttendanceScoreCard({ score }: { score: number }) {

  return (

    <div className="rounded-xl border border-white/10 bg-[#0B0F0F]/80 backdrop-blur-md p-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-sm text-gray-400">
            Attendance Score
          </h2>

          <div className="text-4xl font-bold mt-1">
            {score}%
          </div>

        </div>

        <div className="text-right text-xs text-gray-400 max-w-[160px]">
          Based on your recorded attendance.
        </div>

      </div>

    </div>

  )
}