"use client"

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  FileClock,
  History,
  Search,
  Trophy,
  Users,
} from "lucide-react"
import {
  useMemo,
  useState,
} from "react"

import type {
  AdminQuizMemberStatus,
  AdminQuizResultMember,
  AdminQuizResults,
} from "@/src/lib/queries/get-admin-quiz-results"
import QuizAttemptReviewDrawer from "./QuizAttemptReviewDrawer"
import QuizAttemptHistoryDrawer from "./QuizAttemptHistoryDrawer"

type ResultsFilter =
  | "all"
  | "completed"
  | "in_progress"
  | "not_started"
  | "perfect"
  | "needs_attention"

const filterLabels: Record<
  ResultsFilter,
  string
> = {
  all: "All",
  completed: "Completed",
  in_progress: "In Progress",
  not_started: "Not Started",
  perfect: "Perfect",
  needs_attention:
    "Needs Attention",
}

export default function AssessmentResultsDashboard({
  results,
}: {
  results: AdminQuizResults
}) {
  const [search, setSearch] =
    useState("")

  const [filter, setFilter] =
    useState<ResultsFilter>("all")

  const [
    selectedAttemptId,
    setSelectedAttemptId,
  ] = useState<string | null>(null)

  const [
    selectedHistoryMemberId,
    setSelectedHistoryMemberId,
  ] = useState<string | null>(null)

  const reviewDrawerOpen =
    selectedAttemptId !== null

  const historyDrawerOpen =
    selectedHistoryMemberId !== null

  function openAttemptReview(
    attemptId: string
  ) {
    setSelectedAttemptId(attemptId)
  }

  function closeAttemptReview() {
    setSelectedAttemptId(null)
  }

  function openAttemptHistory(
    memberId: string
  ) {
    setSelectedHistoryMemberId(memberId)
  }

  function closeAttemptHistory() {
    setSelectedHistoryMemberId(null)
  }

  function reviewAttemptFromHistory(
    attemptId: string
  ) {
    setSelectedHistoryMemberId(null)
    setSelectedAttemptId(attemptId)
  }

  const filteredMembers = useMemo(
    () => {
      const normalizedSearch =
        search.trim().toLowerCase()

      return results.members.filter(
        (member) => {
          const matchesSearch =
            !normalizedSearch ||
            member.fullName
              .toLowerCase()
              .includes(
                normalizedSearch
              )

          const matchesFilter =
            matchMemberFilter(
              member,
              filter
            )

          return (
            matchesSearch &&
            matchesFilter
          )
        }
      )
    },
    [
      results.members,
      search,
      filter,
    ]
  )

  const {
    assessment,
    summary,
  } = results

  return (
    <div className="space-y-6">
      {/* SUMMARY */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Eligible Members"
          value={
            summary.eligibleMembers
          }
          helper={`${summary.notStartedMembers} not started`}
          icon={
            <Users className="h-5 w-5 text-sky-300" />
          }
        />

        <MetricCard
          label="Completed"
          value={
            summary.completedMembers
          }
          helper={`${summary.completionRate}% completion`}
          icon={
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          }
        />

        <MetricCard
          label="In Progress"
          value={
            summary.inProgressMembers
          }
          helper={`${summary.inProgressAttempts} active attempts`}
          icon={
            <Clock3 className="h-5 w-5 text-amber-300" />
          }
        />

        <MetricCard
          label="Not Started"
          value={
            summary.notStartedMembers
          }
          helper="Eligible members"
          icon={
            <FileClock className="h-5 w-5 text-gray-400" />
          }
        />

        <MetricCard
          label="Average Score"
          value={
            summary.averageBestScore ===
            null
              ? "—"
              : `${summary.averageBestScore}%`
          }
          helper="Best member scores"
          icon={
            <BarChart3 className="h-5 w-5 text-emerald-300" />
          }
        />

        <MetricCard
          label="Highest Score"
          value={
            summary.highestScore === null
              ? "—"
              : `${summary.highestScore}%`
          }
          helper={
            summary.lowestScore === null
              ? "No completed results"
              : `Lowest ${summary.lowestScore}%`
          }
          icon={
            <Trophy className="h-5 w-5 text-yellow-300" />
          }
        />

        <MetricCard
          label="Perfect Members"
          value={
            summary.perfectMembers
          }
          helper="Best score of 100%"
          icon={
            <Trophy className="h-5 w-5 text-yellow-300" />
          }
        />

        <MetricCard
          label="Needs Attention"
          value={
            summary.needsAttentionMembers
          }
          helper="Low, expired, or exhausted"
          icon={
            <AlertTriangle className="h-5 w-5 text-red-300" />
          }
        />
      </section>

      {/* COMPLETION */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/90 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">
              Member Completion
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Progress across eligible members in{" "}
              {assessment.cycleName}.
            </p>
          </div>

          <p className="text-2xl font-bold text-white sm:text-3xl">
            {summary.completionRate}%
          </p>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
            style={{
              width: `${summary.completionRate}%`,
            }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ProgressItem
            label="Completed"
            value={
              summary.completedMembers
            }
          />

          <ProgressItem
            label="In Progress"
            value={
              summary.inProgressMembers
            }
          />

          <ProgressItem
            label="Not Started"
            value={
              summary.notStartedMembers
            }
          />

          <ProgressItem
            label="Attempts Used"
            value={
              summary.totalAttempts
            }
          />
        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0B0F0F]/90 p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search member..."
            className="
              w-full
              rounded-xl
              border
              border-white/10
              bg-black/30
              py-3
              pl-11
              pr-4
              text-sm
              text-white
              outline-none
              transition
              placeholder:text-gray-600
              focus:border-yellow-400/40
              focus:ring-2
              focus:ring-yellow-400/10
            "
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(
            Object.keys(
              filterLabels
            ) as ResultsFilter[]
          ).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setFilter(value)
              }
              className={`
                min-h-9
                shrink-0
                rounded-lg
                border
                px-3
                text-xs
                font-semibold
                transition
                ${
                  filter === value
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-white/10 bg-white/[0.025] text-gray-400 hover:bg-white/[0.06]"
                }
              `}
            >
              {filterLabels[value]}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-600">
          Showing{" "}
          {filteredMembers.length} of{" "}
          {results.members.length} members
        </p>
      </section>

      {/* DESKTOP TABLE */}
      <section className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-left">
                <TableHeader>
                  Member
                </TableHeader>

                <TableHeader>
                  Best Score
                </TableHeader>

                <TableHeader>
                  Attempts
                </TableHeader>

                <TableHeader>
                  Status
                </TableHeader>

                <TableHeader>
                  Language
                </TableHeader>

                <TableHeader>
                  Time
                </TableHeader>

                <TableHeader>
                  Last Activity
                </TableHeader>

                <TableHeader>
                  Development
                </TableHeader>

                <TableHeader align="right">
                  Actions
                </TableHeader>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filteredMembers.map(
                (member) => (
                  <MemberTableRow
                  key={member.memberId}
                  member={member}
                  onReview={openAttemptReview}
                  onHistory={openAttemptHistory}
                />
                )
              )}
            </tbody>
          </table>
        </div>

        {filteredMembers.length ===
          0 && <EmptyResults />}
      </section>

      {/* MOBILE CARDS */}
      <section className="space-y-3 lg:hidden">
        {filteredMembers.map(
          (member) => (
            <MemberResultCard
              key={member.memberId}
              member={member}
              onReview={openAttemptReview}
              onHistory={openAttemptHistory}

            />
          )
        )}

        {filteredMembers.length ===
          0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
            <EmptyResults />
          </div>
        )}
      </section>

      <QuizAttemptHistoryDrawer
        assessmentId={
          results.assessment.id
        }
        memberId={
          selectedHistoryMemberId
        }
        open={historyDrawerOpen}
        onClose={closeAttemptHistory}
        onReviewAttempt={
          reviewAttemptFromHistory
        }
      />

      <QuizAttemptReviewDrawer
        attemptId={selectedAttemptId}
        open={reviewDrawerOpen}
        onClose={closeAttemptReview}
      />

    </div>
  )
}

