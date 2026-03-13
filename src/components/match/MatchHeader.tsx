export default function MatchHeader({ match }: any) {
  const kickoff = new Date(match.kickoff_at)

  return (
    <div className="space-y-3 border-b border-white/10 pb-4">

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
        {match.home_team} vs {match.away_team}
      </h1>

      <div className="text-sm text-gray-400">
        {match.league} • {match.division}
      </div>

      <div className="text-sm text-gray-300">
        {kickoff.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}{" "}
        •{" "}
        {kickoff.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      <div className="text-xs text-gray-500">
        {match.location} • {match.field}
      </div>

    </div>
  )
}