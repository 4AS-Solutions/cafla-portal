import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { ReportRow } from "@/src/lib/queries/get-reports"

export default function ReportCard({
  report,
  type,
}: {
  report: ReportRow
  type: "pending" | "submitted"
}) {

  const match = report.matches

  const date = match
    ? new Date(match.kickoff_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date pending"

  const href =
    type === "pending"
      ? `/portal/reports/${report.match_id}`
      : `/portal/matches/${report.match_id}`

  return (

    <Link href={href}>

      <div className="rounded-xl border border-white/10 bg-[#0B0F0F]/80 backdrop-blur-md p-4 transition hover:border-yellow-400/20 hover:shadow-lg cursor-pointer">

        <div className="flex items-center justify-between">

          <h3 className="font-semibold text-white">
            {match
              ? `${match.home_team} vs ${match.away_team}`
              : "Match not found"}
          </h3>

          {type === "submitted" ? (
            <Badge variant="success">Submitted</Badge>
          ) : (
            <Badge variant="warning">Pending</Badge>
          )}

        </div>

        <p className="mt-2 text-sm text-gray-400">
          {date}
        </p>

        {type === "submitted" && (
          <p className="mt-2 text-sm text-gray-300">
            Score: {report.home_score} - {report.away_score}
          </p>
        )}

        <div className="mt-3 text-xs text-yellow-400 font-medium">
          {type === "pending"
            ? "Start Report "
            : "View Match Details"}
        </div>

      </div>

    </Link>

  )
}