function MemberTableRow({
  member,
  onReview,
  onHistory
}: {
  member: AdminQuizResultMember
  onReview: (attemptId: string) => void
  onHistory: (memberId: string) => void
}) {
  return (
    <tr className="transition hover:bg-white/[0.025]">
      <TableCell>
        <div>
          <p className="font-medium text-white">
            {member.fullName}
          </p>

          {member.needsAttention && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              Needs attention
            </p>
          )}
        </div>
      </TableCell>

      <TableCell>
        <ScoreBadge
          score={member.bestScore}
        />
      </TableCell>

      <TableCell>
        <p className="font-medium text-gray-200">
          {member.attemptsUsed} /{" "}
          {member.maxAttempts}
        </p>

        <p className="mt-0.5 text-xs text-gray-600">
          {member.attemptsRemaining}{" "}
          remaining
        </p>
      </TableCell>

      <TableCell>
        <StatusBadge
          status={member.status}
        />
      </TableCell>

      <TableCell>
        <LanguageBadge
          language={member.language}
        />
      </TableCell>

      <TableCell>
        <span className="text-sm text-gray-300">
          {formatDuration(
            member.timeUsedSeconds
          )}
        </span>
      </TableCell>

      <TableCell>
        <span className="text-sm text-gray-400">
          {formatActivityDate(
            member.lastActivityAt
          )}
        </span>
      </TableCell>

      <TableCell>
        <span
          className={`
            rounded-full
            border
            px-2.5
            py-1
            text-xs
            font-medium
            ${
              member.countsForScore
                ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
                : "border-white/10 bg-white/[0.03] text-gray-500"
            }
          `}
        >
          {member.countsForScore
            ? "Counts"
            : "Excluded"}
        </span>
      </TableCell>

      <TableCell align="right">
        <ResultActions
          member={member}
          onReview={onReview}
          onHistory={onHistory}

        />
      </TableCell>
    </tr>
  )
}

