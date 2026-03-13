import { DashboardCard } from "@/src/components/dashboard/DashboardCard"
import { DashboardStatCard } from "@/src/components/dashboard/DashboardStatCard"
import { PendingEvaluationsList } from "@/src/components/dashboard/PendingEvaluationsList"
import { PendingReportsList } from "@/src/components/dashboard/PendingReportsList"
import { QuickActions } from "@/src/components/dashboard/QuickActions"
import { UpcomingMatchesTable } from "@/src/components/dashboard/UpcomingMatchesTable"
import { RefereeDevelopmentCard } from "@/src/components/development/DevelopmentSummaryCard"

import {
  getUpcomingMatches,
  getPendingReports,
  getPendingEvaluations,
  getMyDevelopment,
} from "@/src/lib/queries/dashboard"

import { getProfile } from "@/src/lib/queries/get-profile"

import {
  CalendarDays,
  ClipboardList,
  FileUser,
  ChartLine,
  CalendarCheck,
  ClipboardCheck,
  Users,
  BookOpenCheck,
} from "lucide-react"

export default async function PortalDashboard() {
  const profileData = await getProfile()
  const memberId = profileData?.profile?.id

  const upcomingMatches = await getUpcomingMatches()
  const pendingReports = await getPendingReports()
  const pendingEvaluations = await getPendingEvaluations()

  const myDevelopment = memberId ? await getMyDevelopment(memberId) : null

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-400/90">
          CAFLA Portal
        </p>

        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Dashboard
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-gray-400 sm:text-base">
          Overview of your referee activity and development
        </p>
      </div>

      {myDevelopment && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <DashboardStatCard
            label="Attendance"
            value={`${Number(myDevelopment.attendance_score).toFixed(0)}%`}
            icon={<CalendarCheck size={18} />}
          />

          <DashboardStatCard
            label="Reports"
            value={`${Number(myDevelopment.report_score).toFixed(0)}%`}
            icon={<ClipboardCheck size={18} />}
          />

          <DashboardStatCard
            label="Peer Feedback"
            value={`${Number(myDevelopment.peer_feedback_score).toFixed(0)}%`}
            icon={<Users size={18} />}
          />

          <DashboardStatCard
            label="Quizzes"
            value={`${Number(myDevelopment.quiz_score).toFixed(0)}%`}
            icon={<BookOpenCheck size={18} />}
          />

        </div>
      )}

      <QuickActions />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">

        {/* Upcoming Matches - Large */}
        <div className="xl:col-span-2">
          <DashboardCard
            title="Upcoming Matches"
            icon={<CalendarDays size={18} />}
          >
            <UpcomingMatchesTable matches={upcomingMatches ?? []} />
          </DashboardCard>
        </div>

        {/* Pending Reports */}
        <div className="xl:col-span-2">
          <DashboardCard
            title="Pending Reports"
            icon={<ClipboardList size={18} />}
          >
            <PendingReportsList reports={pendingReports ?? []} />
          </DashboardCard>
        </div>

        {/* Pending Evaluations */}
        <div className="xl:col-span-2">
          <DashboardCard
            title="Pending Evaluations"
            icon={<FileUser size={18} />}
          >
            <PendingEvaluationsList evaluations={pendingEvaluations ?? []} />
          </DashboardCard>
        </div>

        {/* Development - Large */}
        {myDevelopment && (
          <div className="xl:col-span-2">
            <DashboardCard
              title="Your Development"
              icon={<ChartLine size={18} />}
            >
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