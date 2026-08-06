"use client"

import {
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  FileQuestion,
  Languages,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import type {
  AdminQuizQuestionBank,
  QuestionBankLanguage,
} from "@/src/lib/queries/get-admin-quiz-question-bank"

type QuestionType =
  | "multiple_choice"
  | "true_false"

type EditorOption = {
  localId: string
  text: string
  isCorrect: boolean
}

type TranslationState = {
  versionId: string
  language: QuestionBankLanguage
  questionText: string
  explanation: string
  options: EditorOption[]
}

type QuestionGroupEditorProps = {
  assessmentId: string
  assessmentTitle: string
  versions:
    AdminQuizQuestionBank["versions"]
}

export default function QuestionGroupEditor({
  assessmentId,
  assessmentTitle,
  versions,
}: QuestionGroupEditorProps) {
  const router = useRouter()

  const [questionType, setQuestionType] =
    useState<QuestionType>(
      "multiple_choice"
    )

  const [translations, setTranslations] =
    useState<TranslationState[]>(() =>
      versions.map((version) =>
        createTranslation(
          version.id,
          version.language,
          "multiple_choice"
        )
      )
    )

  const [submitting, setSubmitting] =
    useState(false)

  const valid = useMemo(() => {
    return translations.every(
      (translation) => {
        const expectedOptions =
          questionType === "true_false"
            ? 2
            : translation.options.length

        return Boolean(
          translation.questionText.trim() &&
            expectedOptions >= 2 &&
            expectedOptions <= 4 &&
            translation.options.every(
              (option) =>
                option.text.trim()
            ) &&
            translation.options.filter(
              (option) =>
                option.isCorrect
            ).length === 1
        )
      }
    )
  }, [questionType, translations])

  function changeQuestionType(
    nextType: QuestionType
  ) {
    setQuestionType(nextType)

    setTranslations((current) =>
      current.map((translation) => ({
        ...translation,
        options:
          nextType === "true_false"
            ? getTrueFalseOptions(
                translation.language
              )
            : getDefaultMultipleChoiceOptions(),
      }))
    )
  }

  function updateTranslation(
    language: QuestionBankLanguage,
    updates: Partial<TranslationState>
  ) {
    setTranslations((current) =>
      current.map((translation) =>
        translation.language ===
        language
          ? {
              ...translation,
              ...updates,
            }
          : translation
      )
    )
  }

  function updateOption(
    language: QuestionBankLanguage,
    localId: string,
    updates: Partial<EditorOption>
  ) {
    setTranslations((current) =>
      current.map((translation) => {
        if (
          translation.language !==
          language
        ) {
          return translation
        }

        const updatedOptions =
          translation.options.map(
            (option) => {
              if (
                option.localId !==
                localId
              ) {
                return updates.isCorrect
                  ? {
                      ...option,
                      isCorrect: false,
                    }
                  : option
              }

              return {
                ...option,
                ...updates,
              }
            }
          )

        return {
          ...translation,
          options: updatedOptions,
        }
      })
    )
  }

  function addOption(
    language: QuestionBankLanguage
  ) {
    setTranslations((current) =>
      current.map((translation) => {
        if (
          translation.language !==
            language ||
          translation.options.length >= 4
        ) {
          return translation
        }

        return {
          ...translation,
          options: [
            ...translation.options,
            createOption(),
          ],
        }
      })
    )
  }

  function removeOption(
    language: QuestionBankLanguage,
    localId: string
  ) {
    setTranslations((current) =>
      current.map((translation) => {
        if (
          translation.language !==
            language ||
          translation.options.length <= 2
        ) {
          return translation
        }

        return {
          ...translation,
          options:
            translation.options.filter(
              (option) =>
                option.localId !==
                localId
            ),
        }
      })
    )
  }

  async function submitQuestion(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!valid || submitting) return

    setSubmitting(true)

    try {
      const response = await fetch(
        `/api/admin/quizzes/${assessmentId}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            question_type:
              questionType,

            translations:
              translations.map(
                (translation) => ({
                  version_id:
                    translation.versionId,

                  language:
                    translation.language,

                  question_text:
                    translation.questionText,

                  explanation:
                    translation.explanation,

                  options:
                    translation.options.map(
                      (option) => ({
                        text: option.text,
                        is_correct:
                          option.isCorrect,
                      })
                    ),
                })
              ),
          }),
        }
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to create the question."
        )
      }

      toast.success(
        "Question group created."
      )

      router.push(
        `/admin/quizzes/${assessmentId}/questions`
      )

      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create the question."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={submitQuestion}
      className="space-y-6"
    >
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
        <div className="flex items-start gap-3 border-b border-white/10 px-4 py-5 sm:px-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-400/15 bg-yellow-400/10">
            <FileQuestion className="h-5 w-5 text-yellow-300" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Question Configuration
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {assessmentTitle}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-sm font-medium text-gray-300">
            Question type
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <QuestionTypeCard
              title="Multiple Choice"
              description="Between two and four options with one correct answer."
              selected={
                questionType ===
                "multiple_choice"
              }
              onSelect={() =>
                changeQuestionType(
                  "multiple_choice"
                )
              }
            />

            <QuestionTypeCard
              title="True / False"
              description="Exactly two answer options with one correct answer."
              selected={
                questionType ===
                "true_false"
              }
              onSelect={() =>
                changeQuestionType(
                  "true_false"
                )
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-sky-500/15 bg-sky-500/[0.06] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <Languages className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />

          <div>
            <p className="font-medium text-sky-100">
              One conceptual question, multiple languages
            </p>

            <p className="mt-1 text-sm leading-relaxed text-gray-400">
              Every translation below represents the same rule or concept. The correct answer must remain logically equivalent across languages.
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-5">
        {translations.map(
          (translation) => (
            <TranslationEditor
              key={translation.versionId}
              value={translation}
              questionType={
                questionType
              }
              onUpdate={(updates) =>
                updateTranslation(
                  translation.language,
                  updates
                )
              }
              onUpdateOption={(
                localId,
                updates
              ) =>
                updateOption(
                  translation.language,
                  localId,
                  updates
                )
              }
              onAddOption={() =>
                addOption(
                  translation.language
                )
              }
              onRemoveOption={(
                localId
              ) =>
                removeOption(
                  translation.language,
                  localId
                )
              }
            />
          )
        )}
      </div>

      <footer className="sticky bottom-3 z-10 flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#07100E]/95 p-3 shadow-2xl backdrop-blur-xl sm:static sm:flex-row sm:items-center sm:justify-between sm:bg-[#0B0F0F]/90 sm:p-4">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/admin/quizzes/${assessmentId}/questions`
            )
          }
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-gray-200 transition hover:bg-white/[0.08] sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            !valid || submitting
          }
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {submitting
            ? "Creating..."
            : "Save Question Group"}
        </button>
      </footer>
    </form>
  )
}

