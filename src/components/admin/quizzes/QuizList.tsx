"use client"

import Link from "next/link"
import {
  Archive,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileQuestion,
  Languages,
  LockKeyhole,
  Pencil,
  PlayCircle,
  Users,
} from "lucide-react"

import type {
  AdminQuizAssessment,
  AdminQuizAssessmentStatus,
} from "@/src/lib/queries/get-quizzes-admin"

type AdminQuizListProps = {
  quizzes: AdminQuizAssessment[]
}

const statusStyles: Record<
  AdminQuizAssessmentStatus,
  string
> = {
  draft:
    "border-gray-500/20 bg-gray-500/10 text-gray-300",

  upcoming:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",

  available:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",

  closed:
    "border-red-500/20 bg-red-500/10 text-red-300",

  archived:
    "border-slate-500/20 bg-slate-500/10 text-slate-300",
}

const statusLabels: Record<
  AdminQuizAssessmentStatus,
  string
> = {
  draft: "Draft",
  upcoming: "Upcoming",
  available: "Available",
  closed: "Closed",
  archived: "Archived",
}

export default function QuizList({
  quizzes,
}: AdminQuizListProps) {
  if (!quizzes.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/90 px-5 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-400/15 bg-yellow-400/10">
          <BookOpenCheck className="h-5 w-5 text-yellow-300" />
        </div>

        <p className="mt-4 font-semibold text-white">
          No assessments yet
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Create the first assessment for the active development cycle.
        </p>

        <Link
          href="/admin/quizzes/new"
          className="
            mt-5
            inline-flex
            min-h-11
            items-center
            justify-center
            rounded-xl
            bg-emerald-500
            px-5
            text-sm
            font-semibold
            text-black
            transition
            hover:bg-emerald-400
          "
        >
          Create Assessment
        </Link>
      </div>
    )
  }

  const active = quizzes.filter(
    (quiz) =>
      quiz.displayStatus === "draft" ||
      quiz.displayStatus === "upcoming" ||
      quiz.displayStatus === "available"
  )

  const previous = quizzes.filter(
    (quiz) =>
      quiz.displayStatus === "closed" ||
      quiz.displayStatus === "archived"
  )

  return (
    <div className="space-y-10">
      {active.length > 0 && (
        <AssessmentSection
          title="Current Assessments"
          subtitle="Draft, upcoming, and currently available evaluations."
          quizzes={active}
        />
      )}

      {previous.length > 0 && (
        <AssessmentSection
          title="Previous Assessments"
          subtitle="Closed and archived assessments from the active cycle."
          quizzes={previous}
        />
      )}
    </div>
  )
}

function AssessmentSection({
  title,
  subtitle,
  quizzes,
}: {
  title: string
  subtitle: string
  quizzes: AdminQuizAssessment[]
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        <p className="text-sm text-gray-500">
          {subtitle}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {quizzes.map((quiz) => (
          <AdminQuizCard
            key={quiz.id}
            quiz={quiz}
          />
        ))}
      </div>
    </section>
  )
}

