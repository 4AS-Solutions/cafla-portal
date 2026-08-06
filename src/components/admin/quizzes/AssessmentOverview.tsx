import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Languages,
  LockKeyhole,
  RotateCcw,
  Shuffle,
  Trophy,
  Users,
} from "lucide-react"

import type {
  AdminQuizOverview,
} from "@/src/lib/queries/get-admin-quiz-overview"

const statusStyles = {
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

const statusLabels = {
  draft: "Draft",
  upcoming: "Upcoming",
  available: "Available",
  closed: "Closed",
  archived: "Archived",
}

export default function AssessmentOverview({
  overview,
}: {
  overview: AdminQuizOverview
}) {
  const {
    assessment,
    participation,
    attempts,
    questionBank,
    versions,
  } = overview

  return (
    <div className="space-y-6">
      {/* STATUS */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
        <div className="flex flex-col gap-4 border-b border-white/10 bg-gradient-to-r from-emerald-950/40 to-[#0B0F0F] px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`
                  rounded-full
                  border
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  ${statusStyles[
                    assessment.displayStatus
                  ]}
                `}
              >
                {
                  statusLabels[
                    assessment.displayStatus
                  ]
                }
              </span>

              {assessment.required && (
                <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300">
                  Required
                </span>
              )}

              {assessment.countsForScore && (
                <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-300">
                  Development
                </span>
              )}

              {assessment.contentLocked && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Content Locked
                </span>
              )}
            </div>

            {assessment.description && (
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-400">
                {assessment.description}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Development Cycle
            </p>

            <p className="mt-1 font-semibold text-white">
              {assessment.cycleName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
          <HeaderMetric
            label="Question Bank"
            value={String(
              questionBank.completeGroups
            )}
            helper={`${assessment.questionsPerAttempt} per attempt`}
          />

          <HeaderMetric
            label="Attempts"
            value={String(
              assessment.maxAttempts
            )}
            helper={`${assessment.timeLimitMinutes} min`}
          />

          <HeaderMetric
            label="Languages"
            value={String(
              versions.length
            )}
            helper={versions
              .map((version) =>
                version.language === "es"
                  ? "Español"
                  : "English"
              )
              .join(" · ")}
          />

          <HeaderMetric
            label="Average Score"
            value={
              attempts.averageScore === null
                ? "—"
                : `${attempts.averageScore}%`
            }
            helper={`${attempts.completed} completed`}
          />
        </div>
      </section>

      {/* PARTICIPATION */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Eligible Members"
          value={
            participation.eligibleMembers
          }
          helper={`${participation.membersNotStarted} not started`}
          icon={
            <Users className="h-5 w-5 text-sky-300" />
          }
        />

        <MetricCard
          label="Started"
          value={
            participation.membersStarted
          }
          helper={`${participation.membersInProgress} in progress`}
          icon={
            <BookOpenCheck className="h-5 w-5 text-yellow-300" />
          }
        />

        <MetricCard
          label="Completed"
          value={
            participation.membersCompleted
          }
          helper={`${participation.completionRate}% completion`}
          icon={
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          }
        />

        <MetricCard
          label="Perfect Attempts"
          value={
            attempts.perfectAttempts
          }
          helper={
            attempts.highestScore === null
              ? "No completed attempts"
              : `Highest ${attempts.highestScore}%`
          }
          icon={
            <Trophy className="h-5 w-5 text-yellow-300" />
          }
        />
      </section>

      {/* PROGRESS */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/90 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">
              Member Completion
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Progress among eligible cycle members.
            </p>
          </div>

          <p className="text-2xl font-bold text-white">
            {participation.completionRate}%
          </p>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width]"
            style={{
              width: `${participation.completionRate}%`,
            }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ProgressItem
            label="Completed"
            value={
              participation.membersCompleted
            }
          />

          <ProgressItem
            label="In Progress"
            value={
              participation.membersInProgress
            }
          />

          <ProgressItem
            label="Not Started"
            value={
              participation.membersNotStarted
            }
          />

          <ProgressItem
            label="Total Attempts"
            value={attempts.total}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* CONFIGURATION */}
        <OverviewSection
          title="Assessment Configuration"
          description="Rules used for every member attempt."
          icon={
            <BookOpenCheck className="h-5 w-5 text-yellow-300" />
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <InfoItem
              label="Category"
              value={formatCategory(
                assessment.category
              )}
            />

            <InfoItem
              label="Required"
              value={
                assessment.required
                  ? "Yes"
                  : "No"
              }
            />

            <InfoItem
              label="Max Attempts"
              value={String(
                assessment.maxAttempts
              )}
              icon={
                <RotateCcw className="h-4 w-4" />
              }
            />

            <InfoItem
              label="Time Limit"
              value={`${assessment.timeLimitMinutes} min`}
              icon={
                <Clock3 className="h-4 w-4" />
              }
            />

            <InfoItem
              label="Questions"
              value={String(
                assessment.questionsPerAttempt
              )}
              icon={
                <FileQuestion className="h-4 w-4" />
              }
            />

            <InfoItem
              label="Development"
              value={
                assessment.countsForScore
                  ? "Included"
                  : "Not Included"
              }
            />

            <InfoItem
              label="Question Order"
              value={
                assessment.randomizeQuestions
                  ? "Randomized"
                  : "Fixed"
              }
              icon={
                <Shuffle className="h-4 w-4" />
              }
            />

            <InfoItem
              label="Option Order"
              value={
                assessment.randomizeOptions
                  ? "Randomized"
                  : "Fixed"
              }
              icon={
                <Shuffle className="h-4 w-4" />
              }
            />
          </div>
        </OverviewSection>

        {/* AVAILABILITY */}
        <OverviewSection
          title="Availability"
          description="Published scheduling and lifecycle."
          icon={
            <CalendarDays className="h-5 w-5 text-amber-300" />
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoItem
              label="Opens"
              value={
                assessment.openFrom
                  ? formatDate(
                      assessment.openFrom
                    )
                  : "Not configured"
              }
              icon={
                <CalendarDays className="h-4 w-4" />
              }
            />

            <InfoItem
              label="Closes"
              value={
                assessment.openUntil
                  ? formatDate(
                      assessment.openUntil
                    )
                  : "Not configured"
              }
              icon={
                <Clock3 className="h-4 w-4" />
              }
            />

            <InfoItem
              label="Published"
              value={
                assessment.publishedAt
                  ? formatDate(
                      assessment.publishedAt
                    )
                  : "Not published"
              }
            />

            <InfoItem
              label="Content"
              value={
                assessment.contentLocked
                  ? "Locked"
                  : "Editable"
              }
              icon={
                assessment.contentLocked ? (
                  <LockKeyhole className="h-4 w-4" />
                ) : undefined
              }
            />
          </div>

          {!assessment.contentLocked &&
            assessment.status ===
              "published" && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />

                <p className="text-sm leading-relaxed text-amber-100/80">
                  The assessment is published, but academic content remains editable until the first attempt begins.
                </p>
              </div>
            )}
        </OverviewSection>

        {/* LANGUAGES */}
        <OverviewSection
          title="Language Versions"
          description="Member-facing assessment versions."
          icon={
            <Languages className="h-5 w-5 text-sky-300" />
          }
        >
          <div className="space-y-3">
            {versions.map(
              (version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-xs font-bold text-sky-300">
                      {version.language.toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {version.title}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {version.language === "es"
                          ? "Español"
                          : "English"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-white">
                      {version.questionCount}
                    </p>

                    <p className="text-xs text-gray-500">
                      questions
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </OverviewSection>

        {/* ATTEMPT PERFORMANCE */}
        <OverviewSection
          title="Attempt Performance"
          description="Current activity and scoring."
          icon={
            <BarChart3 className="h-5 w-5 text-emerald-300" />
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <InfoItem
              label="Total Attempts"
              value={String(
                attempts.total
              )}
            />

            <InfoItem
              label="Completed"
              value={String(
                attempts.completed
              )}
            />

            <InfoItem
              label="In Progress"
              value={String(
                attempts.inProgress
              )}
            />

            <InfoItem
              label="Expired"
              value={String(
                attempts.expired
              )}
            />

            <InfoItem
              label="Average"
              value={
                attempts.averageScore ===
                null
                  ? "—"
                  : `${attempts.averageScore}%`
              }
            />

            <InfoItem
              label="Highest"
              value={
                attempts.highestScore ===
                null
                  ? "—"
                  : `${attempts.highestScore}%`
              }
            />
          </div>
        </OverviewSection>
      </div>
    </div>
  )
}

function HeaderMetric({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="bg-[#0B0F0F] px-4 py-4 sm:px-5">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 truncate text-xs text-gray-500">
        {helper || "—"}
      </p>
    </div>
  )
}

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: number
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

function OverviewSection({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
      <div className="flex items-start gap-3 border-b border-white/10 px-4 py-5 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {children}
      </div>
    </section>
  )
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
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

function formatCategory(
  value:
    AdminQuizOverview["assessment"]["category"]
) {
  const labels = {
    laws_of_the_game:
      "Laws of the Game",
    competition_rules:
      "Competition Rules",
    class_review:
      "Class Review",
    other: "Other",
  }

  return labels[value]
}

function formatDate(value: string) {
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