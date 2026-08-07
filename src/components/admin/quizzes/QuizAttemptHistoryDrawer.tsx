"use client"

import { AdminQuizAttemptHistory, AdminQuizAttemptHistoryItem } from "@/src/lib/queries/get-admin-quiz-history"
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock3,
  Eye,
  FileClock,
  Languages,
  Loader2,
  Trophy,
  X,
} from "lucide-react"
import {
  useEffect,
  useState,
} from "react"



type QuizAttemptHistoryDrawerProps = {
  assessmentId: string
  memberId: string | null
  open: boolean
  onClose: () => void
  onReviewAttempt: (
    attemptId: string
  ) => void
}

type HistoryResponse = {
  success: boolean
  history?: AdminQuizAttemptHistory
  error?: string
}

export default function QuizAttemptHistoryDrawer({
  assessmentId,
  memberId,
  open,
  onClose,
  onReviewAttempt,
}: QuizAttemptHistoryDrawerProps) {
  const [history, setHistory] =
    useState<AdminQuizAttemptHistory | null>(
      null
    )

  const [loading, setLoading] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  useEffect(() => {
    if (
      !open ||
      !assessmentId ||
      !memberId
    ) {
      return
    }

    const controller =
      new AbortController()

    async function loadHistory() {
      setLoading(true)
      setHistory(null)
      setErrorMessage(null)

      try {
        const response = await fetch(
          `/api/admin/quizzes/${assessmentId}/members/${memberId}/attempts`,
          {
            method: "GET",
            cache: "no-store",
            signal:
              controller.signal,
          }
        )

        const result =
          (await response.json()) as HistoryResponse

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Unable to load attempt history."
          )
        }

        if (!result.history) {
          throw new Error(
            "The history response did not contain attempt data."
          )
        }

        setHistory(result.history)
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load attempt history."
        )
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false)
        }
      }
    }

    void loadHistory()

    return () => {
      controller.abort()
    }
  }, [
    assessmentId,
    memberId,
    open,
  ])

  useEffect(() => {
    if (!open) return

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      "hidden"

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        "keydown",
        handleKeyDown
      )
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        justify-end
      "
      role="dialog"
      aria-modal="true"
      aria-label="Quiz attempt history"
    >
      {/* OVERLAY */}
      <button
        type="button"
        aria-label="Close attempt history"
        onClick={onClose}
        className="
          absolute
          inset-0
          bg-black/70
          backdrop-blur-sm
        "
      />

      {/* DRAWER */}
      <aside
        className="
          relative
          z-10
          flex
          h-full
          w-full
          flex-col
          border-l
          border-white/10
          bg-[#07100E]
          shadow-2xl
          sm:max-w-xl
          xl:max-w-2xl
        "
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-sky-950/50 to-[#07100E] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-300/70">
              Assessment Results
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Attempt History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review every attempt used by this member.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              text-gray-400
              transition
              hover:bg-white/[0.08]
              hover:text-white
            "
            aria-label="Close attempt history"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-3 py-4 sm:px-5 sm:py-5">
            {loading ? (
              <LoadingState />
            ) : errorMessage ? (
              <ErrorState
                message={errorMessage}
              />
            ) : history ? (
              <HistoryContent
                history={history}
                onReviewAttempt={
                  onReviewAttempt
                }
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}

function HistoryContent({
  history,
  onReviewAttempt,
}: {
  history: AdminQuizAttemptHistory
  onReviewAttempt: (
    attemptId: string
  ) => void
}) {
  return (
    <div className="space-y-6 pb-8">
      {/* MEMBER SUMMARY */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/95">
        <div className="border-b border-white/10 bg-gradient-to-r from-sky-950/40 to-[#0B0F0F] px-4 py-5">
          <p className="font-semibold text-white">
            {history.member.fullName}
          </p>

          <p className="mt-1 text-sm text-gray-400">
            {history.assessment.title}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          <SummaryMetric
            label="Used"
            value={`${history.summary.attemptsUsed}/${history.assessment.maxAttempts}`}
          />

          <SummaryMetric
            label="Remaining"
            value={String(
              history.summary
                .attemptsRemaining
            )}
          />

          <SummaryMetric
            label="Best Score"
            value={
              history.summary.bestScore ===
              null
                ? "—"
                : `${formatScore(
                    history.summary
                      .bestScore
                  )}%`
            }
          />

          <SummaryMetric
            label="Completed"
            value={String(
              history.summary
                .completedAttempts
            )}
          />
        </div>
      </section>

      {/* ATTEMPTS */}
      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-white">
            Attempts
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Newest attempt appears first.
          </p>
        </div>

        {history.attempts.length ===
        0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/90 px-5 py-10 text-center">
            <FileClock className="mx-auto h-7 w-7 text-gray-700" />

            <p className="mt-3 font-medium text-white">
              No attempts found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              This member has not started the assessment.
            </p>
          </div>
        ) : (
          history.attempts.map(
            (attempt) => (
              <AttemptCard
                key={attempt.id}
                attempt={attempt}
                maxAttempts={
                  history.assessment
                    .maxAttempts
                }
                onReview={() =>
                  onReviewAttempt(
                    attempt.id
                  )
                }
              />
            )
          )
        )}
      </section>
    </div>
  )
}

function AttemptCard({
  attempt,
  maxAttempts,
  onReview,
}: {
  attempt: AdminQuizAttemptHistoryItem
  maxAttempts: number
  onReview: () => void
}) {
  return (
    <article
      className={`
        overflow-hidden
        rounded-2xl
        border
        bg-[#0B0F0F]/95
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
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <AttemptStatusIcon
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

        <ScoreDisplay
          score={attempt.score}
          status={attempt.status}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        <AttemptInfo
          label="Status"
          value={formatAttemptStatus(
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
        <button
          type="button"
          disabled={
            !attempt.reviewAvailable
          }
          onClick={onReview}
          className={`
            inline-flex
            min-h-10
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            px-4
            text-sm
            font-medium
            transition
            ${
              attempt.reviewAvailable
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                : "cursor-not-allowed border-white/5 bg-white/[0.015] text-gray-700"
            }
          `}
          title={
            attempt.reviewAvailable
              ? "Review this attempt."
              : attempt.status ===
                  "in_progress"
                ? "This attempt is still in progress."
                : "Detailed review is not unlocked yet."
          }
        >
          <Eye className="h-4 w-4" />

          {attempt.status ===
          "in_progress"
            ? "Attempt In Progress"
            : "Review Attempt"}
        </button>
      </div>
    </article>
  )
}

function AttemptStatusIcon({
  status,
  isBestAttempt,
}: {
  status:
    AdminQuizAttemptHistoryItem["status"]
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

function ScoreDisplay({
  score,
  status,
}: {
  score: number | null
  status:
    AdminQuizAttemptHistoryItem["status"]
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

function SummaryMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
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

function LoadingState() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-sky-400" />

        <p className="mt-3 text-sm font-medium text-white">
          Loading attempt history...
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Retrieving all attempts for this member.
        </p>
      </div>
    </div>
  )
}

function ErrorState({
  message,
}: {
  message: string
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />

        <p className="mt-3 font-semibold text-red-100">
          Unable to load history
        </p>

        <p className="mt-2 text-sm leading-relaxed text-red-100/70">
          {message}
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <p className="font-medium text-white">
          No member selected
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Select a member to view attempt history.
        </p>
      </div>
    </div>
  )
}

function formatAttemptStatus(
  status:
    AdminQuizAttemptHistoryItem["status"]
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

  const minutes = Math.floor(
    seconds / 60
  )

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