import Link from "next/link"
import { Button } from "@/src/components/ui/button"

type Report = {
  match_id: string
  home_team: string
  away_team: string
  match_date: string
}

export function PendingReportsList({ reports }: { reports: Report[] }) {

  if (!reports || reports.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No pending reports.
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {reports.map((report) => (

        <div
          key={report.match_id}
          className="flex items-center justify-between border rounded-lg p-3"
        >

          <div className="text-sm">

            <div className="font-medium">
              {report.home_team} vs {report.away_team}
            </div>

            <div className="text-muted-foreground text-xs">
              {new Date(report.match_date).toLocaleString()}
            </div>

          </div>

          <Link href={`/portal/reports/${report.match_id}`}>
            <Button size="sm">
              Submit Report
            </Button>
          </Link>

        </div>

      ))}

    </div>
  )
}