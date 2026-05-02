import StatusBadge from "../admin/reports/StatusBadge"

export default function MatchHeader({ match, status }: any) {
  const kickoff = new Date(match.kickoff_at)

  return (
    <div className="space-y-4">

      {/* TOP ROW */}
      <div className="flex items-start justify-between flex-wrap gap-3">

        {/* MATCH TITLE */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-white">
            {match.home_team}
            <span className="text-gray-500 mx-2">vs</span>
            {match.away_team}
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            {match.league} • {match.division}
          </p>
        </div>

        {/* 🔥 STATUS AQUÍ */}
        {status && <StatusBadge status={status} />}

      </div>

      {/* META */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400">

        <span>
          {kickoff.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>

        <span className="text-white/20">•</span>

        <span>
          {kickoff.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>

        <span className="text-white/20">•</span>

        <span className="text-gray-500">
          {match.location}
        </span>

        {match.field && (
          <>
            <span className="text-white/20">•</span>
            <span className="text-gray-500">
              {match.field}
            </span>
          </>
        )}

      </div>

      {/* DIVIDER */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

    </div>
  )
}