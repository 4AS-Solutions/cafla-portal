import { DashboardCard } from "@/src/components/dashboard/DashboardCard"
import { AttendanceStatsCard } from "@/src/components/development/AttendanceStatsCard"
import { DevelopmentOverview } from "@/src/components/development/DevelopmentOverview"
import { DevelopmentProgressChart } from "@/src/components/development/DevelopmentProgressChart"
import { DevelopmentRadar } from "@/src/components/development/DevelopmentRadar"
import { EvaluationStatsCard } from "@/src/components/development/EvaluationStatsCard"
import { QuizStatsCard } from "@/src/components/development/QuizStatsCard"
import { ReportStatsCard } from "@/src/components/development/ReportStatsCard"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { requireUser } from "@/src/lib/auth/require-user"
import { getDevelopmentPageRankingData } from "@/src/lib/queries/get-development-ranking-v2"
import { getUserAttendance } from "@/src/lib/queries/get-user-attendance"
import { getUserEvaluationScore } from "@/src/lib/queries/get-user-evaluation-score"
import { getUserQuizScore } from "@/src/lib/queries/get-user-quiz-score"
import { getUserReportScore } from "@/src/lib/queries/get-user-report-score"

export default async function DevelopmentPage() {
  const user = await requireUser()

  const [rankingData, attendance, quizScore, evaluationScore, reportScore] =
    await Promise.all([
      getDevelopmentPageRankingData(),
      getUserAttendance(user.id),
      getUserQuizScore(),
      getUserEvaluationScore(),
      getUserReportScore(),
    ])

  const radarData = [
    { skill: "Attendance", score: attendance.cycle ? attendance.stats.percentage : null },
    { skill: "Reports", score: reportScore?.report_percentage ?? null },
    { skill: "Peer Feedback", score: evaluationScore?.evaluation_score ?? null },
    { skill: "Quizzes", score: quizScore?.quiz_score ?? null },
  ]

  const lastUpdated = rankingData.current?.snapshot_date
    ? new Date(`${rankingData.current.snapshot_date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
    : "Unavailable"

  return (
    <div className="space-y-8">
      <div>
        <PortalPageHeader title="Development" subtitle="Track your referee growth and performance metrics." />
        <p className="mt-1 text-xs text-gray-500">Data last updated: {lastUpdated}</p>
      </div>

      {rankingData.current && (
        <DashboardCard title="Development Overview">
          <DevelopmentOverview
            development_score={rankingData.current.development_score}
            evidence_percentage={rankingData.current.evidence_percentage}
            evidence_status={rankingData.current.evidence_status}
            ranking_eligible={rankingData.current.ranking_eligible}
            ranking_position={rankingData.current.ranking_position}
          />
        </DashboardCard>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Performance Breakdown">
          <DevelopmentRadar data={radarData} />
        </DashboardCard>
        <DashboardCard title="Development Progress">
          <DevelopmentProgressChart data={rankingData.history} />
        </DashboardCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Quiz Performance">
          {quizScore ? (
            <QuizStatsCard {...quizScore} />
          ) : (
            <p className="text-sm text-gray-500">No quiz score is available for the active cycle.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Attendance">
          {attendance.cycle ? (
            <AttendanceStatsCard
              attendance_percentage={attendance.stats.percentage}
              sessions_present={attendance.stats.present}
              sessions_excused={attendance.stats.excused}
              sessions_late={attendance.stats.late}
              sessions_total={attendance.stats.total}
            />
          ) : (
            <p className="text-sm text-gray-500">No attendance data is available for the active cycle.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Peer Feedback">
          <EvaluationStatsCard score={evaluationScore} />
        </DashboardCard>

        <DashboardCard title="Report Discipline">
          <ReportStatsCard score={reportScore} />
        </DashboardCard>
      </div>
    </div>
  )
}
