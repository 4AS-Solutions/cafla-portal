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

  const kickoff = match.kickoff_at
    ? new Date(match.kickoff_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date TBD"

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* HEADER */}

      <div className="space-y-2">

        <h1 className="text-2xl font-bold text-white">
          Match Report
        </h1>

        <div className="text-sm text-gray-400">
          {match.home_team} vs {match.away_team}
        </div>

        <div className="text-xs text-gray-500">
          {kickoff} • {match.location ?? "Location TBD"} • {match.field ?? "Field TBD"}
        </div>

      </div>

      {/* FORM */}

      <MatchReportForm match={match} />

    </div>
  )
}