"use client"

import {
  useMemo,
  useState,
} from "react"
import {
  ArrowRight,
  Check,
  Languages,
  Loader2,
  Save,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type {
  QuizEditorData,
  QuizEditorLanguage,
} from "@/src/lib/queries/get-admin-quiz-editor"

type LanguageState = {
  language: QuizEditorLanguage
  enabled: boolean
  title: string
  description: string
  instructions: string
}

type AssessmentLanguageEditorProps = {
  assessment:
    QuizEditorData["assessment"]

  initialVersions:
    QuizEditorData["versions"]

  questionGroupsCount: number
}

export default function AssessmentLanguageEditor({
  assessment,
  initialVersions,
  questionGroupsCount,
}: AssessmentLanguageEditorProps) {
  const router = useRouter()

  const [languages, setLanguages] =
    useState<LanguageState[]>(() => {
      return [
        createInitialLanguage(
          "es",
          initialVersions,
          assessment.title
        ),

        createInitialLanguage(
          "en",
          initialVersions,
          assessment.title
        ),
      ]
    })

  const [saving, setSaving] =
    useState(false)

  const enabledCount = useMemo(
    () =>
      languages.filter(
        (language) =>
          language.enabled
      ).length,
    [languages]
  )

  const canSave =
    enabledCount > 0 &&
    languages
      .filter(
        (language) =>
          language.enabled
      )
      .every(
        (language) =>
          language.title.trim()
      ) &&
    !assessment.contentLocked

  function updateLanguage(
    language: QuizEditorLanguage,
    updates: Partial<LanguageState>
  ) {
    setLanguages((current) =>
      current.map((item) =>
        item.language === language
          ? {
              ...item,
              ...updates,
            }
          : item
      )
    )
  }

  async function saveVersions({
    continueToQuestions = false,
  }: {
    continueToQuestions?: boolean
  } = {}) {
    if (!canSave || saving) return

    setSaving(true)

    try {
      const response = await fetch(
        `/api/admin/quizzes/${assessment.id}/versions`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            versions: languages,
          }),
        }
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to save language versions."
        )
      }

      toast.success(
        "Language versions saved."
      )

      if (continueToQuestions) {
        router.push(
          `/admin/quizzes/${assessment.id}/questions`
        )
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save language versions."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <WorkflowHeader />

      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/90 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
            <Languages className="h-5 w-5 text-sky-300" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Language Versions
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Members will choose one language before starting each attempt. Attempts are shared across all versions.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryItem
            label="Enabled"
            value={enabledCount}
          />

          <SummaryItem
            label="Questions"
            value={questionGroupsCount}
          />

          <SummaryItem
            label="Attempts"
            value={
              assessment.maxAttempts
            }
          />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {languages.map(
          (language) => (
            <LanguageCard
              key={language.language}
              value={language}
              disabled={
                assessment.contentLocked
              }
              onUpdate={(updates) =>
                updateLanguage(
                  language.language,
                  updates
                )
              }
            />
          )
        )}
      </div>

      {assessment.contentLocked && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
          Language content is locked because a member has already started this assessment.
        </div>
      )}

      <footer className="sticky bottom-3 z-10 flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#07100E]/95 p-3 shadow-2xl backdrop-blur-xl sm:static sm:flex-row sm:items-center sm:justify-between sm:bg-[#0B0F0F]/90 sm:p-4">
        <button
          type="button"
          disabled={
            !canSave || saving
          }
          onClick={() =>
            void saveVersions()
          }
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-gray-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          Save Languages
        </button>

        <button
          type="button"
          disabled={
            !canSave || saving
          }
          onClick={() =>
            void saveVersions({
              continueToQuestions: true,
            })
          }
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}

          Save & Continue
        </button>
      </footer>
    </div>
  )
}