function MemberResultCard({
  member,
  onReview,
  onHistory
}: {
  member: AdminQuizResultMember
  onReview: (attemptId: string) => void
  onHistory: (memberId: string) => void

}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">
            {member.fullName}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge
              status={member.status}
            />

            <LanguageBadge
              language={
                member.language
              }
            />

            {member.needsAttention && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                Attention
              </span>
            )}
          </div>
        </div>

        <ScoreBadge
          score={member.bestScore}
          large
        />
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        <MobileInfoItem
          label="Attempts"
          value={`${member.attemptsUsed} / ${member.maxAttempts}`}
        />

        <MobileInfoItem
          label="Remaining"
          value={String(
            member.attemptsRemaining
          )}
        />

        <MobileInfoItem
          label="Time"
          value={formatDuration(
            member.timeUsedSeconds
          )}
        />

        <MobileInfoItem
          label="Last Activity"
          value={formatActivityDate(
            member.lastActivityAt
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/10 bg-black/20 p-3">
        <ResultActions
          member={member}
          mobile
          onReview={onReview}
          onHistory={onHistory}

        />
      </div>
    </article>
  )
}

function ResultActions({
  member,
  mobile = false,
  onReview,
  onHistory,
}: {
  member: AdminQuizResultMember
  mobile?: boolean

  onReview: (
    attemptId: string
  ) => void

  onHistory: (
    memberId: string
  ) => void
}) {
  const reviewAvailable =
    Boolean(
      member.bestAttemptId &&
      member.reviewUnlocked
    )

  const historyAvailable =
    member.attemptsUsed > 0

  const baseClassName = `
    inline-flex
    min-h-9
    items-center
    justify-center
    gap-2
    rounded-lg
    border
    px-3
    text-xs
    font-medium
    transition
  `

  function handleReview() {
    if (
      !reviewAvailable ||
      !member.bestAttemptId
    ) {
      return
    }

    onReview(member.bestAttemptId)
  }

  function handleHistory() {
    if (!historyAvailable) {
      return
    }

    onHistory(member.memberId)
  }

  return (
    <>
      <button
        type="button"
        disabled={!reviewAvailable}
        onClick={handleReview}
        title={
          reviewAvailable
            ? "Review the member's best attempt."
            : member.bestAttemptId
              ? "Detailed review is still locked."
              : "No completed attempt is available."
        }
        className={`
          ${baseClassName}
          ${
            reviewAvailable
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
              : "cursor-not-allowed border-white/5 bg-white/[0.015] text-gray-700"
          }
          ${mobile ? "w-full" : ""}
        `}
      >
        <Eye className="h-3.5 w-3.5" />
        Review
      </button>

      <button
        type="button"
        disabled={!historyAvailable}
        onClick={handleHistory}
        title={
          historyAvailable
            ? "View every attempt used by this member."
            : "This member has no attempts."
        }
        className={`
          ${baseClassName}
          ${
            historyAvailable
              ? "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.07]"
              : "cursor-not-allowed border-white/5 bg-white/[0.015] text-gray-700"
          }
          ${
            mobile
              ? "w-full"
              : "ml-2"
          }
        `}
      >
        <History className="h-3.5 w-3.5" />
        History
      </button>
    </>
  )
}

