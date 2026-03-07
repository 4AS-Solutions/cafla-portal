import { DashboardCard } from "@/src/components/dashboard/DashboardCard"
import { PendingReportsList } from "@/src/components/dashboard/PendingReportsList"
import { UpcomingMatchesTable } from "@/src/components/dashboard/UpcomingMatchesTable"
import {
  getUpcomingMatches,
  getPendingReports,
  getRefereeRanking,
  getPendingEvaluations
} from "@/src/lib/queries/dashboard"
import { getProfile } from "@/src/lib/queries/get-profile"

export default async function PortalDashboard() {

  const profileData = await getProfile()

  const role = profileData?.profile?.role

  const upcomingMatches = await getUpcomingMatches()
  const pendingReports = await getPendingReports()
  const pendingEvaluations = await getPendingEvaluations()

  const ranking = role === "board"
    ? await getRefereeRanking()
    : null

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <DashboardCard title="Upcoming Matches">
          <UpcomingMatchesTable matches={upcomingMatches ?? []} />
        </DashboardCard>

        <DashboardCard title="Pending Reports">
          <PendingReportsList reports={pendingReports ?? []} />
        </DashboardCard>

        <DashboardCard title="Pending Evaluations">
          <pre className="text-xs">
            {JSON.stringify(pendingEvaluations, null, 2)}
          </pre>
        </DashboardCard>

        {role === "board" && (
          <DashboardCard title="Referee Ranking">
            <pre className="text-xs">
              {JSON.stringify(ranking, null, 2)}
            </pre>
          </DashboardCard>
        )}

      </div>

    </div>
  )
}