function AdminQuizCard({
  quiz,
}: {
  quiz: AdminQuizAssessment
}) {
  const completionRate =
    quiz.eligibleMembers === 0
      ? 0
      : Math.round(
          (quiz.membersCompleted /
            quiz.eligibleMembers) *
            100
        )

  const canEdit =
    quiz.databaseStatus === "draft" ||
    !quiz.contentLocked

  const canManage =
    quiz.databaseStatus !== "archived"

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
        bg-[#0B0F0F]/95
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
                  ${statusStyles[quiz.displayStatus]}
                `}
              >
                {statusLabels[quiz.displayStatus]}
              </span>

              {quiz.required && (
                <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-300">
                  Required
                </span>
              )}

              {quiz.countsForScore && (
                <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                  Development
                </span>
              )}

              {quiz.contentLocked && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  <LockKeyhole className="h-3 w-3" />
                  Locked
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoItem
            icon={<FileQuestion className="h-4 w-4" />}
            label="Question bank"
            value={String(
              quiz.validQuestionGroupsCount
            )}
          />

          <InfoItem
            icon={<BookOpenCheck className="h-4 w-4" />}
            label="Per attempt"
            value={String(
              quiz.questionsPerAttempt
            )}
          />

          <InfoItem
            icon={<Clock3 className="h-4 w-4" />}
            label="Time"
            value={`${quiz.timeLimitMinutes} min`}
          />

          <InfoItem
            icon={<PlayCircle className="h-4 w-4" />}
            label="Attempts"
            value={String(quiz.maxAttempts)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoItem
            icon={<Languages className="h-4 w-4" />}
            label="Languages"
            value={
              quiz.languages.length
                ? quiz.languages
                    .map(getLanguageLabel)
                    .join(" · ")
                : "None"
            }
          />

          <InfoItem
            icon={<Users className="h-4 w-4" />}
            label="Eligible"
            value={String(
              quiz.eligibleMembers
            )}
          />
        </div>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ProgressMetric
              label="Started"
              value={quiz.membersStarted}
            />

            <ProgressMetric
              label="Completed"
              value={quiz.membersCompleted}
            />

            <ProgressMetric
              label="In progress"
              value={quiz.membersInProgress}
            />

            <ProgressMetric
              label="Not started"
              value={quiz.membersNotStarted}
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-gray-500">
                Completion
              </span>

              <span className="font-semibold text-gray-200">
                {completionRate}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width]"
                style={{
                  width: `${completionRate}%`,
                }}
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <ScoreMetric
            label="Average score"
            value={
              quiz.averageScore === null
                ? "—"
                : `${quiz.averageScore}%`
            }
            icon={
              <BarChart3 className="h-4 w-4 text-emerald-300" />
            }
          />

          <ScoreMetric
            label="Perfect attempts"
            value={String(
              quiz.perfectScores
            )}
            icon={
              <CheckCircle2 className="h-4 w-4 text-yellow-300" />
            }
          />
        </div>

        <div className="space-y-2 text-xs text-gray-500">
          {quiz.openFrom && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>
                Opens{" "}
                {formatAdminQuizDate(
                  quiz.openFrom
                )}
              </span>
            </div>
          )}

          {quiz.openUntil && (
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 shrink-0" />
              <span>
                Closes{" "}
                {formatAdminQuizDate(
                  quiz.openUntil
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-2 border-t border-white/10 bg-black/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={`/admin/quizzes/${quiz.id}`}
          className="
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-white/[0.03]
            px-3
            text-sm
            font-medium
            text-gray-200
            transition
            hover:bg-white/[0.07]
          "
        >
          <Eye className="h-4 w-4" />
          Overview
        </Link>

        {canEdit ? (
          <Link
            href={`/admin/quizzes/${quiz.id}/edit`}
            className="
              inline-flex
              min-h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/[0.03]
              px-3
              text-sm
              font-medium
              text-gray-200
              transition
              hover:bg-white/[0.07]
            "
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        ) : (
          <div
            className="
              inline-flex
              min-h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/5
              bg-white/[0.015]
              px-3
              text-sm
              text-gray-600
            "
          >
            <LockKeyhole className="h-4 w-4" />
            Locked
          </div>
        )}

        <Link
          href={`/admin/quizzes/${quiz.id}/results`}
          className="
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-emerald-500/20
            bg-emerald-500/10
            px-3
            text-sm
            font-medium
            text-emerald-300
            transition
            hover:bg-emerald-500/15
          "
        >
          <BarChart3 className="h-4 w-4" />
          Results
        </Link>

        {canManage ? (
          <Link
            href={`/admin/quizzes/${quiz.id}/manage`}
            className="
              inline-flex
              min-h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-yellow-400
              px-3
              text-sm
              font-semibold
              text-black
              transition
              hover:bg-yellow-300
            "
          >
            <BookOpenCheck className="h-4 w-4" />
            Manage
          </Link>
        ) : (
          <div
            className="
              inline-flex
              min-h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/5
              bg-white/[0.015]
              px-3
              text-sm
              text-gray-600
            "
          >
            <Archive className="h-4 w-4" />
            Archived
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
        {value}
      </p>
    </div>
  )
}

function ProgressMetric({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function ScoreMetric({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {label}
        </p>

        {icon}
      </div>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function getLanguageLabel(
  language: "es" | "en"
) {
  return language === "es"
    ? "Español"
    : "English"
}

function formatAdminQuizDate(
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