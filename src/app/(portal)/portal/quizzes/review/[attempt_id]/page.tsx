import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Languages,
  MinusCircle,
  XCircle,
} from "lucide-react"

import { requireUser } from "@/src/lib/auth/require-user"
import { getQuizReview } from "@/src/lib/queries/get-quiz-review"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default async function QuizReviewPage({
  params,
}: {
  params: Promise<{
    attempt_id: string
  }>
}) {
  const user = await requireUser()

  const { attempt_id } = await params

  let review

  try {
    review = await getQuizReview({
      attemptId: attempt_id,
      memberId: user.id,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load quiz results."

    return (
      <div className="mx-auto max-w-xl px-3 sm:px-0">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-400" />

          <p className="mt-3 font-semibold text-amber-100">
            Review unavailable
          </p>

          <p className="mt-2 text-sm leading-relaxed text-amber-100/70">
            {message}
          </p>

          <Link
            href="/portal/quizzes"
            className="
              mt-5
              inline-flex
              rounded-xl
              bg-yellow-400
              px-4
              py-2.5
              text-sm
              font-semibold
              text-black
              transition
              hover:bg-yellow-300
            "
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="mx-auto max-w-xl px-3 sm:px-0">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-6 text-center">
          <XCircle className="mx-auto h-8 w-8 text-red-400" />

          <p className="mt-3 font-semibold text-red-100">
            Quiz attempt not found
          </p>

          <p className="mt-2 text-sm text-red-100/70">
            This attempt does not exist or does not belong to your account.
          </p>

          <Link
            href="/portal/quizzes"
            className="mt-5 inline-flex rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-1 pb-10 sm:px-0">
      <PortalPageHeader
        title={review.version.title}
        subtitle="Review your answers and learn from each question."
      />

      {/* SUMMARY */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
        <div className="border-b border-white/10 bg-gradient-to-r from-emerald-950/60 to-[#0B0F0F] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>

            <div>
              <p className="font-semibold text-white">
                Attempt completed
              </p>

              <p className="mt-0.5 text-sm text-gray-400">
                {review.assessment.title}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-[1.2fr_1fr] sm:p-6">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-6 text-center">
            <p className="text-xs uppercase tracking-[0.14em] text-emerald-300/70">
              Score
            </p>

            <p className="mt-2 text-5xl font-bold text-white">
              {formatScore(
                review.attempt.score
              )}
              %
            </p>

            <p className="mt-2 text-sm text-emerald-100/70">
              {review.attempt.correctCount} of{" "}
              {review.attempt.totalQuestions} correct
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SummaryItem
              label="Attempt"
              value={`${review.attempt.attemptNumber} of ${review.assessment.maxAttempts}`}
            />

            <SummaryItem
              label="Language"
              value={
                review.version.language ===
                "es"
                  ? "Español"
                  : "English"
              }
              icon={
                <Languages className="h-4 w-4" />
              }
            />

            <SummaryItem
              label="Status"
              value={
                review.attempt.status ===
                "expired"
                  ? "Time expired"
                  : "Submitted"
              }
            />

            <SummaryItem
              label="Time used"
              value={formatDuration(
                review.attempt.timeUsedSeconds
              )}
              icon={
                <Clock3 className="h-4 w-4" />
              }
            />
          </div>
        </div>
      </section>

      {/* QUESTION REVIEW */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Question Review
          </h2>

          <p className="text-sm text-gray-500">
            Your original question and option order are preserved below.
          </p>
        </div>

        {review.questions.map(
          (question) => (
            <article
              key={
                question.attemptQuestionId
              }
              className={`
                overflow-hidden
                rounded-2xl
                border
                bg-[#0B0F0F]/90
                ${
                  question.isInvalidated
                    ? "border-amber-500/25"
                    : question.isCorrect
                      ? "border-emerald-500/20"
                      : "border-red-500/20"
                }
              `}
            >
              <div className="flex items-start gap-3 border-b border-white/10 px-4 py-5 sm:px-6">
                <QuestionStatusIcon
                  isCorrect={
                    question.isCorrect
                  }
                  isInvalidated={
                    question.isInvalidated
                  }
                />

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
                    Question{" "}
                    {question.position}
                  </p>

                  <h3 className="mt-1 text-base font-semibold leading-relaxed text-white sm:text-lg">
                    {question.questionText}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 p-4 sm:p-6">
                {question.options.map(
                  (option, index) => (
                    <div
                      key={option.id}
                      className={`
                        flex
                        min-h-14
                        items-center
                        gap-3
                        rounded-xl
                        border
                        px-4
                        py-3
                        ${
                          option.isCorrect
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : option.isSelected
                              ? "border-red-500/30 bg-red-500/10"
                              : "border-white/10 bg-white/[0.025]"
                        }
                      `}
                    >
                      <span
                        className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          border
                          text-sm
                          font-semibold
                          ${
                            option.isCorrect
                              ? "border-emerald-400 bg-emerald-500 text-black"
                              : option.isSelected
                                ? "border-red-400 bg-red-500 text-white"
                                : "border-white/10 bg-black/20 text-gray-500"
                          }
                        `}
                      >
                        {getOptionLabel(index)}
                      </span>

                      <span className="min-w-0 flex-1 text-sm leading-relaxed text-gray-200 sm:text-base">
                        {option.text}
                      </span>

                      <div className="shrink-0">
                        {option.isCorrect && (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                            Correct
                          </span>
                        )}

                        {option.isSelected &&
                          !option.isCorrect && (
                            <span className="flex items-center gap-1 text-xs font-medium text-red-300">
                              <XCircle className="h-4 w-4" />
                              Your answer
                            </span>
                          )}

                        {option.isSelected &&
                          option.isCorrect && (
                            <span className="ml-2 text-xs text-emerald-200/70">
                              Your answer
                            </span>
                          )}
                      </div>
                    </div>
                  )
                )}

                {question.isUnanswered && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    <MinusCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                      You did not answer this question.
                    </span>
                  </div>
                )}

                {question.isInvalidated ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    <p className="font-semibold">
                      Question removed from scoring
                    </p>

                    {question.invalidationReason && (
                      <p className="mt-1 text-amber-100/70">
                        {
                          question.invalidationReason
                        }
                      </p>
                    )}
                  </div>
                ) : (
                  question.explanation && (
                    <div className="rounded-xl border border-sky-500/15 bg-sky-500/[0.07] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-300">
                        Explanation
                      </p>

                      <p className="mt-2 text-sm leading-relaxed text-gray-300">
                        {
                          question.explanation
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </article>
          )
        )}
      </section>

      <div className="flex justify-center">
        <Link
          href="/portal/quizzes"
          className="
            inline-flex
            min-h-11
            w-full
            items-center
            justify-center
            rounded-xl
            bg-yellow-400
            px-6
            text-sm
            font-semibold
            text-black
            transition
            hover:bg-yellow-300
            sm:w-auto
          "
        >
          Back to Quizzes
        </Link>
      </div>
    </div>
  )
}

function QuestionStatusIcon({
  isCorrect,
  isInvalidated,
}: {
  isCorrect: boolean
  isInvalidated: boolean
}) {
  if (isInvalidated) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
      </div>
    )
  }

  if (isCorrect) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
      <XCircle className="h-4 w-4 text-red-400" />
    </div>
  )
}

function SummaryItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}

        <p className="text-xs uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p className="mt-1 truncate font-semibold text-white">
        {value}
      </p>
    </div>
  )
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

function formatScore(score: number) {
  return Number.isInteger(score)
    ? String(score)
    : score.toFixed(2)
}

function getOptionLabel(index: number) {
  return String.fromCharCode(65 + index)
}