function TranslationEditor({
  value,
  questionType,
  onUpdate,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
}: {
  value: TranslationState
  questionType: QuestionType
  onUpdate: (
    updates: Partial<TranslationState>
  ) => void
  onUpdateOption: (
    localId: string,
    updates: Partial<EditorOption>
  ) => void
  onAddOption: () => void
  onRemoveOption: (
    localId: string
  ) => void
}) {
  const spanish =
    value.language === "es"

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-sky-950/30 to-[#0B0F0F] px-4 py-4 sm:px-6">
        <div>
          <p className="font-semibold text-white">
            {spanish
              ? "Español"
              : "English"}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            {spanish
              ? "Spanish translation"
              : "English translation"}
          </p>
        </div>

        <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-300">
          {value.language.toUpperCase()}
        </span>
      </div>

      <div className="space-y-6 p-4 sm:p-6">
        <FieldGroup
          label="Question text"
          required
        >
          <textarea
            value={value.questionText}
            onChange={(event) =>
              onUpdate({
                questionText:
                  event.target.value,
              })
            }
            placeholder={
              spanish
                ? "Escribe la pregunta en español..."
                : "Write the question in English..."
            }
            className={`${inputClassName} min-h-28 resize-y`}
          />
        </FieldGroup>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-300">
                Answer options
              </p>

              <p className="mt-0.5 text-xs text-gray-600">
                Select exactly one correct answer.
              </p>
            </div>

            {questionType ===
              "multiple_choice" &&
              value.options.length < 4 && (
                <button
                  type="button"
                  onClick={onAddOption}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-gray-300 transition hover:bg-white/[0.07]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Option
                </button>
              )}
          </div>

          <div className="space-y-3">
            {value.options.map(
              (option, index) => (
                <OptionEditor
                  key={option.localId}
                  option={option}
                  label={getOptionLabel(
                    index
                  )}
                  removable={
                    questionType ===
                      "multiple_choice" &&
                    value.options.length > 2
                  }
                  onUpdate={(updates) =>
                    onUpdateOption(
                      option.localId,
                      updates
                    )
                  }
                  onRemove={() =>
                    onRemoveOption(
                      option.localId
                    )
                  }
                />
              )
            )}
          </div>
        </div>

        <FieldGroup label="Explanation">
          <textarea
            value={value.explanation}
            onChange={(event) =>
              onUpdate({
                explanation:
                  event.target.value,
              })
            }
            placeholder={
              spanish
                ? "Explica por qué esta es la respuesta correcta..."
                : "Explain why this is the correct answer..."
            }
            className={`${inputClassName} min-h-24 resize-y`}
          />
        </FieldGroup>
      </div>
    </section>
  )
}

