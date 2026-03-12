import { DashboardCard } from "@/src/components/dashboard/DashboardCard"
import { PendingReportsList } from "@/src/components/dashboard/PendingReportsList"
import { RefereeRanking } from "@/src/components/dashboard/RefereeRanking"
import { UpcomingMatchesTable } from "@/src/components/dashboard/UpcomingMatchesTable"
import { RefereeDevelopmentCard } from "@/src/components/development/DevelopmentSummaryCard"

import {
  getUpcomingMatches,
  getPendingReports,
  getRefereeRanking,
  getPendingEvaluations,
  getMyDevelopment
} from "@/src/lib/queries/dashboard"

import { getProfile } from "@/src/lib/queries/get-profile"


export default async function PortalDashboard() {

  const profileData = await getProfile()

  const role = profileData?.profile?.role
  const memberId = profileData?.profile?.id

  const upcomingMatches = await getUpcomingMatches()
  const pendingReports = await getPendingReports()
  const pendingEvaluations = await getPendingEvaluations()

  const myDevelopment = memberId
    ? await getMyDevelopment(memberId)
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

        {myDevelopment && (
          <DashboardCard title="Your Development">

            <RefereeDevelopmentCard
              ranking_position={myDevelopment.ranking_position}
              development_score={myDevelopment.development_score}
              referee_level={myDevelopment.referee_level}
            />

          </DashboardCard>
        )}

      </div>
    </div>
  )
}