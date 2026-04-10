import ReportCard from "./ReportCard"
import { ReportRow } from "@/src/lib/queries/get-reports"

export default function ReportsList({
  title,
  reports,
  type,
}: {
  title: string
  reports: ReportRow[]
  type: "pending" | "submitted"
}) {

  if (!reports.length) {
    return (
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-300">
          {title}
        </h2>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-gray-400">
          No reports in this section.
        </div>
      </div>
    )
  }

  return (

    <div className="space-y-4">

      <h2 className="text-sm font-semibold text-gray-300">
        {title}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {reports.map((report) => (
          <ReportCard
            key={report.match_id}
            report={report}
            type={type}
          />
        ))}

      </div>

    </div>

  )
}