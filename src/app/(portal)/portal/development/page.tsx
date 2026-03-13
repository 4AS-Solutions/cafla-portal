import { DashboardCard } from "@/src/components/dashboard/DashboardCard"
import { QuizStatsCard } from "@/src/components/development/QuizStatsCard"
import { AttendanceStatsCard } from "@/src/components/development/AttendanceStatsCard"
import { DevelopmentProgressChart } from "@/src/components/development/DevelopmentProgressChart"

import {
  getMyQuizStats,
  getMyAttendanceStats,
  getMyPeerFeedback,
  getMyReportScore
} from "@/src/lib/queries/development"

import { getProfile } from "@/src/lib/queries/get-profile"
import { getMyDevelopment } from "@/src/lib/queries/dashboard"
import { DevelopmentRadar } from "@/src/components/development/DevelopmentRadar"
import { DevelopmentOverview } from "@/src/components/development/DevelopmentOverview"

export default async function DevelopmentPage() {

  const profile = await getProfile()

  const memberId = profile?.profile?.id

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


  const radarData = [
    {
      skill: "Attendance",
      score: Number(attendanceStats?.attendance_percentage ?? 0)
    },
    {
      skill: "Reports",
      score: Number(reportStats?.report_score ?? 0)
    },
    {
      skill: "Peer Feedback",
      score: Number(feedbackStats?.peer_feedback_score ?? 0)
    },
    {
      skill: "Quizzes",
      score: Number(quizStats?.avg_quiz_score ?? 0)
    }
  ]


  // mock monthly progress (future DB)

  const monthlyProgress = [
    { month: "Jan", score: 42 },
    { month: "Feb", score: 48 },
    { month: "Mar", score: Number(developmentSummary?.development_score ?? 50) }
  ]


  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Development
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          Track your referee growth and performance metrics
        </p>

        <p className="text-xs text-gray-500 mt-1">
          Data last updated: {lastUpdated}
        </p>
      </div>

      {developmentSummary && (
        <DashboardCard title="Development Overview">
          <DevelopmentOverview
            ranking_position={developmentSummary.ranking_position}
            development_score={developmentSummary.development_score}
            referee_level={developmentSummary.referee_level}
          />
        </DashboardCard>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Performance Breakdown">
          <DevelopmentRadar data={radarData} />
        </DashboardCard>

        <DashboardCard title="Development Progress">
          <DevelopmentProgressChart data={monthlyProgress} />
        </DashboardCard>
      </div>


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
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Communication</span>
                <span>{Number(feedbackStats.avg_communication).toFixed(1)}</span>
              </div>

              <div className="flex justify-between">
                <span>Teamwork</span>
                <span>{Number(feedbackStats.avg_teamwork).toFixed(1)}</span>
              </div>

              <div className="flex justify-between">
                <span>Fitness</span>
                <span>{Number(feedbackStats.avg_fitness).toFixed(1)}</span>
              </div>

              <div className="flex justify-between">
                <span>Professionalism</span>
                <span>{Number(feedbackStats.avg_professionalism).toFixed(1)}</span>
              </div>
            </div>
          </DashboardCard>
        )}

        {reportStats && (
          <DashboardCard title="Report Discipline">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Report Score</span>
                <span>{Number(reportStats.report_score).toFixed(0)}%</span>
              </div>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  )
}