function StatusBadge({
  status,
}: {
  status: AdminQuizMemberStatus
}) {
  const styles = {
    completed:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",

    in_progress:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",

    not_started:
      "border-white/10 bg-white/[0.03] text-gray-500",
  }

  const labels = {
    completed: "Completed",
    in_progress: "In Progress",
    not_started: "Not Started",
  }

  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-medium
        ${styles[status]}
      `}
    >
      {labels[status]}
    </span>
  )
}

function LanguageBadge({
  language,
}: {
  language: "es" | "en" | null
}) {
  if (!language) {
    return (
      <span className="text-sm text-gray-700">
        —
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold uppercase text-sky-300">
      {language}
    </span>
  )
}

function ScoreBadge({
  score,
  large = false,
}: {
  score: number | null
  large?: boolean
}) {
  if (score === null) {
    return (
      <span
        className={
          large
            ? "text-2xl font-bold text-gray-700"
            : "text-sm text-gray-700"
        }
      >
        —
      </span>
    )
  }

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-lg
        border
        font-bold
        ${getScoreStyle(score)}
        ${
          large
            ? "min-w-18 px-3 py-2 text-xl"
            : "min-w-14 px-2.5 py-1.5 text-sm"
        }
      `}
    >
      {formatScore(score)}%
    </span>
  )
}

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: number | string
  helper: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/90 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          {icon}
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {helper}
      </p>
    </div>
  )
}

function ProgressItem({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function MobileInfoItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p
        className="mt-1 truncate text-sm font-medium text-white"
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <th
      className={`
        px-4
        py-3.5
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-gray-500
        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  )
}

function TableCell({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <td
      className={`
        px-4
        py-4
        align-middle
        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </td>
  )
}

function EmptyResults() {
  return (
    <div className="px-5 py-12 text-center">
      <Users className="mx-auto h-8 w-8 text-gray-700" />

      <p className="mt-3 font-medium text-white">
        No members found
      </p>

      <p className="mt-1 text-sm text-gray-600">
        Change the search or selected filter.
      </p>
    </div>
  )
}

function matchMemberFilter(
  member: AdminQuizResultMember,
  filter: ResultsFilter
) {
  switch (filter) {
    case "completed":
      return (
        member.status === "completed"
      )

    case "in_progress":
      return (
        member.status ===
        "in_progress"
      )

    case "not_started":
      return (
        member.status ===
        "not_started"
      )

    case "perfect":
      return member.bestScore === 100

    case "needs_attention":
      return member.needsAttention

    case "all":
    default:
      return true
  }
}

function getScoreStyle(score: number) {
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

function formatActivityDate(
  value: string | null
) {
  if (!value) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        "America/Los_Angeles",
      month: "short",
      day: "numeric",
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