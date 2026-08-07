"use client"

import {
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  Clock3,
  FileQuestion,
  Loader2,
  RotateCcw,
  Shuffle,
  Trophy,
} from "lucide-react"
import { toast } from "sonner"

type QuizCategory =
  | "laws_of_the_game"
  | "competition_rules"
  | "class_review"
  | "other"

type FormState = {
  title: string
  description: string
  category: QuizCategory

  required: boolean
  countsForScore: boolean

  maxAttempts: string
  timeLimitMinutes: string
  questionsPerAttempt: string

  openFrom: string
  openUntil: string

  randomizeQuestions: boolean
  randomizeOptions: boolean
}

const initialState: FormState = {
  title: "",
  description: "",
  category: "laws_of_the_game",

  required: true,
  countsForScore: true,

  maxAttempts: "1",
  timeLimitMinutes: "20",
  questionsPerAttempt: "10",

  openFrom: "",
  openUntil: "",

  randomizeQuestions: true,
  randomizeOptions: true,
}

export default function CreateAssessmentForm() {
  const router = useRouter()

  const [form, setForm] =
    useState<FormState>(initialState)

  const [submitting, setSubmitting] =
    useState(false)

  const ready = useMemo(() => {
    return Boolean(
      form.title.trim() &&
        form.openFrom &&
        form.openUntil &&
        Number(form.maxAttempts) >= 1 &&
        Number(
          form.timeLimitMinutes
        ) >= 1 &&
        Number(
          form.questionsPerAttempt
        ) >= 1
    )
  }, [form])

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleRequiredChange(
    required: boolean
  ) {
    setForm((current) => ({
      ...current,
      required,
      countsForScore: required
        ? current.countsForScore
        : false,
    }))
  }

  async function submitAssessment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!ready || submitting) return

    setSubmitting(true)

    try {
      /*
       * datetime-local contains no timezone.
       * The browser converts the Board's local
       * selection into an absolute ISO timestamp.
       */
      const openFrom =
        new Date(form.openFrom)

      const openUntil =
        new Date(form.openUntil)

      if (
        Number.isNaN(openFrom.getTime()) ||
        Number.isNaN(openUntil.getTime())
      ) {
        throw new Error(
          "Enter valid opening and closing dates."
        )
      }

      if (
        openFrom.getTime() >=
        openUntil.getTime()
      ) {
        throw new Error(
          "The closing date must be after the opening date."
        )
      }

      const response = await fetch(
        "/api/admin/quizzes/create-assessment",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: form.title,
            description:
              form.description,
            category: form.category,

            required: form.required,
            counts_for_score:
              form.countsForScore,

            max_attempts: Number(
              form.maxAttempts
            ),

            time_limit_minutes:
              Number(
                form.timeLimitMinutes
              ),

            questions_per_attempt:
              Number(
                form.questionsPerAttempt
              ),

            randomize_questions:
              form.randomizeQuestions,

            randomize_options:
              form.randomizeOptions,

            open_from:
              openFrom.toISOString(),

            open_until:
              openUntil.toISOString(),
          }),
        }
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to create the assessment."
        )
      }

      const assessmentId =
        result?.assessment?.id

      if (!assessmentId) {
        throw new Error(
          "Assessment was created without a valid ID."
        )
      }

      toast.success(
        "Assessment draft created."
      )

      router.push(
        `/admin/quizzes/${assessmentId}/edit`
      )

      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create the assessment."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={submitAssessment}
      className="space-y-6"
    >
      {/* WORKFLOW */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
        <div className="border-b border-white/10 px-4 py-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.14em] text-gray-500">
            Assessment workflow
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
          <WorkflowStep
            number={1}
            label="Setup"
            active
          />

          <WorkflowStep
            number={2}
            label="Languages"
          />

          <WorkflowStep
            number={3}
            label="Questions"
          />

          <WorkflowStep
            number={4}
            label="Publish"
          />
        </div>
      </section>

      {/* GENERAL INFORMATION */}
      <FormSection
        title="Assessment Information"
        description="Define the purpose and basic identity of this evaluation."
        icon={
          <BookOpenCheck className="h-5 w-5 text-yellow-300" />
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <FieldGroup
            label="Assessment title"
            required
          >
            <input
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value
                )
              }
              placeholder="Example: IFAB Law Changes 2026"
              className={inputClassName}
              maxLength={150}
              required
            />
          </FieldGroup>

          <FieldGroup
            label="Category"
            required
          >
            <select
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target
                    .value as QuizCategory
                )
              }
              className={inputClassName}
            >
              <option value="laws_of_the_game">
                Laws of the Game
              </option>

              <option value="competition_rules">
                Competition Rules
              </option>

              <option value="class_review">
                Class Review
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </FieldGroup>
        </div>

        <FieldGroup label="Description">
          <textarea
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            placeholder="Explain what this assessment evaluates."
            className={`${inputClassName} min-h-28 resize-y`}
            maxLength={1000}
          />

          <p className="mt-1 text-right text-xs text-gray-600">
            {form.description.length}
            /1000
          </p>
        </FieldGroup>
      </FormSection>

      {/* DEVELOPMENT RULES */}
      <FormSection
        title="Development Rules"
        description="Decide whether members are required to complete this assessment."
        icon={
          <Trophy className="h-5 w-5 text-emerald-300" />
        }
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <ToggleCard
            title="Required assessment"
            description="Eligible cycle members are expected to complete it."
            checked={form.required}
            onChange={
              handleRequiredChange
            }
          />

          <ToggleCard
            title="Counts for Development"
            description="The member's best score affects Quiz performance."
            checked={
              form.countsForScore
            }
            disabled={!form.required}
            onChange={(checked) =>
              updateField(
                "countsForScore",
                checked
              )
            }
          />
        </div>

        {!form.required && (
          <div className="rounded-xl border border-sky-500/15 bg-sky-500/[0.07] px-4 py-3 text-sm text-sky-200/80">
            Optional assessments do not count toward Development scoring.
          </div>
        )}
      </FormSection>

      {/* ATTEMPT SETTINGS */}
      <FormSection
        title="Attempt Configuration"
        description="Set the conditions members will receive when beginning the quiz."
        icon={
          <FileQuestion className="h-5 w-5 text-sky-300" />
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <FieldGroup
            label="Maximum attempts"
            required
            icon={
              <RotateCcw className="h-4 w-4" />
            }
          >
            <input
              type="number"
              min={1}
              max={10}
              value={
                form.maxAttempts
              }
              onChange={(event) =>
                updateField(
                  "maxAttempts",
                  event.target.value
                )
              }
              className={inputClassName}
              required
            />
          </FieldGroup>

          <FieldGroup
            label="Time limit"
            helper="Minutes"
            required
            icon={
              <Clock3 className="h-4 w-4" />
            }
          >
            <input
              type="number"
              min={1}
              max={240}
              value={
                form.timeLimitMinutes
              }
              onChange={(event) =>
                updateField(
                  "timeLimitMinutes",
                  event.target.value
                )
              }
              className={inputClassName}
              required
            />
          </FieldGroup>

          <FieldGroup
            label="Questions per attempt"
            required
            icon={
              <FileQuestion className="h-4 w-4" />
            }
          >
            <input
              type="number"
              min={1}
              max={200}
              value={
                form.questionsPerAttempt
              }
              onChange={(event) =>
                updateField(
                  "questionsPerAttempt",
                  event.target.value
                )
              }
              className={inputClassName}
              required
            />
          </FieldGroup>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <ToggleCard
            title="Randomize questions"
            description="Each attempt receives questions in a different order."
            checked={
              form.randomizeQuestions
            }
            onChange={(checked) =>
              updateField(
                "randomizeQuestions",
                checked
              )
            }
            icon={
              <Shuffle className="h-4 w-4" />
            }
          />

          <ToggleCard
            title="Randomize options"
            description="Multiple-choice options appear in a different order."
            checked={
              form.randomizeOptions
            }
            onChange={(checked) =>
              updateField(
                "randomizeOptions",
                checked
              )
            }
            icon={
              <Shuffle className="h-4 w-4" />
            }
          />
        </div>
      </FormSection>

      {/* AVAILABILITY */}
      <FormSection
        title="Availability"
        description="Schedule when the assessment becomes available to eligible members."
        icon={
          <CalendarDays className="h-5 w-5 text-amber-300" />
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <FieldGroup
            label="Opens"
            required
          >
            <input
              type="datetime-local"
              value={form.openFrom}
              onChange={(event) =>
                updateField(
                  "openFrom",
                  event.target.value
                )
              }
              className={inputClassName}
              required
            />
          </FieldGroup>

          <FieldGroup
            label="Closes"
            required
          >
            <input
              type="datetime-local"
              value={form.openUntil}
              onChange={(event) =>
                updateField(
                  "openUntil",
                  event.target.value
                )
              }
              min={form.openFrom || undefined}
              className={inputClassName}
              required
            />
          </FieldGroup>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-xs leading-relaxed text-gray-500">
            Dates are entered using the Board member&apos;s local device time and saved as an absolute timestamp. The portal displays them in Los Angeles time.
          </p>
        </div>
      </FormSection>

      {/* SUBMIT */}
      <footer
        className="
          sticky
          bottom-3
          z-10
          rounded-2xl
          border
          border-white/10
          bg-[#07100E]/95
          p-3
          shadow-2xl
          backdrop-blur-xl
          sm:static
          sm:flex
          sm:items-center
          sm:justify-between
          sm:bg-[#0B0F0F]/90
          sm:p-4
        "
      >
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-white">
            Step 1 of 4
          </p>

          <p className="text-xs text-gray-500">
            The assessment will be saved as a draft.
          </p>
        </div>

        <button
          type="submit"
          disabled={
            !ready || submitting
          }
          className="
            inline-flex
            min-h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-emerald-500
            px-6
            text-sm
            font-semibold
            text-black
            transition
            hover:bg-emerald-400
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:w-auto
          "
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}

          {submitting
            ? "Creating Draft..."
            : "Save & Continue"}
        </button>
      </footer>
    </form>
  )
}

function FormSection({
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

      <div className="space-y-5 p-4 sm:p-6">
        {children}
      </div>
    </section>
  )
}

function FieldGroup({
  label,
  helper,
  icon,
  required = false,
  children,
}: {
  label: string
  helper?: string
  icon?: React.ReactNode
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-300">
          {icon}

          {label}

          {required && (
            <span className="text-red-400">
              *
            </span>
          )}
        </span>

        {helper && (
          <span className="text-xs text-gray-600">
            {helper}
          </span>
        )}
      </div>

      {children}
    </label>
  )
}

function ToggleCard({
  title,
  description,
  checked,
  onChange,
  disabled = false,
  icon,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() =>
        onChange(!checked)
      }
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
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${
          checked
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
          rounded-md
          border
          ${
            checked
              ? "border-emerald-400 bg-emerald-500 text-black"
              : "border-white/15 bg-black/20 text-transparent"
          }
        `}
      >
        <Check className="h-4 w-4" />
      </span>

      <span className="min-w-0">
        <span className="flex items-center gap-2 font-medium text-white">
          {icon}
          {title}
        </span>

        <span className="mt-1 block text-sm leading-relaxed text-gray-500">
          {description}
        </span>
      </span>
    </button>
  )
}

function WorkflowStep({
  number,
  label,
  active = false,
}: {
  number: number
  label: string
  active?: boolean
}) {
  return (
    <div
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
            active
              ? "border-yellow-400 bg-yellow-400 text-black"
              : "border-white/10 bg-white/[0.025]"
          }
        `}
      >
        {number}
      </span>

      <span className="text-sm font-medium">
        {label}
      </span>
    </div>
  )
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