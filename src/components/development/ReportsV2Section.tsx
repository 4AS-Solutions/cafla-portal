import { FileCheck2 } from "lucide-react"

import { DashboardCard } from "@/src/components/dashboard/DashboardCard"
import type { UserReportDetail } from "@/src/lib/queries/get-user-report-detail"
import type { UserReportScore } from "@/src/lib/queries/get-user-report-score"

type ReportsV2SectionProps = {
  score: UserReportScore | null
  reports: UserReportDetail[]
}

type ReportDisplayStatus = {
  label: "On time" | "Late" | "Missing"
  styles: string
}

function getReportDisplayStatus(
  report: UserReportDetail
): ReportDisplayStatus {
  if (!report.report_submitted) {
    return {
      label: "Missing",
      styles: "border-red-500/20 bg-red-500/10 text-red-300",
    }
  }

  if (report.submitted_on_time) {
    return {
      label: "On time",
      styles:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    }
  }

  return {
    label: "Late",
    styles: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
  }
}

function formatMatchDate(matchDate: string): string {
  const match = matchDate.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  )

  if (!match) {
    return matchDate
  }

  const [, year, month, day] = match

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day)
      )
    )
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-white">
        {value}
      </p>
    </div>
  )
}

export function ReportsV2Section({
  score,
  reports,
}: ReportsV2SectionProps) {
  const recentReports = reports.slice(0, 5)

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-400">
          Reports
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Report Performance
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Current-cycle submission performance and recent report activity.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard
          title="Current Cycle Summary"
          icon={<FileCheck2 size={18} />}
        >
          {score ? (
            <div className="space-y-5">
              <div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-gray-500">
                      Report score
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-white">
                      {score.report_percentage.toFixed(1)}%
                    </p>
                  </div>

                  <p className="text-xs text-gray-500">
                    Active cycle
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.min(
                        Math.max(score.report_percentage, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Metric
                  label="Required"
                  value={score.reports_required}
                />
                <Metric
                  label="Submitted"
                  value={score.reports_submitted}
                />
                <Metric
                  label="On time"
                  value={score.reports_on_time}
                />
                <Metric
                  label="Late"
                  value={score.reports_late}
                />
                <Metric
                  label="Missing"
                  value={score.reports_missing}
                />
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-500">
              No report score is available for the active cycle.
            </p>
          )}
        </DashboardCard>

        <DashboardCard title="Recent Eligible Matches">
          {recentReports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
              <p className="text-sm text-gray-400">
                No eligible matches in the active cycle.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {recentReports.map((report) => {
                const status = getReportDisplayStatus(report)

                return (
                  <div
                    key={report.match_id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        {formatMatchDate(report.match_date_la)}
                      </p>
                      <p className="mt-1 truncate font-medium text-white">
                        {report.home_team} vs {report.away_team}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${status.styles}`}
                    >
                      {status.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </DashboardCard>
      </div>
    </section>
  )
}
