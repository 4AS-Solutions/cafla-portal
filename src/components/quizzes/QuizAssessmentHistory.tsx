import Link from "next/link"
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock3,
  Eye,
  Languages,
  LockKeyhole,
  Trophy,
} from "lucide-react"

import type {
  PortalQuizAssessmentAttempt,
  PortalQuizAssessmentHistory,
} from "@/src/lib/queries/get-quiz-assessment-history"

export default function QuizAssessmentHistory({
  history,
}: {
  history: PortalQuizAssessmentHistory
}) {
  return (
    <div className="space-y-6">
      <Summary history={history} />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Attempts
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Newest attempt appears first.
          </p>
        </div>

        {history.attempts.map(
          (attempt) => (
            <AttemptCard
              key={attempt.id}
              attempt={attempt}
              maxAttempts={
                history.assessment
                  .maxAttempts
              }
            />
          )
        )}
      </section>
    </div>
  )
}

function Summary({
  history,
}: {
  history: PortalQuizAssessmentHistory
}) {
  const {
    assessment,
    summary,
  } = history

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
      <div className="border-b border-white/10 bg-gradient-to-r from-emerald-950/50 to-[#0B0F0F] px-4 py-5 sm:px-6">
        <p className="font-semibold text-white">
          {assessment.title}
        </p>

        {assessment.description && (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-400">
            {assessment.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
        <SummaryMetric
          label="Attempts Used"
          value={`${summary.attemptsUsed}/${assessment.maxAttempts}`}
        />

        <SummaryMetric
          label="Remaining"
          value={String(
            summary.attemptsRemaining
          )}
        />

        <SummaryMetric
          label="Best Score"
          value={
            summary.bestScore === null
              ? "—"
              : `${formatScore(
                  summary.bestScore
                )}%`
          }
        />

        <SummaryMetric
          label="Completed"
          value={String(
            summary.completedAttempts
          )}
        />
      </div>

      <div
        className={`
          flex
          items-start
          gap-3
          border-t
          px-4
          py-4
          text-sm
          sm:px-6
          ${
            summary.reviewUnlocked
              ? "border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-100/80"
              : "border-amber-500/15 bg-amber-500/[0.06] text-amber-100/80"
          }
        `}
      >
        {summary.reviewUnlocked ? (
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
        ) : (
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        )}

        <p className="leading-relaxed">
          {summary.reviewUnlocked
            ? "Detailed answer review is unlocked for all completed attempts."
            : "Detailed answers remain locked until you score 100% or use all available attempts."}
        </p>
      </div>
    </section>
  )
}

function AttemptCard({
  attempt,
  maxAttempts,
}: {
  attempt: PortalQuizAssessmentAttempt
  maxAttempts: number
}) {
  return (
    <article
      className={`
        overflow-hidden
        rounded-2xl
        border
        bg-[#0B0F0F]/90
        ${
          attempt.isBestAttempt
            ? "border-yellow-400/25"
            : attempt.status ===
                "in_progress"
              ? "border-amber-500/20"
              : attempt.status ===
                  "expired"
                ? "border-red-500/20"
                : "border-white/10"
        }
      `}
    >
      <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <AttemptIcon
            status={attempt.status}
            isBestAttempt={
              attempt.isBestAttempt
            }
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-white">
                Attempt{" "}
                {attempt.attemptNumber} of{" "}
                {maxAttempts}
              </p>

              {attempt.isBestAttempt && (
                <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-300">
                  <Trophy className="h-3 w-3" />
                  Best
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Started{" "}
              {formatDateTime(
                attempt.startedAt
              )}
            </p>
          </div>
        </div>

        <ScoreBadge
          score={attempt.score}
          status={attempt.status}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">
        <AttemptInfo
          label="Status"
          value={formatStatus(
            attempt.status
          )}
        />

        <AttemptInfo
          label="Language"
          value={
            attempt.language === "es"
              ? "Español"
              : "English"
          }
          icon={
            <Languages className="h-4 w-4" />
          }
        />

        <AttemptInfo
          label="Time"
          value={formatDuration(
            attempt.timeUsedSeconds
          )}
          icon={
            <Clock3 className="h-4 w-4" />
          }
        />

        <AttemptInfo
          label="Correct"
          value={
            attempt.correctCount ===
              null ||
            attempt.totalQuestions ===
              null
              ? "—"
              : `${attempt.correctCount}/${attempt.totalQuestions}`
          }
        />
      </div>

      <div className="border-t border-white/10 bg-black/20 p-3">
        {attempt.status ===
        "in_progress" ? (
          <div className="flex min-h-11 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 text-sm font-medium text-amber-300">
            <Clock3 className="mr-2 h-4 w-4" />
            Attempt in progress
          </div>
        ) : attempt.reviewAvailable ? (
          <Link
            href={`/portal/quizzes/review/${attempt.id}`}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
          >
            <Eye className="h-4 w-4" />
            Review Attempt
          </Link>
        ) : (
          <div className="flex min-h-11 items-center justify-center rounded-xl border border-white/5 bg-white/[0.015] px-4 text-sm font-medium text-gray-600">
            <LockKeyhole className="mr-2 h-4 w-4" />
            Review locked
          </div>
        )}
      </div>
    </article>
  )
}

function AttemptIcon({
  status,
  isBestAttempt,
}: {
  status:
    PortalQuizAssessmentAttempt["status"]
  isBestAttempt: boolean
}) {
  if (isBestAttempt) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10">
        <Award className="h-5 w-5 text-yellow-300" />
      </div>
    )
  }

  if (status === "submitted") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
      </div>
    )
  }

  if (status === "expired") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
        <AlertTriangle className="h-5 w-5 text-red-300" />
      </div>
    )
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
      <Clock3 className="h-5 w-5 text-amber-300" />
    </div>
  )
}

function SummaryMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="bg-[#0B0F0F] px-4 py-4 sm:px-5">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function AttemptInfo({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}

        <p className="truncate text-xs uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p
        className="mt-1 truncate text-sm font-medium text-white"
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

function ScoreBadge({
  score,
  status,
}: {
  score: number | null
  status:
    PortalQuizAssessmentAttempt["status"]
}) {
  if (
    score === null ||
    status === "in_progress"
  ) {
    return (
      <span className="text-2xl font-bold text-gray-700">
        —
      </span>
    )
  }

  return (
    <span
      className={`
        inline-flex
        min-w-20
        items-center
        justify-center
        rounded-xl
        border
        px-3
        py-2
        text-xl
        font-bold
        ${getScoreStyle(score)}
      `}
    >
      {formatScore(score)}%
    </span>
  )
}

function formatStatus(
  status:
    PortalQuizAssessmentAttempt["status"]
) {
  if (status === "submitted") {
    return "Submitted"
  }

  if (status === "expired") {
    return "Time Expired"
  }

  return "In Progress"
}

function formatDuration(
  seconds: number | null
) {
  if (seconds === null) {
    return "—"
  }

  const minutes =
    Math.floor(seconds / 60)

  const remainingSeconds =
    seconds % 60

  return `${minutes}m ${remainingSeconds}s`
}

function formatDateTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        "America/Los_Angeles",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value))
}

function formatScore(score: number) {
  return Number.isInteger(score)
    ? String(score)
    : score.toFixed(2)
}

function getScoreStyle(
  score: number
) {
  if (score === 100) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
  }

  if (score >= 80) {
    return "border-sky-500/30 bg-sky-500/10 text-sky-300"
  }

  if (score >= 70) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300"
  }

  return "border-red-500/30 bg-red-500/10 text-red-300"
}