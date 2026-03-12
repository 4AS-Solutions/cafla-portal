import { DashboardCard } from "@/src/components/dashboard/DashboardCard"
import { QuizStatsCard } from "@/src/components/development/QuizStatsCard"
import { AttendanceStatsCard } from "@/src/components/development/AttendanceStatsCard"

import {
  getMyQuizStats,
  getMyAttendanceStats,
  getMyPeerFeedback,
  getMyReportScore
} from "@/src/lib/queries/development"

import { getProfile } from "@/src/lib/queries/get-profile"
import { getMyDevelopment } from "@/src/lib/queries/dashboard"
import { RefereeDevelopmentCard } from "@/src/components/development/DevelopmentSummaryCard"

export default async function DevelopmentPage() {

  const profile = await getProfile()

  const memberId = profile?.profile?.id;

  const developmentSummary = memberId
  ? await getMyDevelopment(memberId)
  : null

  const quizStats = memberId
    ? await getMyQuizStats(memberId)
    : null

  const attendanceStats = memberId
    ? await getMyAttendanceStats(memberId)
    : null

  const feedbackStats = memberId
    ? await getMyPeerFeedback(memberId)
    : null

  const reportStats = memberId
    ? await getMyReportScore(memberId)
    : null


  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Development
      </h1>

      {developmentSummary && (
          <DashboardCard title="Your Development Summary">

            <RefereeDevelopmentCard
              ranking_position={developmentSummary.ranking_position}
              development_score={developmentSummary.development_score}
              referee_level={developmentSummary.referee_level}
            />

          </DashboardCard>
        )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {quizStats && (
          <DashboardCard title="Quiz Performance">
            <QuizStatsCard {...quizStats} />
          </DashboardCard>
        )}

        {attendanceStats && (
          <DashboardCard title="Attendance">
            <AttendanceStatsCard {...attendanceStats} />
          </DashboardCard>
        )}

        {feedbackStats && (
          <DashboardCard title="Peer Feedback">

            <pre className="text-xs">
              {JSON.stringify(feedbackStats, null, 2)}
            </pre>

          </DashboardCard>
        )}

        {reportStats && (
          <DashboardCard title="Report Discipline">

            <pre className="text-xs">
              {JSON.stringify(reportStats, null, 2)}
            </pre>

          </DashboardCard>
        )}

        {!quizStats && !attendanceStats && !feedbackStats && !reportStats && (
            <div className="text-sm text-muted-foreground">
              No development data available yet.
            </div>
          )}
      </div>

    </div>
  )
}