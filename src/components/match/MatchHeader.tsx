export default function MatchHeader({ match }: any) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">
        {match.home_team} vs {match.away_team}
      </h1>

      <div className="text-muted-foreground text-sm">
        {match.league} • {match.division}
      </div>

      <div className="text-sm">
        {new Date(match.kickoff_at).toLocaleString()}
      </div>
    </div>
  )
}