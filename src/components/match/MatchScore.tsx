type MatchScoreProps = {
  report: {
    home_score: number
    away_score: number
  } | null
  homeTeam: string
  awayTeam: string
}

export default function MatchScore({
  report,
  homeTeam,
  awayTeam,
}: MatchScoreProps) {
  if (!report) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-center text-sm text-gray-400">
        Report not submitted yet
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-6">
      <div className="mb-5 text-xs uppercase tracking-wide text-white">
        Result
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* HOME */}
        <div className="min-w-0 text-center">
          <p className="mb-2 truncate text-sm font-semibold text-white/80">
            {homeTeam}
          </p>

          <p className="text-6xl font-bold tabular-nums tracking-tight text-white">
            {report.home_score}
          </p>

          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            Home
          </p>
        </div>

        {/* DIVIDER */}
        <div className="flex flex-col items-center">
          <span className="text-3xl font-light text-white/25">
            –
          </span>

          <span className="mt-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Full Time
          </span>
        </div>

        {/* AWAY */}
        <div className="min-w-0 text-center">
          <p className="mb-2 truncate text-sm font-semibold text-white/80">
            {awayTeam}
          </p>

          <p className="text-6xl font-bold tabular-nums tracking-tight text-white">
            {report.away_score}
          </p>

          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            Away
          </p>
        </div>
      </div>
    </div>
  )
}