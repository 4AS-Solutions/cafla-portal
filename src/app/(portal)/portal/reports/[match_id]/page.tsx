import { getMatchForReport } from "@/src/lib/queries/reports"
import { MatchReportForm } from "@/src/components/reports/MatchReportForm"

export default async function ReportPage({
  params,
}: {
  params: Promise<{ match_id: string }>
}) {

  const { match_id } = await params

  const { match, report } = await getMatchForReport(match_id)

  if (!match) {
    return (
      <div className="p-6">
        Match not found
      </div>
    )
  }

  let mode: "create" | "edit" | "read" = "create"

  if (!report) {
    mode = "create"
  } else if (report.status === "revision_required") {
    mode = "edit"
  } else {
    mode = "read"
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

      {/* REVISION FEEDBACK */}
      {report?.status === "revision_required" &&
        report?.revision_notes && (

          <div className="
            rounded-2xl
            border border-yellow-500/20
            bg-yellow-500/10
            p-5
            space-y-3
          ">

            <div className="flex items-center gap-2">

              <div className="
                h-2 w-2 rounded-full
                bg-yellow-400
              " />

              <h2 className="
                text-sm font-semibold
                text-yellow-300
              ">
                Revision Feedback
              </h2>

            </div>

            <p className="
              whitespace-pre-wrap
              text-sm leading-relaxed
              text-yellow-100/90
            ">
              {report.revision_notes}
            </p>

          </div>

      )}

      {/* FORM */}
      <MatchReportForm
        match={match}
        mode={mode}
        initialData={report}
      />

    </div>
  )
}