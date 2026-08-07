import { notFound } from "next/navigation"
import Link from "next/link"

import {
  ArrowLeft,
  BookOpenCheck,
  CalendarClock,
  Clock3,
  Languages,
  LockKeyhole,
  RotateCcw,
  Settings2,
  ShieldCheck,
} from "lucide-react"

import { getAdminQuizEditor } from "@/src/lib/queries/get-admin-quiz-editor"
import AssessmentAvailabilityEditor from "@/src/components/admin/quizzes/AssessmentAvailabilityEditor"
import { AssessmentLifecycleControls } from "@/src/components/admin/quizzes/AssessmentLifecycleControls"

type PageProps = {
  params: Promise<{
    assessment_id: string
  }>
}

function formatDateTime(value: string | null) {
  if (!value) return "Not configured"

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  }).format(new Date(value))
}

export default async function ManageAssessmentPage({
  params,
}: PageProps) {
  const { assessment_id } = await params

  const data = await getAdminQuizEditor(assessment_id)

  if (!data) {
    notFound()
  }

  const { assessment, versions } = data

  const statusLabel =
    assessment.status.charAt(0).toUpperCase() +
    assessment.status.slice(1)

  return (
    <div className="space-y-6 pb-12">

      {/* BACK */}
      <Link
        href={`/admin/quizzes/${assessment.id}`}
        className="
          inline-flex items-center gap-2
          text-sm text-gray-400
          transition
          hover:text-white
        "
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessment
      </Link>

      {/* HEADER */}
      <div
        className="
          flex flex-col gap-4
          lg:flex-row lg:items-end lg:justify-between
        "
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">
            Assessment Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Manage Assessment
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Control availability, content access, and assessment lifecycle.
          </p>
        </div>

        <div
          className="
            inline-flex w-fit items-center gap-2
            rounded-full border border-white/10
            bg-white/[0.04]
            px-3 py-1.5
            text-xs font-semibold uppercase tracking-wide
            text-gray-200
          "
        >
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          {statusLabel}
        </div>
      </div>

      {/* ASSESSMENT IDENTITY */}
      <section
        className="
          rounded-2xl border border-white/10
          bg-[#0B0F0F]/80
          p-6
        "
      >
        <div className="flex items-start gap-4">
          <div
            className="
              flex h-11 w-11 shrink-0 items-center justify-center
              rounded-xl border border-yellow-400/20
              bg-yellow-400/10
            "
          >
            <Settings2 className="h-5 w-5 text-yellow-400" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              {assessment.title}
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {assessment.cycleName}
            </p>

            {assessment.description && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300">
                {assessment.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* AVAILABILITY */}
      <AssessmentAvailabilityEditor
        assessmentId={
          assessment.id
        }
        openFrom={
          assessment.openFrom
        }
        openUntil={
          assessment.openUntil
        }
        status={
          assessment.status
        }
      />

      {/* CONTENT + RULES */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* ACADEMIC CONTENT */}
        <section
          className="
            overflow-hidden rounded-2xl
            border border-white/10
            bg-[#0B0F0F]/80
          "
        >
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              {assessment.contentLocked ? (
                <LockKeyhole className="h-5 w-5 text-yellow-400" />
              ) : (
                <BookOpenCheck className="h-5 w-5 text-emerald-400" />
              )}

              <div>
                <h2 className="font-semibold text-white">
                  Academic Content
                </h2>

                <p className="text-sm text-gray-400">
                  Questions and member-facing language content.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6">

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 p-4">
                <p className="text-xs text-gray-500">
                  Question Groups
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {data.questionGroupsCount}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 p-4">
                <p className="text-xs text-gray-500">
                  Languages
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {versions.length}
                </p>
              </div>
            </div>

            {assessment.contentLocked ? (
              <div
                className="
                  rounded-xl border border-yellow-400/20
                  bg-yellow-400/[0.07]
                  p-4
                "
              >
                <div className="flex gap-3">
                  <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />

                  <div>
                    <p className="text-sm font-semibold text-yellow-200">
                      Academic content locked
                    </p>

                    <p className="mt-1 text-sm leading-5 text-yellow-100/60">
                      A member has started this assessment.
                      Questions and academic content can no longer
                      be modified.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="
                  rounded-xl border border-emerald-500/20
                  bg-emerald-500/[0.06]
                  p-4
                "
              >
                <p className="text-sm font-semibold text-emerald-300">
                  Content is editable
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  No member attempt has locked the academic content yet.
                </p>
              </div>
            )}

            <Link
              href={`/admin/quizzes/${assessment.id}/questions`}
              className={`
                inline-flex min-h-10 w-full items-center justify-center gap-2
                rounded-xl border px-4 text-sm font-semibold transition
                ${
                  assessment.contentLocked
                    ? "pointer-events-none border-white/5 bg-white/[0.02] text-gray-600"
                    : "border-white/10 bg-white/[0.04] text-white hover:border-yellow-400/30"
                }
              `}
            >
              <BookOpenCheck className="h-4 w-4" />
              Manage Questions
            </Link>
          </div>
        </section>

        {/* RULES */}
        <section
          className="
            overflow-hidden rounded-2xl
            border border-white/10
            bg-[#0B0F0F]/80
          "
        >
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-sky-400" />

              <div>
                <h2 className="font-semibold text-white">
                  Assessment Rules
                </h2>

                <p className="text-sm text-gray-400">
                  Rules currently applied to member attempts.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-6 sm:grid-cols-2">
            <Rule
              label="Maximum Attempts"
              value={String(assessment.maxAttempts)}
            />

            <Rule
              label="Time Limit"
              value={`${assessment.timeLimitMinutes} min`}
            />

            <Rule
              label="Questions / Attempt"
              value={String(assessment.questionsPerAttempt)}
            />

            <Rule
              label="Required"
              value={assessment.required ? "Yes" : "No"}
            />

            <Rule
              label="Question Order"
              value={
                assessment.randomizeQuestions
                  ? "Randomized"
                  : "Fixed"
              }
            />

            <Rule
              label="Option Order"
              value={
                assessment.randomizeOptions
                  ? "Randomized"
                  : "Fixed"
              }
            />
          </div>
        </section>
      </div>

      {/* LANGUAGE VERSIONS */}
      <section
        className="
          overflow-hidden rounded-2xl
          border border-white/10
          bg-[#0B0F0F]/80
        "
      >
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <Languages className="h-5 w-5 text-sky-400" />

            <div>
              <h2 className="font-semibold text-white">
                Language Versions
              </h2>

              <p className="text-sm text-gray-400">
                Member-facing versions configured for this assessment.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-6 md:grid-cols-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className="
                rounded-xl border border-white/10
                bg-white/[0.025]
                p-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-lg border border-sky-400/20
                    bg-sky-400/10
                    text-xs font-bold text-sky-300
                  "
                >
                  {version.language.toUpperCase()}
                </div>

                <div>
                  <p className="font-semibold text-white">
                    {version.title}
                  </p>

                  <p className="text-xs text-gray-500">
                    {version.language === "es"
                      ? "Español"
                      : "English"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIFECYCLE PREVIEW */}
      <section
        className="
          overflow-hidden rounded-2xl
          border border-white/10
          bg-[#0B0F0F]/80
        "
      >
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-yellow-400" />

            <div>
              <h2 className="font-semibold text-white">
                Assessment Lifecycle
              </h2>

              <p className="text-sm text-gray-400">
                Administrative controls for this assessment.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AssessmentLifecycleControls
            assessmentId={assessment.id}
            status={assessment.status}
          />
        </div>
      </section>

    </div>
  )
}

function Rule({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>
    </div>
  )
}