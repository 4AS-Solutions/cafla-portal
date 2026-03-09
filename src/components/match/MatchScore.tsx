export default function MatchScore({ report }: any) {
  if (!report) {
    return <div className="text-muted-foreground">Report not submitted yet</div>
  }

  return (
    <div className="flex gap-8 text-4xl font-bold">
      <span>{report.home_score}</span>
      <span>-</span>
      <span>{report.away_score}</span>
    </div>
  )
}