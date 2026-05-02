import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { ReportRow } from "@/src/lib/queries/get-reports"

type ReportStatus =
  | "pending"
  | "revision_required"
  | "submitted"
  | "approved"

const statusConfig: Record<
  ReportStatus,
  { label: string; variant: string }
> = {
  pending: {
    label: "Pending",
    variant: "warning",
  },
  revision_required: {
    label: "Revision Required",
    variant: "danger",
  },
  submitted: {
    label: "Submitted",
    variant: "success",
  },
  approved: {
    label: "Approved",
    variant: "success",
  },
}

export default function ReportCard({
  report,
  type,
}: {
  report: ReportRow
  type: "pending" | "submitted"
}) {

  const match = report.matches

  const config = statusConfig[report.status as ReportStatus]

  const date = match
    ? new Date(match.kickoff_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date pending"

  const href =
  report.status === "pending" ||
  report.status === "revision_required"
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

          <Badge variant={config.variant as any}>
            {config.label}
          </Badge>

        </div>

        <p className="mt-2 text-sm text-gray-400">
          {date}
        </p>

        {["submitted", "approved"].includes(report.status) && (
          <p className="mt-2 text-sm text-gray-300">
            Score: {report.home_score} - {report.away_score}
          </p>
        )}

        <div className="mt-3 text-xs text-yellow-400 font-medium">
          {
            report.status === "pending" && "Start Report"
          }

          {
            report.status === "revision_required" && "Correct Report"
          }

          {
            report.status === "submitted" && "View Match Details"
          }

          {
            report.status === "approved" && "View Match Details"
          }
        </div>

      </div>

    </Link>

  )
}