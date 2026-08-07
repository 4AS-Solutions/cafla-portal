"use client"

import Link from "next/link"
import {
  Award,
  CheckCircle2,
  Clock3,
  Eye,
  History,
  Languages,
  LockKeyhole,
  RotateCcw,
} from "lucide-react"

import type {
  PortalQuizHistoryAssessment,
} from "@/src/lib/queries/get-quiz-history"

type Props = {
  assessment: PortalQuizHistoryAssessment
}

export default function QuizHistoryCard({
  assessment,
}: Props) {
  const {
    assessmentId,
    title,
    description,
    maxAttempts,
    attemptsUsed,
    attemptsRemaining,
    bestScore,
    status,
    reviewUnlocked,
    languagesUsed,
    completedAttempts,
    lastActivityAt,
  } = assessment

  const formattedDate = new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(lastActivityAt))

  const languageLabel =
    languagesUsed.length === 2
      ? "Español · English"
      : languagesUsed[0] === "es"
        ? "Español"
        : languagesUsed[0] === "en"
          ? "English"
          : "—"

  const scoreClass =
    bestScore === null
      ? "text-slate-400"
      : bestScore >= 90
        ? "text-emerald-400"
        : bestScore >= 70
          ? "text-yellow-400"
          : "text-red-400"

  return (
    <article
      className="
        overflow-hidden rounded-2xl
        border border-white/10
        bg-[#0B0F0F]/90
        transition-colors
        hover:border-white/20
      "
    >
      {/* HEADER */}
      <div className="p-4 sm:p-5 lg:p-6">
        <div
          className="
            flex flex-col gap-4
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-full
                  border border-emerald-500/20
                  bg-emerald-500/10
                  px-2.5 py-1
                  text-[11px] font-semibold
                  uppercase tracking-wide
                  text-emerald-400
                "
              >
                <CheckCircle2 className="h-3.5 w-3.5" />

                {status === "in_progress"
                  ? "In Progress"
                  : "Attempted"}
              </span>

              {reviewUnlocked ? (
                <span
                  className="
                    inline-flex items-center gap-1.5
                    rounded-full
                    border border-sky-500/20
                    bg-sky-500/10
                    px-2.5 py-1
                    text-[11px] font-semibold
                    uppercase tracking-wide
                    text-sky-400
                  "
                >
                  <Eye className="h-3.5 w-3.5" />
                  Review Available
                </span>
              ) : (
                <span
                  className="
                    inline-flex items-center gap-1.5
                    rounded-full
                    border border-white/10
                    bg-white/[0.03]
                    px-2.5 py-1
                    text-[11px] font-semibold
                    uppercase tracking-wide
                    text-slate-400
                  "
                >
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Review Locked
                </span>
              )}
            </div>

            <div>
              <h2 className="text-base font-semibold text-white sm:text-lg">
                {title}
              </h2>

              {description && (
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* BEST SCORE */}
          <div
            className="
              flex shrink-0 items-center gap-3
              rounded-xl
              border border-white/10
              bg-white/[0.025]
              px-4 py-3
              sm:min-w-[140px]
            "
          >
            <div
              className="
                flex h-9 w-9 items-center justify-center
                rounded-lg
                border border-yellow-500/20
                bg-yellow-500/10
              "
            >
              <Award className="h-4 w-4 text-yellow-400" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Best Score
              </p>

              <p className={`text-xl font-bold ${scoreClass}`}>
                {bestScore === null
                  ? "—"
                  : `${Math.round(bestScore)}%`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div
        className="
          grid grid-cols-2
          border-y border-white/10
          sm:grid-cols-4
        "
      >
        <Metric
          icon={<RotateCcw className="h-4 w-4" />}
          label="Attempts"
          value={`${attemptsUsed} / ${maxAttempts}`}
        />

        <Metric
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed"
          value={String(completedAttempts)}
        />

        <Metric
          icon={<History className="h-4 w-4" />}
          label="Remaining"
          value={String(attemptsRemaining)}
        />

        <Metric
          icon={<Languages className="h-4 w-4" />}
          label="Language"
          value={languageLabel}
        />
      </div>

      {/* FOOTER */}
      <div
        className="
          flex flex-col gap-4
          p-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:p-5
        "
      >
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock3 className="h-4 w-4 shrink-0" />

          <span>
            Last activity{" "}
            <span className="text-slate-400">
              {formattedDate}
            </span>
          </span>
        </div>

        <Link
          href={`/portal/quizzes/history/${assessmentId}`}
          className="
            inline-flex h-10 w-full
            items-center justify-center gap-2
            rounded-lg
            border border-emerald-500/30
            bg-emerald-500/10
            px-4
            text-sm font-semibold
            text-emerald-400
            transition-colors
            hover:border-emerald-400/50
            hover:bg-emerald-500/15
            sm:w-auto
          "
        >
          <History className="h-4 w-4" />
          View Attempt History
        </Link>
      </div>

      {!reviewUnlocked && (
        <div
          className="
            border-t border-yellow-500/10
            bg-yellow-500/[0.04]
            px-4 py-3
            text-xs leading-5
            text-yellow-200/70
            sm:px-5
          "
        >
          Detailed answer review unlocks after a perfect score
          or after all available attempts have been used.
        </div>
      )}
    </article>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div
      className="
        min-w-0
        border-white/10
        p-4
        odd:border-r
        max-sm:[&:nth-child(-n+2)]:border-b
        sm:border-r
        sm:last:border-r-0
      "
    >
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-[10px] uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="truncate text-sm font-semibold text-white sm:text-base">
        {value}
      </p>
    </div>
  )
}