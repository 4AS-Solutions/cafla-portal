"use client"

import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileQuestion,
  Languages,
  LockKeyhole,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import type {
  AdminQuizQuestionBank,
  QuestionBankGroup,
  QuestionBankLanguage,
} from "@/src/lib/queries/get-admin-quiz-question-bank"

type QuestionBankBuilderProps = {
  bank: AdminQuizQuestionBank
}

export default function QuestionBankBuilder({
  bank,
}: QuestionBankBuilderProps) {
  const canEdit =
    !bank.assessment.contentLocked &&
    bank.assessment.status !==
      "closed" &&
    bank.assessment.status !==
      "archived"

  return (
    <div className="space-y-6">
      <WorkflowHeader />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Question groups"
          value={bank.summary.total}
          helper={`${bank.summary.valid} valid`}
          icon={
            <FileQuestion className="h-5 w-5 text-yellow-300" />
          }
        />

        <MetricCard
          label="Ready"
          value={bank.summary.complete}
          helper="All languages complete"
          icon={
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          }
        />

        <MetricCard
          label="Incomplete"
          value={
            bank.summary.incomplete
          }
          helper="Missing content"
          icon={
            <AlertTriangle className="h-5 w-5 text-amber-300" />
          }
        />

        <MetricCard
          label="Per attempt"
          value={
            bank.summary
              .requiredPerAttempt
          }
          helper={
            bank.summary.readyToPublish
              ? "Requirement met"
              : "More questions needed"
          }
          icon={
            <Languages className="h-5 w-5 text-sky-300" />
          }
        />
      </section>

      <section
        className={`
          rounded-2xl
          border
          px-4
          py-4
          sm:px-5
          ${
            bank.summary.readyToPublish
              ? "border-emerald-500/20 bg-emerald-500/10"
              : "border-amber-500/20 bg-amber-500/10"
          }
        `}
      >
        <div className="flex items-start gap-3">
          <div
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              ${
                bank.summary.readyToPublish
                  ? "border-emerald-500/20 bg-emerald-500/10"
                  : "border-amber-500/20 bg-amber-500/10"
              }
            `}
          >
            {bank.summary
              .readyToPublish ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-300" />
            )}
          </div>

          <div>
            <p
              className={`
                font-semibold
                ${
                  bank.summary
                    .readyToPublish
                    ? "text-emerald-100"
                    : "text-amber-100"
                }
              `}
            >
              {bank.summary
                .readyToPublish
                ? "Question bank requirement met"
                : "Question bank is not ready"}
            </p>

            <p className="mt-1 text-sm leading-relaxed text-gray-400">
              {bank.summary.complete} complete question groups are available. This assessment requires{" "}
              {
                bank.summary
                  .requiredPerAttempt
              }{" "}
              per attempt.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
        <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-semibold text-white">
              Question Bank
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Each group contains the same question in every enabled language.
            </p>
          </div>

          {canEdit ? (
            <Link
              href={`/admin/quizzes/${bank.assessment.id}/questions/new`}
              className="
                inline-flex
                min-h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-500
                px-5
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-emerald-400
                sm:w-auto
              "
            >
              <Plus className="h-4 w-4" />
              Create Question Group
            </Link>
          ) : (
            <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 text-sm text-gray-500">
              <LockKeyhole className="h-4 w-4" />
              Content locked
            </div>
          )}
        </div>

        {bank.groups.length === 0 ? (
          <EmptyQuestionBank
            assessmentId={
              bank.assessment.id
            }
            canEdit={canEdit}
          />
        ) : (
          <div className="divide-y divide-white/10">
            {bank.groups.map(
              (group, index) => (
                <QuestionGroupRow
                  key={group.id}
                  group={group}
                  number={index + 1}
                  assessmentId={
                    bank.assessment.id
                  }
                  enabledLanguages={bank.versions.map(
                    (version) =>
                      version.language
                  )}
                  canEdit={canEdit}
                />
              )
            )}
          </div>
        )}
      </section>

      <footer className="sticky bottom-3 z-10 flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#07100E]/95 p-3 shadow-2xl backdrop-blur-xl sm:static sm:flex-row sm:items-center sm:justify-between sm:bg-[#0B0F0F]/90 sm:p-4">
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-white">
            Step 3 of 4
          </p>

          <p className="text-xs text-gray-500">
            Add and validate every question before publishing.
          </p>
        </div>

        <Link
          href={`/admin/quizzes/${bank.assessment.id}/publish`}
          aria-disabled={
            !bank.summary.readyToPublish
          }
          className={`
            inline-flex
            min-h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            px-6
            text-sm
            font-semibold
            transition
            sm:w-auto
            ${
              bank.summary.readyToPublish
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : "pointer-events-none bg-white/5 text-gray-600"
            }
          `}
        >
          Continue to Publish
          <ArrowRight className="h-4 w-4" />
        </Link>
      </footer>
    </div>
  )
}

function QuestionGroupRow({
  group,
  number,
  assessmentId,
  enabledLanguages,
  canEdit,
}: {
  group: QuestionBankGroup
  number: number
  assessmentId: string
  enabledLanguages:
    QuestionBankLanguage[]
  canEdit: boolean
}) {
  const primaryTranslation =
    group.translations.find(
      (translation) =>
        translation.language === "es"
    ) ??
    group.translations[0]

  return (
    <article
      className={`
        px-4
        py-5
        transition
        sm:px-6
        ${
          group.isInvalidated
            ? "bg-amber-500/[0.035]"
            : "hover:bg-white/[0.02]"
        }
      `}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              text-sm
              font-bold
              ${
                group.isComplete
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-300"
              }
            `}
          >
            {number}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {group.questionType ===
                "true_false"
                  ? "True / False"
                  : "Multiple Choice"}
              </span>

              {group.isComplete ? (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  Complete
                </span>
              ) : (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                  Incomplete
                </span>
              )}

              {group.isInvalidated && (
                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-300">
                  Invalidated
                </span>
              )}
            </div>

            <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-white sm:text-base">
              {primaryTranslation
                ?.questionText ||
                "Question text is missing."}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {enabledLanguages.map(
                (language) => {
                  const complete =
                    group.completeLanguages.includes(
                      language
                    )

                  return (
                    <span
                      key={language}
                      className={`
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        px-2.5
                        py-1.5
                        text-xs
                        ${
                          complete
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                        }
                      `}
                    >
                      {complete ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}

                      {language === "es"
                        ? "Español"
                        : "English"}
                    </span>
                  )
                }
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pl-12 lg:pl-0">
          <Link
            href={`/admin/quizzes/${assessmentId}/questions/${group.id}`}
            className="
              inline-flex
              min-h-10
              flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/[0.03]
              px-4
              text-sm
              font-medium
              text-gray-200
              transition
              hover:bg-white/[0.07]
              lg:flex-none
            "
          >
            <Pencil className="h-4 w-4" />
            {canEdit ? "Edit" : "View"}
          </Link>

          {canEdit && (
            <button
              type="button"
              disabled
              title="Delete action will be connected next."
              className="
                inline-flex
                min-h-10
                items-center
                justify-center
                rounded-xl
                border
                border-red-500/15
                bg-red-500/[0.06]
                px-3
                text-red-300
                opacity-40
              "
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function EmptyQuestionBank({
  assessmentId,
  canEdit,
}: {
  assessmentId: string
  canEdit: boolean
}) {
  return (
    <div className="px-5 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-400/15 bg-yellow-400/10">
        <FileQuestion className="h-5 w-5 text-yellow-300" />
      </div>

      <p className="mt-4 font-semibold text-white">
        No questions yet
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
        Create the first bilingual question group for this assessment.
      </p>

      {canEdit && (
        <Link
          href={`/admin/quizzes/${assessmentId}/questions/new`}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-black transition hover:bg-emerald-400"
        >
          <Plus className="h-4 w-4" />
          Create First Question
        </Link>
      )}
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

function WorkflowHeader() {
  const steps = [
    {
      number: 1,
      label: "Setup",
      completed: true,
    },
    {
      number: 2,
      label: "Languages",
      completed: true,
    },
    {
      number: 3,
      label: "Questions",
      active: true,
    },
    {
      number: 4,
      label: "Publish",
    },
  ]

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
      <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`
              flex
              items-center
              gap-3
              bg-[#0B0F0F]
              px-4
              py-4
              ${
                step.active
                  ? "text-yellow-300"
                  : step.completed
                    ? "text-emerald-300"
                    : "text-gray-600"
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
                  step.active
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : step.completed
                      ? "border-emerald-400 bg-emerald-500 text-black"
                      : "border-white/10 bg-white/[0.025]"
                }
              `}
            >
              {step.completed ? (
                <Check className="h-4 w-4" />
              ) : (
                step.number
              )}
            </span>

            <span className="text-sm font-medium">
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}