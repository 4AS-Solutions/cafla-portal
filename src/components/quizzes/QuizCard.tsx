import Link from "next/link"
import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Languages,
  LockKeyhole,
  PlayCircle,
  RotateCcw,
} from "lucide-react"

import type {
  MemberQuiz,
  QuizLanguage,
} from "@/src/lib/queries/get-quizzes"

import { Button } from "@/src/components/ui/button"

type QuizCardProps = {
  quiz: MemberQuiz
}

const statusStyles = {
  available:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  upcoming:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  closed:
    "border-red-500/20 bg-red-500/10 text-red-300",
  archived:
    "border-gray-500/20 bg-gray-500/10 text-gray-300",
}

const statusLabels = {
  available: "Available",
  upcoming: "Upcoming",
  closed: "Closed",
  archived: "Archived",
}

export default function QuizCard({
  quiz,
}: QuizCardProps) {
  const canStart =
    quiz.status === "available" &&
    quiz.attemptsRemaining > 0 &&
    !quiz.activeAttempt

  const hasResult =
    quiz.bestScore !== null &&
    quiz.bestAttemptId !== null

  return (
    <article
      className="
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-[#0B0F0F]/90
        shadow-xl
        shadow-black/10
        transition
        hover:border-yellow-400/25
      "
    >
      <div className="flex-1 space-y-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`
                  rounded-full
                  border
                  px-2.5
                  py-1
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  ${statusStyles[quiz.status]}
                `}
              >
                {statusLabels[quiz.status]}
              </span>

              {quiz.required && (
                <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-300">
                  Required
                </span>
              )}

              {quiz.hasIndividualAccess && (
                <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                  Special access
                </span>
              )}
            </div>

            <h3 className="mt-3 text-lg font-semibold text-white">
              {quiz.title}
            </h3>

            {quiz.description && (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-400">
                {quiz.description}
              </p>
            )}
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-400/15 bg-yellow-400/10">
            <BookOpenCheck className="h-5 w-5 text-yellow-300" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoItem
            icon={<Clock3 className="h-4 w-4" />}
            label="Time limit"
            value={`${quiz.timeLimitMinutes} min`}
          />

          <InfoItem
            icon={<BookOpenCheck className="h-4 w-4" />}
            label="Questions"
            value={String(
              quiz.questionsPerAttempt
            )}
          />

          <InfoItem
            icon={<RotateCcw className="h-4 w-4" />}
            label="Attempts"
            value={`${quiz.attemptsUsed} / ${quiz.maxAttempts}`}
          />

          <InfoItem
            icon={<Languages className="h-4 w-4" />}
            label="Languages"
            value={quiz.languages
              .map((version) =>
                getLanguageLabel(
                  version.language
                )
              )
              .join(" · ")}
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Best score
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {quiz.bestScore === null
                  ? "—"
                  : `${quiz.bestScore}%`}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Remaining
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-200">
                {quiz.attemptsRemaining}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-gray-500">
          {quiz.effectiveOpenFrom && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" />

              <span>
                Opens{" "}
                {formatQuizDate(
                  quiz.effectiveOpenFrom
                )}
              </span>
            </div>
          )}

          {quiz.effectiveOpenUntil && (
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 shrink-0" />

              <span>
                Closes{" "}
                {formatQuizDate(
                  quiz.effectiveOpenUntil
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20 p-4 sm:p-5">
        {quiz.activeAttempt ? (
          <Link
            href={`/portal/quizzes/${quiz.id}?attempt=${quiz.activeAttempt.id}`}
            className="block"
          >
            <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300">
              <PlayCircle className="mr-2 h-4 w-4" />
              Resume Quiz
            </Button>
          </Link>
        ) : canStart ? (
          <div className="space-y-2">
            <p className="text-center text-xs text-gray-500">
              Choose your language to begin
            </p>

            <div
              className={`
                grid
                gap-2
                ${
                  quiz.languages.length > 1
                    ? "grid-cols-2"
                    : "grid-cols-1"
                }
              `}
            >
              {quiz.languages.map(
                (version) => (
                  <Link
                    key={version.versionId}
                    href={`/portal/quizzes/${quiz.id}?language=${version.language}`}
                  >
                    <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {getLanguageLabel(
                        version.language
                      )}
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>
        ) : hasResult &&
          quiz.reviewUnlocked ? (
          <Link
            href={`/portal/quizzes/review/${quiz.bestAttemptId}`}
            className="block"
          >
            <Button className="w-full bg-emerald-500 text-black hover:bg-emerald-400">
              <BarChart3 className="mr-2 h-4 w-4" />
              Review Results
            </Button>
          </Link>
        ) : hasResult ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <LockKeyhole className="h-4 w-4" />
              Detailed review is locked
            </div>

            {quiz.status === "available" &&
              quiz.attemptsRemaining > 0 && (
                <p className="text-center text-xs text-gray-500">
                  Use your remaining attempts or score 100% to unlock the review.
                </p>
              )}
          </div>
        ) : quiz.status === "upcoming" ? (
          <div className="text-center text-sm text-gray-500">
            This quiz is not open yet.
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <CheckCircle2 className="h-4 w-4" />

            {quiz.required
              ? "No completed attempt"
              : "Quiz unavailable"}
          </div>
        )}
      </div>
    </article>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.025] px-3 py-3">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate font-medium text-gray-200">
        {value || "—"}
      </p>
    </div>
  )
}

function getLanguageLabel(
  language: QuizLanguage
) {
  return language === "es"
    ? "Español"
    : "English"
}

function formatQuizDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "America/Los_Angeles",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value))
}