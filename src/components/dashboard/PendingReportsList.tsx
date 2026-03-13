import Link from "next/link"
import { Button } from "@/src/components/ui/button"

type Report = {
  match_id: string
  home_team: string
  away_team: string
  kickoff_at: string
  center_referee: string | null
}

type Props = {
  reports: Report[]
  userName: string
}

export function PendingReportsList({ reports, userName }: Props) {
  if (!reports || reports.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No pending reports.
      </div>
    )
  }

  const now = new Date()

  return (
    <div className="space-y-3">

      {reports.map((report) => {

        const kickoff = new Date(report.kickoff_at)
        const isMatchPlayed = kickoff < now
        const isCenterReferee = report.center_referee === userName

        let action: React.ReactNode = null

        /*
        -------------------------
        Decide action
        -------------------------
        */

        if (!isMatchPlayed) {

          action = (
            <span className="text-xs text-muted-foreground">
              Wait for this match to be played
            </span>
          )

        } else if (!isCenterReferee) {

          action = (
            <span className="text-xs text-muted-foreground">
              Waiting for Center Referee
            </span>
          )

        } else {

          action = (
            <Link href={`/portal/reports/${report.match_id}`}>
              <Button size="sm">
                Submit Report
              </Button>
            </Link>
          )

        }

        return (

          <div
            key={report.match_id}
            className="flex items-center justify-between border rounded-lg p-3"
          >

            <div className="text-sm">

              <div className="font-medium">
                {report.home_team} vs {report.away_team}
              </div>

              <div className="text-muted-foreground text-xs">
                {new Date(report.kickoff_at).toLocaleString()}
              </div>

            </div>

            {action}

          </div>

        )
      })}

    </div>
  )
}