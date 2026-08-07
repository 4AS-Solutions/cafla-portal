import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Languages,
  MinusCircle,
  UserRound,
  XCircle,
} from "lucide-react"

import type {
  AdminQuizAttemptReview,
} from "@/src/lib/queries/get-admin-quiz-attempt-review"

type QuizAttemptReviewContentProps = {
  review: AdminQuizAttemptReview
}

export default function QuizAttemptReviewContent({
  review,
}: QuizAttemptReviewContentProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* MEMBER + ASSESSMENT */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/95">
        <div className="border-b border-white/10 bg-gradient-to-r from-emerald-950/60 to-[#0B0F0F] px-4 py-5 sm:px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <UserRound className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-white">
                {review.member.fullName}
              </p>

              <p className="mt-1 text-sm leading-relaxed text-gray-400">
                {review.assessment.title}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[1.1fr_1fr] sm:p-5">
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
                review.version.language === "es"
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
                review.attempt.status === "expired"
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

      {/* ATTEMPT DETAILS */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailItem
          label="Started"
          value={formatDateTime(
            review.attempt.startedAt
          )}
        />

        <DetailItem
          label="Submitted"
          value={
            review.attempt.submittedAt
              ? formatDateTime(
                  review.attempt.submittedAt
                )
              : "Not submitted"
          }
        />
      </section>

      {/* QUESTION REVIEW */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Question Review
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            The original question and option order shown during this attempt are preserved.
          </p>
        </div>

        {review.questions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/90 px-5 py-10 text-center">
            <AlertTriangle className="mx-auto h-7 w-7 text-amber-400" />

            <p className="mt-3 font-medium text-white">
              No question snapshots found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              This attempt does not contain reviewable questions.
            </p>
          </div>
        ) : (
          review.questions.map(
            (question) => (
              <QuestionReviewCard
                key={
                  question.attemptQuestionId
                }
                question={question}
              />
            )
          )
        )}
      </section>
    </div>
  )
}

function QuestionReviewCard({
  question,
}: {
  question:
    AdminQuizAttemptReview["questions"][number]
}) {
  return (
    <article
      className={`
        overflow-hidden
        rounded-2xl
        border
        bg-[#0B0F0F]/95
        ${
          question.isInvalidated
            ? "border-amber-500/25"
            : question.isCorrect
              ? "border-emerald-500/20"
              : "border-red-500/20"
        }
      `}
    >
      <div className="flex items-start gap-3 border-b border-white/10 px-4 py-5">
        <QuestionStatusIcon
          isCorrect={question.isCorrect}
          isInvalidated={
            question.isInvalidated
          }
        />

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
            Question {question.position}
          </p>

          <h3 className="mt-1 text-base font-semibold leading-relaxed text-white">
            {question.questionText}
          </h3>
        </div>
      </div>

      <div className="space-y-3 p-4">
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
                px-3
                py-3
                sm:px-4
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

              <span className="min-w-0 flex-1 text-sm leading-relaxed text-gray-200">
                {option.text}
              </span>

              <OptionStatus
                isCorrect={option.isCorrect}
                isSelected={option.isSelected}
              />
            </div>
          )
        )}

        {question.isUnanswered && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <MinusCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>
              The member did not answer this question.
            </span>
          </div>
        )}

        {question.isInvalidated ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <p className="font-semibold">
              Question removed from scoring
            </p>

            {question.invalidationReason && (
              <p className="mt-1 leading-relaxed text-amber-100/70">
                {question.invalidationReason}
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
                {question.explanation}
              </p>
            </div>
          )
        )}
      </div>
    </article>
  )
}

function OptionStatus({
  isCorrect,
  isSelected,
}: {
  isCorrect: boolean
  isSelected: boolean
}) {
  if (isCorrect && isSelected) {
    return (
      <div className="shrink-0 text-right">
        <span className="flex items-center justify-end gap-1 text-xs font-medium text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Correct
        </span>

        <span className="mt-0.5 block text-[11px] text-emerald-200/60">
          Member answer
        </span>
      </div>
    )
  }

  if (isCorrect) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
        Correct
      </span>
    )
  }

  if (isSelected) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-red-300">
        <XCircle className="h-4 w-4" />
        Member answer
      </span>
    )
  }

  return null
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
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}

        <p className="truncate text-xs uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p
        className="mt-1 truncate font-semibold text-white"
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0B0F0F]/90 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-white">
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

function formatDateTime(value: string) {
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

function getOptionLabel(index: number) {
  return String.fromCharCode(65 + index)
}