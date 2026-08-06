"use client"

import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Languages,
  Loader2,
  LockKeyhole,
  RotateCcw,
  Send,
  Shuffle,
  Trophy,
  Users,
  XCircle,
} from "lucide-react"
import {
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"

import type {
  QuizEditorData,
} from "@/src/lib/queries/get-admin-quiz-editor"

import type {
  AdminQuizQuestionBank,
} from "@/src/lib/queries/get-admin-quiz-question-bank"

type PublishAssessmentReviewProps = {
  assessment:
    QuizEditorData["assessment"]

  versions:
    QuizEditorData["versions"]

  bank: AdminQuizQuestionBank
}

type ValidationItem = {
  label: string
  valid: boolean
  message: string
}

export default function PublishAssessmentReview({
  assessment,
  versions,
  bank,
}: PublishAssessmentReviewProps) {
  const router = useRouter()

  const [dialogOpen, setDialogOpen] =
    useState(false)

  const [publishing, setPublishing] =
    useState(false)

  const validations =
    useMemo<ValidationItem[]>(
      () => [
        {
          label:
            "Assessment title",
          valid: Boolean(
            assessment.title.trim()
          ),
          message:
            "Assessment title is configured.",
        },

        {
          label:
            "Availability window",
          valid: Boolean(
            assessment.openFrom &&
              assessment.openUntil &&
              new Date(
                assessment.openFrom
              ).getTime() <
                new Date(
                  assessment.openUntil
                ).getTime()
          ),
          message:
            "Opening and closing dates are valid.",
        },

        {
          label:
            "Language versions",
          valid:
            versions.length > 0,
          message:
            `${versions.length} language version${
              versions.length === 1
                ? ""
                : "s"
            } configured.`,
        },

        {
          label:
            "Question translations",
          valid:
            bank.summary.incomplete ===
            0,
          message:
            bank.summary.incomplete ===
            0
              ? "Every valid question is complete in all languages."
              : `${bank.summary.incomplete} question group(s) are incomplete.`,
        },

        {
          label:
            "Question bank size",
          valid:
            bank.summary.complete >=
            bank.summary
              .requiredPerAttempt,
          message: `${bank.summary.complete} complete questions available; ${bank.summary.requiredPerAttempt} required per attempt.`,
        },

        {
          label:
            "Maximum attempts",
          valid:
            assessment.maxAttempts >=
            1,
          message: `${assessment.maxAttempts} attempt${
            assessment.maxAttempts ===
            1
              ? ""
              : "s"
          } allowed.`,
        },

        {
          label:
            "Time limit",
          valid:
            assessment.timeLimitMinutes >=
            1,
          message: `${assessment.timeLimitMinutes} minute time limit.`,
        },

        {
          label:
            "Development rules",
          valid:
            !assessment.countsForScore ||
            assessment.required,
          message:
            assessment.countsForScore
              ? "Required and counted toward Development."
              : "Does not affect Development scoring.",
        },
      ],
      [
        assessment,
        bank,
        versions.length,
      ]
    )

  const readyToPublish =
    assessment.status === "draft" &&
    !assessment.contentLocked &&
    validations.every(
      (validation) =>
        validation.valid
    )

  const missingCount =
    validations.filter(
      (validation) =>
        !validation.valid
    ).length

  async function publishAssessment() {
    if (
      !readyToPublish ||
      publishing
    ) {
      return
    }

    setPublishing(true)

    try {
      const response = await fetch(
        `/api/admin/quizzes/${assessment.id}/publish`,
        {
          method: "POST",
        }
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to publish the assessment."
        )
      }

      toast.success(
        "Assessment published successfully."
      )

      setDialogOpen(false)

      router.push(
        `/admin/quizzes/${assessment.id}`
      )

      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to publish the assessment."
      )
    } finally {
      setPublishing(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <WorkflowHeader />

        <ReadyBanner
          ready={readyToPublish}
          missingCount={missingCount}
          status={assessment.status}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <ReviewSection
            title="Assessment Summary"
            description="Core assessment configuration."
            icon={
              <BookOpenCheck className="h-5 w-5 text-yellow-300" />
            }
          >
            <ReviewGrid>
              <ReviewItem
                label="Title"
                value={assessment.title}
              />

              <ReviewItem
                label="Cycle"
                value={
                  assessment.cycleName
                }
              />

              <ReviewItem
                label="Category"
                value={formatCategory(
                  assessment.category
                )}
              />

              <ReviewItem
                label="Required"
                value={
                  assessment.required
                    ? "Yes"
                    : "No"
                }
                positive={
                  assessment.required
                }
              />

              <ReviewItem
                label="Development score"
                value={
                  assessment.countsForScore
                    ? "Included"
                    : "Not included"
                }
                positive={
                  assessment.countsForScore
                }
              />

              <ReviewItem
                label="Status"
                value={formatStatus(
                  assessment.status
                )}
              />
            </ReviewGrid>

            {assessment.description && (
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Description
                </p>

                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                  {
                    assessment.description
                  }
                </p>
              </div>
            )}
          </ReviewSection>

          <ReviewSection
            title="Availability"
            description="Attempt limits and scheduling."
            icon={
              <CalendarDays className="h-5 w-5 text-amber-300" />
            }
          >
            <ReviewGrid>
              <ReviewItem
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

              <ReviewItem
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

              <ReviewItem
                label="Attempts"
                value={String(
                  assessment.maxAttempts
                )}
                icon={
                  <RotateCcw className="h-4 w-4" />
                }
              />

              <ReviewItem
                label="Time limit"
                value={`${assessment.timeLimitMinutes} min`}
                icon={
                  <Clock3 className="h-4 w-4" />
                }
              />
            </ReviewGrid>
          </ReviewSection>

          <ReviewSection
            title="Languages"
            description="Versions available to members."
            icon={
              <Languages className="h-5 w-5 text-sky-300" />
            }
          >
            <div className="space-y-3">
              {versions.map(
                (version) => {
                  const completeQuestions =
                    bank.groups.filter(
                      (group) =>
                        !group.isInvalidated &&
                        group.completeLanguages.includes(
                          version.language
                        )
                    ).length

                  return (
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
                            {
                              version.title
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {getLanguageName(
                              version.language
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-white">
                          {
                            completeQuestions
                          }
                        </p>

                        <p className="text-xs text-gray-500">
                          questions
                        </p>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </ReviewSection>

          <ReviewSection
            title="Question Bank"
            description="Question selection and randomization."
            icon={
              <FileQuestion className="h-5 w-5 text-emerald-300" />
            }
          >
            <ReviewGrid>
              <ReviewItem
                label="Question groups"
                value={String(
                  bank.summary.total
                )}
              />

              <ReviewItem
                label="Complete"
                value={String(
                  bank.summary.complete
                )}
                positive={
                  bank.summary.complete >=
                  bank.summary
                    .requiredPerAttempt
                }
              />

              <ReviewItem
                label="Per attempt"
                value={String(
                  bank.summary
                    .requiredPerAttempt
                )}
              />

              <ReviewItem
                label="Invalidated"
                value={String(
                  bank.summary
                    .invalidated
                )}
              />

              <ReviewItem
                label="Random questions"
                value={
                  assessment.randomizeQuestions
                    ? "Enabled"
                    : "Disabled"
                }
                icon={
                  <Shuffle className="h-4 w-4" />
                }
              />

              <ReviewItem
                label="Random options"
                value={
                  assessment.randomizeOptions
                    ? "Enabled"
                    : "Disabled"
                }
                icon={
                  <Shuffle className="h-4 w-4" />
                }
              />
            </ReviewGrid>
          </ReviewSection>
        </div>

        <ReviewSection
          title="Validation Checklist"
          description="Every required validation must pass before publishing."
          icon={
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          }
        >
          <div className="grid gap-3 md:grid-cols-2">
            {validations.map(
              (validation) => (
                <ValidationRow
                  key={
                    validation.label
                  }
                  validation={
                    validation
                  }
                />
              )
            )}
          </div>
        </ReviewSection>

        <footer className="sticky bottom-3 z-10 flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#07100E]/95 p-3 shadow-2xl backdrop-blur-xl sm:static sm:flex-row sm:items-center sm:justify-between sm:bg-[#0B0F0F]/90 sm:p-4">
          <Link
            href={`/admin/quizzes/${assessment.id}/questions`}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-gray-200 transition hover:bg-white/[0.08] sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Link>

          <button
            type="button"
            disabled={
              !readyToPublish ||
              publishing
            }
            onClick={() =>
              setDialogOpen(true)
            }
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            <Send className="h-4 w-4" />
            Publish Assessment
          </button>
        </footer>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          if (!publishing) {
            setDialogOpen(nextOpen)
          }
        }}
      >
        <DialogContent className="w-[94vw] max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#07100E] p-0 text-white shadow-2xl">
          <DialogHeader className="border-b border-white/10 bg-gradient-to-r from-emerald-950/60 to-[#07100E] px-5 py-5 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                <Send className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <DialogTitle className="text-lg text-white">
                  Publish Assessment
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm text-gray-400">
                  Confirm that this assessment is ready for members.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5">
            <p className="text-sm leading-relaxed text-gray-300">
              Once published:
            </p>

            <div className="space-y-3">
              <ConfirmationItem
                icon={
                  <Users className="h-4 w-4" />
                }
                text="Eligible members will see the assessment according to its availability window."
              />

              <ConfirmationItem
                icon={
                  <Trophy className="h-4 w-4" />
                }
                text="Completed scores may affect Development performance."
              />

              <ConfirmationItem
                icon={
                  <LockKeyhole className="h-4 w-4" />
                }
                text="The academic content becomes permanently locked once the first attempt begins."
              />
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Publishing does not immediately lock the content. The lock occurs when the first member starts an attempt.
            </div>
          </div>

          <DialogFooter className="flex-row gap-3 border-t border-white/10 px-5 py-4">
            <button
              type="button"
              disabled={publishing}
              onClick={() =>
                setDialogOpen(false)
              }
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.07] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={publishing}
              onClick={() =>
                void publishAssessment()
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              {publishing
                ? "Publishing..."
                : "Publish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ReadyBanner({
  ready,
  missingCount,
  status,
}: {
  ready: boolean
  missingCount: number
  status:
    QuizEditorData["assessment"]["status"]
}) {
  if (status !== "draft") {
    return (
      <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-5 py-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />

          <div>
            <p className="font-semibold text-sky-100">
              Assessment already{" "}
              {status}
            </p>

            <p className="mt-1 text-sm text-sky-100/70">
              Only draft assessments can be published through this workflow.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
        rounded-2xl
        border
        px-5
        py-5
        ${
          ready
            ? "border-emerald-500/20 bg-emerald-500/10"
            : "border-amber-500/20 bg-amber-500/10"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {ready ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        )}

        <div>
          <p
            className={
              ready
                ? "font-semibold text-emerald-100"
                : "font-semibold text-amber-100"
            }
          >
            {ready
              ? "Assessment ready to publish"
              : "Assessment cannot be published yet"}
          </p>

          <p className="mt-1 text-sm text-gray-400">
            {ready
              ? "All required validations passed."
              : `${missingCount} required validation${
                  missingCount === 1
                    ? ""
                    : "s"
                } must be resolved.`}
          </p>
        </div>
      </div>
    </div>
  )
}

function ReviewSection({
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

function ReviewGrid({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {children}
    </div>
  )
}

function ReviewItem({
  label,
  value,
  icon,
  positive = false,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  positive?: boolean
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
        className={`
          mt-1
          truncate
          font-semibold
          ${
            positive
              ? "text-emerald-300"
              : "text-white"
          }
        `}
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

function ValidationRow({
  validation,
}: {
  validation: ValidationItem
}) {
  return (
    <div
      className={`
        flex
        items-start
        gap-3
        rounded-xl
        border
        px-4
        py-4
        ${
          validation.valid
            ? "border-emerald-500/15 bg-emerald-500/[0.06]"
            : "border-red-500/20 bg-red-500/[0.07]"
        }
      `}
    >
      <div
        className={`
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          ${
            validation.valid
              ? "bg-emerald-500 text-black"
              : "bg-red-500 text-white"
          }
        `}
      >
        {validation.valid ? (
          <Check className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-white">
          {validation.label}
        </p>

        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          {validation.message}
        </p>
      </div>
    </div>
  )
}

function ConfirmationItem({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) {
  return (
    <div className="flex items-start gap-3 text-sm text-gray-400">
      <div className="mt-0.5 text-emerald-300">
        {icon}
      </div>

      <p className="leading-relaxed">
        {text}
      </p>
    </div>
  )
}

function WorkflowHeader() {
  const steps = [
    "Setup",
    "Languages",
    "Questions",
    "Publish",
  ]

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
      <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
        {steps.map(
          (step, index) => {
            const active =
              index === 3

            const completed =
              index < 3

            return (
              <div
                key={step}
                className={`
                  flex
                  items-center
                  gap-3
                  bg-[#0B0F0F]
                  px-4
                  py-4
                  ${
                    active
                      ? "text-yellow-300"
                      : "text-emerald-300"
                  }
                `}
              >
                <span
                  className={`
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    text-xs
                    font-bold
                    ${
                      active
                        ? "border-yellow-400 bg-yellow-400 text-black"
                        : "border-emerald-400 bg-emerald-500 text-black"
                    }
                  `}
                >
                  {completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>

                <span className="text-sm font-medium">
                  {step}
                </span>
              </div>
            )
          }
        )}
      </div>
    </section>
  )
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

function formatCategory(
  value:
    QuizEditorData["assessment"]["category"]
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

function formatStatus(
  value:
    QuizEditorData["assessment"]["status"]
) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  )
}

function getLanguageName(
  language: "es" | "en"
) {
  return language === "es"
    ? "Español"
    : "English"
}