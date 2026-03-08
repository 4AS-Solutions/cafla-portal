import { getMatchForReport } from "@/src/lib/queries/reports"
import { MatchReportForm } from "@/src/components/reports/MatchReportForm"
import { getMatchTimeline } from "@/src/lib/queries/get-match-timeline"
import { MatchTimeline } from "@/src/components/match/MatchTimeline"

export default async function ReportPage({
  params,
}: {
  params: Promise<{ match_id: string }>
}) {

  const { match_id } = await params

  const match = await getMatchForReport(match_id);
  const timeline = await getMatchTimeline(match_id);

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

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Match Timeline</h2>

        <MatchTimeline events={timeline} />
      </div>

      <div className="text-sm text-muted-foreground">
        {match.home_team} vs {match.away_team}
      </div>

      <MatchReportForm match={match} />

    </div>
  )
}