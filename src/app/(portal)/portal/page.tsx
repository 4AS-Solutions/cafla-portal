import {
  BookOpenCheck,
  CalendarCheck,
  CalendarDays,
  ChartLine,
  ClipboardCheck,
  ClipboardList,
  FileUser,
  Users,
} from "lucide-react"

import { DashboardCard } from "@/src/components/dashboard/DashboardCard"
import { DashboardStatCard } from "@/src/components/dashboard/DashboardStatCard"
import { PendingEvaluationsList } from "@/src/components/dashboard/PendingEvaluationsList"
import { PendingReportsList } from "@/src/components/dashboard/PendingReportsList"
import { QuickActions } from "@/src/components/dashboard/QuickActions"
import { UpcomingMatchesTable } from "@/src/components/dashboard/UpcomingMatchesTable"
import { RefereeDevelopmentCard } from "@/src/components/development/DevelopmentSummaryCard"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { requireUser } from "@/src/lib/auth/require-user"
import { getMyDevelopment, getPendingReports, getUpcomingMatches } from "@/src/lib/queries/dashboard"
import { getProfile } from "@/src/lib/queries/get-profile"
import { getUserAttendance } from "@/src/lib/queries/get-user-attendance"
import { getUserEvaluationObligations } from "@/src/lib/queries/get-user-evaluation-obligations"
import { getUserEvaluationScore } from "@/src/lib/queries/get-user-evaluation-score"
import { getUserQuizScore } from "@/src/lib/queries/get-user-quiz-score"
import { getUserReportScore } from "@/src/lib/queries/get-user-report-score"

function formatPercentage(value: number | null | undefined): string {
  return value === null || value === undefined ? "Not enough data yet" : `${value.toFixed(0)}%`
}

export default async function PortalDashboard() {
  const user = await requireUser()
  const profileData = await getProfile()
  const memberId = profileData?.profile?.id

  const [
    upcomingMatches,
    pendingReports,
    obligations,
    myDevelopment,
    attendance,
    quizScore,
    reportScore,
    evaluationScore,
  ] = await Promise.all([
    getUpcomingMatches(),
    getPendingReports(),
    getUserEvaluationObligations(),
    memberId ? getMyDevelopment(memberId) : Promise.resolve(null),
    getUserAttendance(user.id),
    getUserQuizScore(),
    getUserReportScore(),
    getUserEvaluationScore(),
  ])
  const pendingEvaluations = obligations.filter(
    (obligation) => obligation.obligation_status === "pending"
  )

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow="CAFLA PORTAL"
        title="Dashboard"
        subtitle="Overview of your referee activity and development progress."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Attendance"
          value={attendance.cycle ? formatPercentage(attendance.stats.percentage) : "No active cycle data"}
          icon={<CalendarCheck size={18} />}
        />
        <DashboardStatCard
          label="Reports"
          value={formatPercentage(reportScore?.report_percentage)}
          icon={<ClipboardCheck size={18} />}
        />
        <DashboardStatCard
          label="Peer Feedback"
          value={formatPercentage(evaluationScore?.evaluation_score)}
          icon={<Users size={18} />}
        />
        <DashboardStatCard
          label="Quizzes"
          value={formatPercentage(quizScore?.quiz_score)}
          icon={<BookOpenCheck size={18} />}
        />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <DashboardCard title="Upcoming Matches" icon={<CalendarDays size={18} />}>
            <UpcomingMatchesTable matches={upcomingMatches ?? []} />
          </DashboardCard>
        </div>

        <div className="xl:col-span-2">
          <DashboardCard title="Pending Reports" icon={<ClipboardList size={18} />}>
            <PendingReportsList
              reports={pendingReports ?? []}
              userName={profileData?.profile?.full_name ?? ""}
            />
          </DashboardCard>
        </div>

        <div className="xl:col-span-2">
          <DashboardCard title="Pending Evaluations" icon={<FileUser size={18} />}>
            <PendingEvaluationsList evaluations={pendingEvaluations} />
          </DashboardCard>
        </div>

        {myDevelopment && (
          <div className="xl:col-span-2">
            <DashboardCard title="Your Development" icon={<ChartLine size={18} />}>
              <RefereeDevelopmentCard
                ranking_position={myDevelopment.ranking_position}
                development_score={myDevelopment.development_score}
                referee_level={myDevelopment.referee_level}
              />
            </DashboardCard>
          </div>
        )}
      </div>
    </div>
  )
}
