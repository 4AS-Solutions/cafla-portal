import { getMatchForReport } from "@/src/lib/queries/reports"
import { MatchReportForm } from "@/src/components/reports/MatchReportForm"

export default async function ReportPage({
  params,
}: {
  params: Promise<{ match_id: string }>
}) {

  const { match_id } = await params

  const match = await getMatchForReport(match_id)

  if (!match) {
    return (
      <div className="p-6">
        Match not found
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">

      <h1 className="text-2xl font-bold">
        Match Report
      </h1>

      <div className="text-sm text-muted-foreground">
        {match.home_team} vs {match.away_team}
      </div>

      <MatchReportForm match={match} />

    </div>
  )
}