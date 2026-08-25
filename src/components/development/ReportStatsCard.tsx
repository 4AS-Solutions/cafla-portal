import type { UserReportScore } from "@/src/lib/queries/get-user-report-score"

export function ReportStatsCard({ score }: { score: UserReportScore | null }) {
  if (!score) {
    return <p className="text-sm text-gray-500">No report data is available for the active cycle.</p>
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between font-semibold">
        <span>Report Score</span>
        <span className="text-white">{score.report_percentage.toFixed(0)}%</span>
      </div>
      <div className="flex justify-between"><span>On Time / Required</span><span>{score.reports_on_time} / {score.reports_required}</span></div>
      <div className="flex justify-between"><span>Late</span><span>{score.reports_late}</span></div>
      <div className="flex justify-between"><span>Missing</span><span>{score.reports_missing}</span></div>
    </div>
  )
}
