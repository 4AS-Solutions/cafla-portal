import StatusBadge from "../admin/reports/StatusBadge"

type MatchHeaderProps = {
  match: {
    kickoff_at: string
    home_team: string
    away_team: string
    league: string
    division: string
    location?: string | null
    field?: string | null
  }
  status?: string | null
}

export default function MatchHeader({
  match,
  status,
}: MatchHeaderProps) {
  const kickoff = new Date(match.kickoff_at)

  const matchDate = kickoff.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  const matchTime = kickoff.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="space-y-4">
      {/* TOP ROW */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {/* LEAGUE */}
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
            {match.league}
          </h1>

          {/* DIVISION */}
          <p className="mt-1 text-sm font-medium text-[#D4A93A]">
            {match.division}
          </p>
        </div>

        {status && <StatusBadge status={status} />}
      </div>

      {/* META */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-400">
        <span>{matchDate}</span>

        <span className="text-white/20">•</span>

        <span>{matchTime}</span>

        {match.location && (
          <>
            <span className="text-white/20">•</span>

            <span className="text-gray-500">
              {match.location}
            </span>
          </>
        )}

        {match.field && (
          <>
            <span className="text-white/20">•</span>

            <span className="text-gray-500">
              {match.field}
            </span>
          </>
        )}
      </div>

      {/* MATCHUP */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-gray-300">
          Competition Rules
        </span>

        <span className="text-xs uppercase tracking-widest text-gray-600">
          •
        </span>

        <span className="font-medium text-gray-300">
          View Documents
        </span>
      </div>

      {/* DIVIDER */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}