function OptionEditor({
  option,
  label,
  removable,
  onUpdate,
  onRemove,
}: {
  option: EditorOption
  label: string
  removable: boolean
  onUpdate: (
    updates: Partial<EditorOption>
  ) => void
  onRemove: () => void
}) {
  return (
    <div
      className={`
        flex
        items-center
        gap-3
        rounded-xl
        border
        px-3
        py-3
        transition
        ${
          option.isCorrect
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-white/10 bg-white/[0.025]"
        }
      `}
    >
      <button
        type="button"
        onClick={() =>
          onUpdate({
            isCorrect: true,
          })
        }
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          text-sm
          font-semibold
          transition
          ${
            option.isCorrect
              ? "border-emerald-400 bg-emerald-500 text-black"
              : "border-white/10 bg-black/20 text-gray-500 hover:border-emerald-500/30"
          }
        `}
        title="Mark as correct answer"
      >
        {option.isCorrect ? (
          <Check className="h-4 w-4" />
        ) : (
          label
        )}
      </button>

      <input
        value={option.text}
        onChange={(event) =>
          onUpdate({
            text: event.target.value,
          })
        }
        placeholder={`Option ${label}`}
        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
      />

      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-red-500/10 hover:text-red-300"
          title="Remove option"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function QuestionTypeCard({
  title,
  description,
  selected,
  onSelect,
}: {
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        flex
        min-h-24
        items-start
        gap-3
        rounded-xl
        border
        px-4
        py-4
        text-left
        transition
        ${
          selected
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]"
        }
      `}
    >
      <span
        className={`
          mt-0.5
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          ${
            selected
              ? "border-emerald-400 bg-emerald-500 text-black"
              : "border-white/15 bg-black/20"
          }
        `}
      >
        {selected && (
          <Check className="h-4 w-4" />
        )}
      </span>

      <span>
        <span className="block font-medium text-white">
          {title}
        </span>

        <span className="mt-1 block text-sm leading-relaxed text-gray-500">
          {description}
        </span>
      </span>
    </button>
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

function createTranslation(
  versionId: string,
  language: QuestionBankLanguage,
  questionType: QuestionType
): TranslationState {
  return {
    versionId,
    language,
    questionText: "",
    explanation: "",
    options:
      questionType === "true_false"
        ? getTrueFalseOptions(language)
        : getDefaultMultipleChoiceOptions(),
  }
}

function getDefaultMultipleChoiceOptions(): EditorOption[] {
  return [
    createOption(),
    createOption(),
    createOption(),
    createOption(),
  ]
}

function getTrueFalseOptions(
  language: QuestionBankLanguage
): EditorOption[] {
  return [
    {
      localId: createLocalId(),
      text:
        language === "es"
          ? "Verdadero"
          : "True",
      isCorrect: false,
    },
    {
      localId: createLocalId(),
      text:
        language === "es"
          ? "Falso"
          : "False",
      isCorrect: false,
    },
  ]
}

function createOption(): EditorOption {
  return {
    localId: createLocalId(),
    text: "",
    isCorrect: false,
  }
}

function createLocalId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`
}

function getOptionLabel(index: number) {
  return String.fromCharCode(65 + index)
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
`