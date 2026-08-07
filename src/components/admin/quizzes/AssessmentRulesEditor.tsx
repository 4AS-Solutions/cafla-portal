"use client"

import {
  Check,
  CheckCircle2,
  FileQuestion,
  ListChecks,
  Loader2,
  LockKeyhole,
  Pencil,
  RotateCcw,
  Save,
  Shuffle,
  Target,
  X,
} from "lucide-react"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type AssessmentStatus =
  | "draft"
  | "published"
  | "closed"
  | "archived"

type AssessmentRulesEditorProps = {
  assessmentId: string

  required: boolean
  countsForScore: boolean

  maxAttempts: number
  timeLimitMinutes: number
  questionsPerAttempt: number

  randomizeQuestions: boolean
  randomizeOptions: boolean

  contentLocked: boolean
  status: AssessmentStatus
}

type RulesResponse = {
  success: boolean

  assessment?: {
    id: string
    status: string
    required: boolean
    counts_for_score: boolean
    max_attempts: number
    time_limit_minutes: number
    questions_per_attempt: number
    randomize_questions: boolean
    randomize_options: boolean
    content_locked_at: string | null
    updated_at: string
  }

  error?: string
}

export default function AssessmentRulesEditor({
  assessmentId,

  required,
  countsForScore,

  maxAttempts,
  timeLimitMinutes,
  questionsPerAttempt,

  randomizeQuestions,
  randomizeOptions,

  contentLocked,
  status,
}: AssessmentRulesEditorProps) {
  const router = useRouter()

  const initialRules = useMemo(
    () => ({
      required,
      countsForScore,

      maxAttempts,
      timeLimitMinutes,
      questionsPerAttempt,

      randomizeQuestions,
      randomizeOptions,
    }),
    [
      required,
      countsForScore,
      maxAttempts,
      timeLimitMinutes,
      questionsPerAttempt,
      randomizeQuestions,
      randomizeOptions,
    ]
  )

  const [editing, setEditing] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [requiredValue, setRequiredValue] =
    useState(required)

  const [
    countsForScoreValue,
    setCountsForScoreValue,
  ] = useState(countsForScore)

  const [
    maxAttemptsValue,
    setMaxAttemptsValue,
  ] = useState(String(maxAttempts))

  const [
    timeLimitValue,
    setTimeLimitValue,
  ] = useState(
    String(timeLimitMinutes)
  )

  const [
    questionsPerAttemptValue,
    setQuestionsPerAttemptValue,
  ] = useState(
    String(questionsPerAttempt)
  )

  const [
    randomizeQuestionsValue,
    setRandomizeQuestionsValue,
  ] = useState(randomizeQuestions)

  const [
    randomizeOptionsValue,
    setRandomizeOptionsValue,
  ] = useState(randomizeOptions)

  const isArchived =
    status === "archived"

  const rulesLocked =
    contentLocked || isArchived

  const parsedMaxAttempts =
    Number(maxAttemptsValue)

  const parsedTimeLimit =
    Number(timeLimitValue)

  const parsedQuestionsPerAttempt =
    Number(
      questionsPerAttemptValue
    )

  const effectiveCountsForScore =
    requiredValue
      ? countsForScoreValue
      : false

  const hasChanges =
    requiredValue !==
      initialRules.required ||
    effectiveCountsForScore !==
      initialRules.countsForScore ||
    parsedMaxAttempts !==
      initialRules.maxAttempts ||
    parsedTimeLimit !==
      initialRules.timeLimitMinutes ||
    parsedQuestionsPerAttempt !==
      initialRules.questionsPerAttempt ||
    randomizeQuestionsValue !==
      initialRules.randomizeQuestions ||
    randomizeOptionsValue !==
      initialRules.randomizeOptions

  function restoreInitialValues() {
    setRequiredValue(
      initialRules.required
    )

    setCountsForScoreValue(
      initialRules.countsForScore
    )

    setMaxAttemptsValue(
      String(
        initialRules.maxAttempts
      )
    )

    setTimeLimitValue(
      String(
        initialRules.timeLimitMinutes
      )
    )

    setQuestionsPerAttemptValue(
      String(
        initialRules.questionsPerAttempt
      )
    )

    setRandomizeQuestionsValue(
      initialRules.randomizeQuestions
    )

    setRandomizeOptionsValue(
      initialRules.randomizeOptions
    )
  }

  function startEditing() {
    if (isArchived) {
      toast.error(
        "Archived assessments cannot be modified."
      )

      return
    }

    if (contentLocked) {
      toast.error(
        "Assessment rules are locked because a member has already started an attempt."
      )

      return
    }

    restoreInitialValues()
    setEditing(true)
  }

  function cancelEditing() {
    if (saving) return

    restoreInitialValues()
    setEditing(false)
  }

  function resetRules() {
    if (saving) return

    restoreInitialValues()
  }

  function handleRequiredChange(
    nextValue: boolean
  ) {
    setRequiredValue(nextValue)

    /*
     * Optional assessments cannot
     * contribute to Development score.
     */
    if (!nextValue) {
      setCountsForScoreValue(false)
    }
  }

  async function saveRules() {
    if (saving) return

    if (
      !Number.isInteger(
        parsedMaxAttempts
      ) ||
      parsedMaxAttempts < 1 ||
      parsedMaxAttempts > 10
    ) {
      toast.error(
        "Maximum attempts must be between 1 and 10."
      )

      return
    }

    if (
      !Number.isInteger(
        parsedTimeLimit
      ) ||
      parsedTimeLimit < 1 ||
      parsedTimeLimit > 240
    ) {
      toast.error(
        "Time limit must be between 1 and 240 minutes."
      )

      return
    }

    if (
      !Number.isInteger(
        parsedQuestionsPerAttempt
      ) ||
      parsedQuestionsPerAttempt <
        1 ||
      parsedQuestionsPerAttempt >
        200
    ) {
      toast.error(
        "Questions per attempt must be between 1 and 200."
      )

      return
    }

    if (!hasChanges) {
      toast.info(
        "No assessment rule changes to save."
      )

      setEditing(false)

      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `/api/admin/quizzes/${assessmentId}/rules`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            required:
              requiredValue,

            counts_for_score:
              effectiveCountsForScore,

            max_attempts:
              parsedMaxAttempts,

            time_limit_minutes:
              parsedTimeLimit,

            questions_per_attempt:
              parsedQuestionsPerAttempt,

            randomize_questions:
              randomizeQuestionsValue,

            randomize_options:
              randomizeOptionsValue,
          }),
        }
      )

      const result =
        (await response.json()) as RulesResponse

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to update assessment rules."
        )
      }

      toast.success(
        "Assessment rules updated."
      )

      setEditing(false)

      /*
       * Refresh the Server Component
       * so Manage receives the new
       * quiz_assessments values.
       */
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update assessment rules."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/80">

      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

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
                rulesLocked
                  ? "border-yellow-400/20 bg-yellow-400/10"
                  : "border-sky-400/20 bg-sky-400/10"
              }
            `}
          >
            {rulesLocked ? (
              <LockKeyhole className="h-5 w-5 text-yellow-400" />
            ) : (
              <RotateCcw className="h-5 w-5 text-sky-400" />
            )}
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Assessment Rules
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Configure how member attempts are generated and scored.
            </p>
          </div>

        </div>

        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            disabled={rulesLocked}
            className={`
              inline-flex
              min-h-10
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              px-4
              text-sm
              font-semibold
              transition
              sm:w-auto

              ${
                rulesLocked
                  ? `
                    cursor-not-allowed
                    border-white/5
                    bg-white/[0.02]
                    text-gray-600
                  `
                  : `
                    border-white/10
                    bg-white/[0.04]
                    text-gray-200
                    hover:border-sky-400/30
                    hover:bg-white/[0.07]
                    hover:text-white
                  `
              }
            `}
          >
            {rulesLocked ? (
              <>
                <LockKeyhole className="h-4 w-4" />
                Rules Locked
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Edit Rules
              </>
            )}
          </button>
        )}

      </div>

      {!editing ? (
        <ReadOnlyRules
          required={required}
          countsForScore={
            countsForScore
          }
          maxAttempts={
            maxAttempts
          }
          timeLimitMinutes={
            timeLimitMinutes
          }
          questionsPerAttempt={
            questionsPerAttempt
          }
          randomizeQuestions={
            randomizeQuestions
          }
          randomizeOptions={
            randomizeOptions
          }
          contentLocked={
            contentLocked
          }
          status={status}
        />
      ) : (
        <div className="space-y-6 p-5 sm:p-6">

          {/* NUMERIC RULES */}
          <div className="grid gap-4 md:grid-cols-3">

            <NumberField
              id="assessment-max-attempts"
              label="Maximum Attempts"
              helper="Allowed range: 1–10"
              value={maxAttemptsValue}
              min={1}
              max={10}
              onChange={
                setMaxAttemptsValue
              }
              disabled={saving}
            />

            <NumberField
              id="assessment-time-limit"
              label="Time Limit"
              helper="Minutes: 1–240"
              value={timeLimitValue}
              min={1}
              max={240}
              onChange={
                setTimeLimitValue
              }
              disabled={saving}
            />

            <NumberField
              id="assessment-questions-per-attempt"
              label="Questions / Attempt"
              helper="Allowed range: 1–200"
              value={
                questionsPerAttemptValue
              }
              min={1}
              max={200}
              onChange={
                setQuestionsPerAttemptValue
              }
              disabled={saving}
            />

          </div>

          {/* ASSESSMENT BEHAVIOR */}
          <div className="space-y-3">

            <div>
              <p className="text-sm font-semibold text-white">
                Assessment Behavior
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Control requirement, scoring, and randomization.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">

              <RuleToggle
                title="Required Assessment"
                description="Members are expected to complete this assessment."
                checked={
                  requiredValue
                }
                onChange={
                  handleRequiredChange
                }
                disabled={saving}
                icon={
                  <Target className="h-4 w-4 text-emerald-400" />
                }
              />

              <RuleToggle
                title="Counts for Development Score"
                description={
                  requiredValue
                    ? "This assessment contributes to the member's Development score."
                    : "Optional assessments cannot contribute to Development scoring."
                }
                checked={
                  effectiveCountsForScore
                }
                onChange={
                  setCountsForScoreValue
                }
                disabled={
                  saving ||
                  !requiredValue
                }
                icon={
                  <CheckCircle2 className="h-4 w-4 text-yellow-400" />
                }
              />

              <RuleToggle
                title="Randomize Questions"
                description="Each attempt may receive questions in a different order."
                checked={
                  randomizeQuestionsValue
                }
                onChange={
                  setRandomizeQuestionsValue
                }
                disabled={saving}
                icon={
                  <Shuffle className="h-4 w-4 text-sky-400" />
                }
              />

              <RuleToggle
                title="Randomize Options"
                description="Answer choices may appear in a different order."
                checked={
                  randomizeOptionsValue
                }
                onChange={
                  setRandomizeOptionsValue
                }
                disabled={saving}
                icon={
                  <ListChecks className="h-4 w-4 text-violet-400" />
                }
              />

            </div>
          </div>

          {/* PREVIEW */}
          <div className="rounded-xl border border-sky-500/15 bg-sky-500/[0.06] px-4 py-4">

            <div className="flex items-start gap-3">

              <FileQuestion className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-300">
                  Attempt Preview
                </p>

                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                  Members will have{" "}
                  <strong className="text-white">
                    {parsedMaxAttempts || 0}
                  </strong>{" "}
                  attempt
                  {parsedMaxAttempts === 1
                    ? ""
                    : "s"}
                  , with{" "}
                  <strong className="text-white">
                    {parsedQuestionsPerAttempt ||
                      0}
                  </strong>{" "}
                  questions and{" "}
                  <strong className="text-white">
                    {parsedTimeLimit || 0}
                  </strong>{" "}
                  minutes per attempt.
                </p>
              </div>

            </div>

          </div>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-2 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">

            <button
              type="button"
              onClick={resetRules}
              disabled={
                saving ||
                !hasChanges
              }
              className="
                inline-flex
                min-h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-white/[0.025]
                px-4
                text-sm
                font-medium
                text-gray-400
                transition
                hover:bg-white/[0.06]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <div className="grid grid-cols-2 gap-2 sm:flex">

              <button
                type="button"
                onClick={
                  cancelEditing
                }
                disabled={saving}
                className="
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.025]
                  px-4
                  text-sm
                  font-medium
                  text-gray-300
                  transition
                  hover:bg-white/[0.06]
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="button"
                onClick={saveRules}
                disabled={
                  saving ||
                  !hasChanges
                }
                className="
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-emerald-500
                  px-4
                  text-sm
                  font-semibold
                  text-black
                  transition
                  hover:bg-emerald-400
                  disabled:cursor-not-allowed
                  disabled:bg-white/10
                  disabled:text-gray-600
                "
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}
    </section>
  )
}

function ReadOnlyRules({
  required,
  countsForScore,
  maxAttempts,
  timeLimitMinutes,
  questionsPerAttempt,
  randomizeQuestions,
  randomizeOptions,
  contentLocked,
  status,
}: Omit<
  AssessmentRulesEditorProps,
  "assessmentId"
>) {
  return (
    <div className="space-y-4 p-5 sm:p-6">

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

        <RuleValue
          label="Maximum Attempts"
          value={String(
            maxAttempts
          )}
        />

        <RuleValue
          label="Time Limit"
          value={`${timeLimitMinutes} min`}
        />

        <RuleValue
          label="Questions / Attempt"
          value={String(
            questionsPerAttempt
          )}
        />

        <RuleValue
          label="Required"
          value={
            required ? "Yes" : "No"
          }
        />

        <RuleValue
          label="Development Score"
          value={
            countsForScore
              ? "Included"
              : "Excluded"
          }
        />

        <RuleValue
          label="Question Order"
          value={
            randomizeQuestions
              ? "Randomized"
              : "Fixed"
          }
        />

        <RuleValue
          label="Option Order"
          value={
            randomizeOptions
              ? "Randomized"
              : "Fixed"
          }
        />

      </div>

      {contentLocked ? (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.07] px-4 py-3">

          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />

          <p className="text-sm leading-relaxed text-yellow-100/70">
            Assessment rules are locked because at least one member has started an attempt. Existing attempt configuration must remain consistent.
          </p>

        </div>
      ) : status ===
        "archived" ? (
        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">

          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />

          <p className="text-sm leading-relaxed text-gray-500">
            Archived assessments cannot be modified.
          </p>

        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">

          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

          <p className="text-sm leading-relaxed text-gray-400">
            These rules can still be modified because no member attempt has locked the assessment.
          </p>

        </div>
      )}

    </div>
  )
}

function RuleValue({
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

function NumberField({
  id,
  label,
  helper,
  value,
  min,
  max,
  onChange,
  disabled,
}: {
  id: string
  label: string
  helper: string
  value: string
  min: number
  max: number
  onChange: (
    value: string
  ) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-2">

      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500"
      >
        {label}
      </label>

      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        disabled={disabled}
        className="
          min-h-12
          w-full
          rounded-xl
          border
          border-white/10
          bg-black/25
          px-4
          text-sm
          text-white
          outline-none
          transition
          focus:border-sky-400/40
          focus:ring-2
          focus:ring-sky-400/10
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      />

      <p className="text-xs text-gray-600">
        {helper}
      </p>

    </div>
  )
}

function RuleToggle({
  title,
  description,
  checked,
  onChange,
  disabled,
  icon,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (
    checked: boolean
  ) => void
  disabled: boolean
  icon: React.ReactNode
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
        min-h-28
        items-start
        gap-3
        rounded-xl
        border
        p-4
        text-left
        transition
        disabled:cursor-not-allowed
        disabled:opacity-50

        ${
          checked
            ? "border-emerald-500/25 bg-emerald-500/[0.08]"
            : "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]"
        }
      `}
    >
      <span
        className={`
          mt-0.5
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          border

          ${
            checked
              ? "border-emerald-400 bg-emerald-500 text-black"
              : "border-white/10 bg-black/20"
          }
        `}
      >
        {checked ? (
          <Check className="h-4 w-4" />
        ) : (
          icon
        )}
      </span>

      <span className="min-w-0">

        <span className="block text-sm font-semibold text-white">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-gray-500">
          {description}
        </span>

      </span>
    </button>
  )
}