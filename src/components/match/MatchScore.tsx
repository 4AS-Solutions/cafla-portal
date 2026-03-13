export default function MatchScore({ report }: any) {
  console.log("Report", report)
  if (!report) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-center text-sm text-gray-400">
        Report not submitted yet
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-6">

      <div className="text-xs uppercase tracking-wide text-white mb-3">
        Result
      </div>

      <div className="flex items-center justify-center gap-6 text-5xl font-bold tracking-wider text-white">

        <span>{report.home_score}</span>

        <span className="text-gray-500 text-3xl">-</span>

        <span>{report.away_score}</span>

      </div>

    </div>
  )
}