function LanguageCard({
  value,
  disabled,
  onUpdate,
}: {
  value: LanguageState
  disabled: boolean
  onUpdate: (
    updates: Partial<LanguageState>
  ) => void
}) {
  const spanish =
    value.language === "es"

  return (
    <section
      className={`
        overflow-hidden
        rounded-2xl
        border
        bg-[#0B0F0F]/90
        transition
        ${
          value.enabled
            ? "border-emerald-500/25"
            : "border-white/10"
        }
      `}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
        <div>
          <p className="font-semibold text-white">
            {spanish
              ? "Español"
              : "English"}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            {spanish
              ? "Spanish version"
              : "English version"}
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onUpdate({
              enabled:
                !value.enabled,
            })
          }
          className={`
            flex
            h-8
            min-w-16
            items-center
            justify-center
            gap-1.5
            rounded-full
            border
            px-3
            text-xs
            font-semibold
            transition
            disabled:opacity-40
            ${
              value.enabled
                ? "border-emerald-400 bg-emerald-500 text-black"
                : "border-white/10 bg-white/[0.03] text-gray-500"
            }
          `}
        >
          {value.enabled && (
            <Check className="h-3.5 w-3.5" />
          )}

          {value.enabled
            ? "Enabled"
            : "Disabled"}
        </button>
      </div>

      <div
        className={`
          space-y-4
          p-4
          sm:p-5
          ${
            !value.enabled
              ? "pointer-events-none opacity-40"
              : ""
          }
        `}
      >
        <FieldGroup
          label="Version title"
          required
        >
          <input
            value={value.title}
            onChange={(event) =>
              onUpdate({
                title:
                  event.target.value,
              })
            }
            disabled={disabled}
            placeholder={
              spanish
                ? "Cambios IFAB 2026"
                : "IFAB Law Changes 2026"
            }
            className={
              inputClassName
            }
          />
        </FieldGroup>

        <FieldGroup label="Description">
          <textarea
            value={
              value.description
            }
            onChange={(event) =>
              onUpdate({
                description:
                  event.target.value,
              })
            }
            disabled={disabled}
            placeholder={
              spanish
                ? "Descripción para los miembros que elijan español."
                : "Description for members choosing English."
            }
            className={`${inputClassName} min-h-24 resize-y`}
          />
        </FieldGroup>

        <FieldGroup label="Instructions">
          <textarea
            value={
              value.instructions
            }
            onChange={(event) =>
              onUpdate({
                instructions:
                  event.target.value,
              })
            }
            disabled={disabled}
            placeholder={
              spanish
                ? "Selecciona la mejor respuesta para cada pregunta."
                : "Select the best answer for each question."
            }
            className={`${inputClassName} min-h-24 resize-y`}
          />
        </FieldGroup>
      </div>
    </section>
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
      active: true,
    },
    {
      number: 3,
      label: "Questions",
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

function SummaryItem({
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

function FieldGroup({
  label,
  required = false,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">
        {label}

        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  )
}

function createInitialLanguage(
  language: QuizEditorLanguage,
  versions:
    QuizEditorData["versions"],
  assessmentTitle: string
): LanguageState {
  const existing = versions.find(
    (version) =>
      version.language ===
      language
  )

  if (existing) {
    return {
      language,
      enabled: true,
      title: existing.title,
      description:
        existing.description,
      instructions:
        existing.instructions,
    }
  }

  return {
    language,
    enabled: language === "es",
    title:
      language === "es"
        ? assessmentTitle
        : "",
    description: "",
    instructions:
      language === "es"
        ? "Selecciona la mejor respuesta para cada pregunta."
        : "Select the best answer for each question.",
  }
}

const inputClassName = `
  w-full
  rounded-xl
  border
  border-white/10
  bg-black/30
  px-4
  py-3
  text-sm
  text-white
  outline-none
  transition
  placeholder:text-gray-600
  focus:border-yellow-400/40
  focus:ring-2
  focus:ring-yellow-400/10
  disabled:cursor-not-allowed
  disabled:opacity-60
`