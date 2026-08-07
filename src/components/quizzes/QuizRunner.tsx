"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Save,
  Send,
} from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"

type QuizAttemptStatus =
  | "in_progress"
  | "submitted"
  | "expired"
  | "voided"

type QuizLanguage = "es" | "en"

type QuizRunnerProps = {
  attempt: {
    id: string
    assessmentId: string
    attemptNumber: number
    status: QuizAttemptStatus
    startedAt: string
    expiresAt: string
  }

  assessment: {
    id: string
    title: string
    timeLimitMinutes: number
    maxAttempts: number
  }

  version: {
    id: string
    language: QuizLanguage
    title: string
    instructions: string | null
  }

  questions: {
    attemptQuestionId: string
    position: number
    questionText: string
    selectedOptionId: string | null

    options: {
      id: string
      text: string
    }[]
  }[]
}

type SubmissionResult = {
  id: string
  status: "submitted" | "expired"
  score: number
  correctCount: number
  totalQuestions: number
}

export default function QuizRunner({
  attempt,
  assessment,
  version,
  questions,
}: QuizRunnerProps) {
  const router = useRouter()

  const [currentIndex, setCurrentIndex] =
    useState(0)

  const [answers, setAnswers] = useState<
    Record<string, string | null>
  >(() =>
    Object.fromEntries(
      questions.map((question) => [
        question.attemptQuestionId,
        question.selectedOptionId,
      ])
    )
  )

  const [savingQuestionId, setSavingQuestionId] =
    useState<string | null>(null)

  const [saveErrorQuestionId, setSaveErrorQuestionId] =
    useState<string | null>(null)

  const [submitDialogOpen, setSubmitDialogOpen] =
    useState(false)

  const [submitting, setSubmitting] =
    useState(false)

  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null)

  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  const autoSubmittedRef = useRef(false)

  const totalQuestions = questions.length
  const currentQuestion =
    questions[currentIndex]

  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter(
        Boolean
      ).length,
    [answers]
  )

  const unansweredCount =
    totalQuestions - answeredCount

  const progress =
    totalQuestions === 0
      ? 0
      : Math.round(
          ((currentIndex + 1) /
            totalQuestions) *
            100
        )

  /*
   * El tiempo siempre se recalcula desde expiresAt.
   * Recargar la página no reinicia el intento.
   */
  useEffect(() => {
    if (
      attempt.status !== "in_progress" ||
      submissionResult
    ) {
      return
    }

    function updateTimer() {
      const remaining =
        calculateTimeLeft(attempt.expiresAt)

      setTimeLeft(remaining)

      if (
        remaining <= 0 &&
        !autoSubmittedRef.current
      ) {
        autoSubmittedRef.current = true
        void submitQuiz(true)
      }
    }

    updateTimer()

    const interval = window.setInterval(
      updateTimer,
      1000
    )

    return () => {
      window.clearInterval(interval)
    }
  }, [
    attempt.expiresAt,
    attempt.status,
    submissionResult,
  ])

  async function saveAnswer(
    attemptQuestionId: string,
    selectedOptionId: string
  ) {
    if (
      submitting ||
      timeLeft !== null && timeLeft <= 0
    ) {
      return
    }

    const previousAnswer =
      answers[attemptQuestionId] ??
      null

    setAnswers((current) => ({
      ...current,
      [attemptQuestionId]:
        selectedOptionId,
    }))

    setSavingQuestionId(
      attemptQuestionId
    )
    setSaveErrorQuestionId(null)

    try {
      const response = await fetch(
        `/api/quizzes/attempts/${attempt.id}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            attempt_question_id:
              attemptQuestionId,
            selected_option_id:
              selectedOptionId,
          }),
        }
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to save your answer."
        )
      }
    } catch (error) {
      setAnswers((current) => ({
        ...current,
        [attemptQuestionId]:
          previousAnswer,
      }))

      setSaveErrorQuestionId(
        attemptQuestionId
      )

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save your answer."
      )
    } finally {
      setSavingQuestionId(
        (current) =>
          current ===
          attemptQuestionId
            ? null
            : current
      )
    }
  }

  async function submitQuiz(
    automatic = false
  ) {
    if (submitting) return

    setSubmitting(true)
    setSubmitDialogOpen(false)

    try {
      const response = await fetch(
        `/api/quizzes/attempts/${attempt.id}/submit`,
        {
          method: "POST",
        }
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to submit the quiz."
        )
      }

      const finalResult =
        result.attempt as SubmissionResult

      setSubmissionResult(
        finalResult
      )

      if (
        finalResult.status ===
          "expired" ||
        automatic
      ) {
        toast.info(
          "Time expired. Your saved answers were submitted."
        )
      } else {
        toast.success(
          "Quiz submitted successfully."
        )
      }

      router.refresh()
    } catch (error) {
      /*
       * Permite reintentar el auto-submit si
       * hubo un fallo temporal de red.
       */
      if (automatic) {
        autoSubmittedRef.current =
          false
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit the quiz."
      )
    } finally {
      setSubmitting(false)
    }
  }

  function goToPrevious() {
    setCurrentIndex((current) =>
      Math.max(current - 1, 0)
    )
  }

  function goToNext() {
    setCurrentIndex((current) =>
      Math.min(
        current + 1,
        totalQuestions - 1
      )
    )
  }

  /*
   * Resultado final en la misma pantalla.
   * Más adelante conectaremos Review Results.
   */
  if (submissionResult) {
    return (
      <div className="mx-auto w-full max-w-4xl px-3 pb-8 sm:px-0">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]">
          <div className="border-b border-white/10 bg-gradient-to-r from-emerald-950/60 to-[#0B0F0F] px-5 py-6 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>

              <div>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">
                  Quiz completed
                </h1>

                <p className="mt-1 text-sm text-gray-400">
                  {version.title}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-7">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-6 text-center">
              <p className="text-xs uppercase tracking-[0.14em] text-emerald-300/70">
                Your score
              </p>

              <p className="mt-2 text-5xl font-bold text-white">
                {formatScore(
                  submissionResult.score
                )}
                %
              </p>

              <p className="mt-2 text-sm text-emerald-100/70">
                {
                  submissionResult.correctCount
                }{" "}
                of{" "}
                {
                  submissionResult.totalQuestions
                }{" "}
                correct
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ResultItem
                label="Attempt"
                value={`${attempt.attemptNumber} of ${assessment.maxAttempts}`}
              />

              <ResultItem
                label="Status"
                value={
                  submissionResult.status ===
                  "expired"
                    ? "Time expired"
                    : "Submitted"
                }
              />
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/portal/quizzes"
                )
              }
              className="
                w-full
                rounded-xl
                bg-yellow-400
                px-5
                py-3
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-yellow-300
              "
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (
    attempt.status !== "in_progress"
  ) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#0B0F0F] px-5 py-8 text-center">
        <p className="font-semibold text-white">
          This attempt is no longer active.
        </p>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/portal/quizzes"
            )
          }
          className="mt-5 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black"
        >
          Back to Quizzes
        </button>
      </div>
    )
  }

  if (
    totalQuestions === 0 ||
    !currentQuestion
  ) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-8 text-center text-red-200">
        This attempt does not contain any questions.
      </div>
    )
  }

  const selectedOptionId =
    answers[
      currentQuestion
        .attemptQuestionId
    ] ?? null

  const currentIsSaving =
    savingQuestionId ===
    currentQuestion.attemptQuestionId

  const currentSaveFailed =
    saveErrorQuestionId ===
    currentQuestion.attemptQuestionId

  return (
    <>
      <main className="mx-auto w-full max-w-4xl space-y-5 px-3 pb-10 sm:px-0">
        {/* HEADER */}
        <header className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.14em] text-yellow-300/70">
                Attempt{" "}
                {attempt.attemptNumber} of{" "}
                {assessment.maxAttempts}
              </p>

              <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                {version.title}
              </h1>

              {version.instructions && (
                <p className="mt-1 text-sm text-gray-400">
                  {version.instructions}
                </p>
              )}
            </div>

            {timeLeft !== null ? (
              <TimerDisplay timeLeft={timeLeft} />
            ) : (
              <div className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#0B0F0F] px-4 py-3 sm:w-auto sm:min-w-40">
                <span className="text-xs text-gray-400">
                  Time left
                </span>

                <span className="font-mono text-lg font-bold text-gray-500">
                  --:--
                </span>
              </div>
            )}
          </div>
        </header>

        {/* PROGRESS */}
        <section className="rounded-xl border border-white/10 bg-[#0B0F0F]/80 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-gray-400">
              Question{" "}
              {currentIndex + 1} of{" "}
              {totalQuestions}
            </span>

            <span className="font-medium text-yellow-300">
              {progress}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-yellow-400 transition-[width] duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>
              {answeredCount} answered
            </span>

            <span>
              {unansweredCount} unanswered
            </span>
          </div>
        </section>

        {/* QUESTION */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/90">
          <div className="border-b border-white/10 px-4 py-5 sm:px-6">
            <p className="text-lg font-semibold leading-relaxed text-white">
              {
                currentQuestion.questionText
              }
            </p>
          </div>

          <div className="space-y-3 p-4 sm:p-6">
            {currentQuestion.options.map(
              (option, optionIndex) => {
                const selected =
                  selectedOptionId ===
                  option.id

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={
                      submitting ||
                      currentIsSaving ||
                      timeLeft !== null && timeLeft <= 0
                    }
                    onClick={() =>
                      saveAnswer(
                        currentQuestion.attemptQuestionId,
                        option.id
                      )
                    }
                    className={`
                      flex
                      min-h-14
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      border
                      px-4
                      py-3
                      text-left
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      ${
                        selected
                          ? "border-yellow-400 bg-yellow-400/10 text-white"
                          : "border-white/10 bg-white/[0.025] text-gray-200 hover:border-white/25 hover:bg-white/[0.045]"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        text-sm
                        font-semibold
                        ${
                          selected
                            ? "border-yellow-400 bg-yellow-400 text-black"
                            : "border-white/10 bg-black/20 text-gray-400"
                        }
                      `}
                    >
                      {selected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        getOptionLabel(
                          optionIndex
                        )
                      )}
                    </span>

                    <span className="text-sm leading-relaxed sm:text-base">
                      {option.text}
                    </span>
                  </button>
                )
              }
            )}

            <div className="min-h-5 pt-1">
              {currentIsSaving && (
                <p className="flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving answer...
                </p>
              )}

              {!currentIsSaving &&
                selectedOptionId &&
                !currentSaveFailed && (
                  <p className="flex items-center gap-2 text-xs text-emerald-400">
                    <Save className="h-3.5 w-3.5" />
                    Answer saved
                  </p>
                )}

              {currentSaveFailed && (
                <p className="flex items-center gap-2 text-xs text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Answer was not saved. Please select it again.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* MOBILE QUESTION NAVIGATION */}
        <section className="rounded-xl border border-white/10 bg-[#0B0F0F]/80 p-3 sm:p-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {questions.map(
              (question, index) => {
                const answered = Boolean(
                  answers[
                    question
                      .attemptQuestionId
                  ]
                )

                const active =
                  index === currentIndex

                return (
                  <button
                    key={
                      question.attemptQuestionId
                    }
                    type="button"
                    onClick={() =>
                      setCurrentIndex(index)
                    }
                    className={`
                      flex
                      h-9
                      min-w-9
                      items-center
                      justify-center
                      rounded-lg
                      border
                      text-xs
                      font-semibold
                      transition
                      ${
                        active
                          ? "border-yellow-400 bg-yellow-400 text-black"
                          : answered
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 bg-white/[0.025] text-gray-500"
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                )
              }
            )}
          </div>
        </section>

        {/* ACTIONS */}
        <footer className="sticky bottom-3 z-10 rounded-2xl border border-white/10 bg-[#07100E]/95 p-3 shadow-2xl backdrop-blur-xl sm:static sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={
                currentIndex === 0 ||
                submitting
              }
              onClick={goToPrevious}
              className="
                inline-flex
                min-h-11
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
                text-gray-300
                transition
                hover:bg-white/[0.07]
                disabled:cursor-not-allowed
                disabled:opacity-40
                sm:px-5
              "
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                Previous
              </span>
            </button>

            {currentIndex <
            totalQuestions - 1 ? (
              <button
                type="button"
                disabled={submitting}
                onClick={goToNext}
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-yellow-400
                  px-5
                  text-sm
                  font-semibold
                  text-black
                  transition
                  hover:bg-yellow-300
                  disabled:opacity-60
                "
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  submitting ||
                  savingQuestionId !== null
                }
                onClick={() =>
                  setSubmitDialogOpen(true)
                }
                className="
                  inline-flex
                  min-h-11
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
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <Send className="h-4 w-4" />
                Submit Quiz
              </button>
            )}
          </div>
        </footer>
      </main>

      {/* SUBMIT CONFIRMATION */}
      <Dialog
        open={submitDialogOpen}
        onOpenChange={(nextOpen) => {
          if (!submitting) {
            setSubmitDialogOpen(
              nextOpen
            )
          }
        }}
      >
        <DialogContent
          className="
            w-[94vw]
            max-w-md
            rounded-2xl
            border
            border-white/10
            bg-[#07100E]
            p-0
            text-white
            shadow-2xl
          "
        >
          <DialogHeader className="border-b border-white/10 px-5 py-5 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>

              <div>
                <DialogTitle className="text-lg text-white">
                  Submit Quiz
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm text-gray-400">
                  Review your progress before submitting this attempt.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5">
            <div className="grid grid-cols-2 gap-3">
              <ReviewItem
                label="Answered"
                value={answeredCount}
              />

              <ReviewItem
                label="Unanswered"
                value={unansweredCount}
                warning={
                  unansweredCount > 0
                }
              />
            </div>

            {unansweredCount > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                <p className="font-semibold">
                  {unansweredCount}{" "}
                  {unansweredCount === 1
                    ? "question is"
                    : "questions are"}{" "}
                  unanswered.
                </p>

                <p className="mt-1 text-amber-100/70">
                  Unanswered questions will be scored as incorrect.
                </p>
              </div>
            )}

            <p className="text-sm leading-relaxed text-gray-400">
              Once submitted, this attempt cannot be changed.
            </p>
          </div>

          <DialogFooter className="flex-row gap-3 border-t border-white/10 px-5 py-4">
            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                setSubmitDialogOpen(false)
              }
              className="
                flex-1
                rounded-xl
                border
                border-white/10
                bg-white/[0.03]
                px-4
                py-2.5
                text-sm
                font-medium
                text-gray-300
                transition
                hover:bg-white/[0.07]
                disabled:opacity-60
              "
            >
              Keep Reviewing
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                void submitQuiz(false)
              }
              className="
                inline-flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-500
                px-4
                py-2.5
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-emerald-400
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              {submitting
                ? "Submitting..."
                : "Submit"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function TimerDisplay({
  timeLeft,
}: {
  timeLeft: number
}) {
  const urgent = timeLeft <= 60
  const warning =
    timeLeft <= 300 && !urgent

  return (
    <div
      className={`
        flex
        w-full
        items-center
        justify-between
        gap-3
        rounded-xl
        border
        px-4
        py-3
        sm:w-auto
        sm:min-w-40
        ${
          urgent
            ? "border-red-500/30 bg-red-500/10 text-red-300"
            : warning
              ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
              : "border-white/10 bg-[#0B0F0F] text-gray-200"
        }
      `}
    >
      <div className="flex items-center gap-2">
        <Clock3 className="h-4 w-4" />

        <span className="text-xs text-gray-400">
          Time left
        </span>
      </div>

      <span className="font-mono text-lg font-bold">
        {formatTime(timeLeft)}
      </span>
    </div>
  )
}

function ReviewItem({
  label,
  value,
  warning = false,
}: {
  label: string
  value: number
  warning?: boolean
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        px-4
        py-3
        ${
          warning
            ? "border-amber-500/20 bg-amber-500/10"
            : "border-white/10 bg-white/[0.025]"
        }
      `}
    >
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p
        className={`
          mt-1
          text-2xl
          font-bold
          ${
            warning
              ? "text-amber-300"
              : "text-white"
          }
        `}
      >
        {value}
      </p>
    </div>
  )
}

function ResultItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-white">
        {value}
      </p>
    </div>
  )
}

function calculateTimeLeft(
  expiresAt: string
) {
  return Math.max(
    0,
    Math.ceil(
      (new Date(
        expiresAt
      ).getTime() -
        Date.now()) /
        1000
    )
  )
}

function formatTime(
  totalSeconds: number
) {
  const minutes = Math.floor(
    totalSeconds / 60
  )

  const seconds =
    totalSeconds % 60

  return `${minutes}:${String(
    seconds
  ).padStart(2, "0")}`
}

function formatScore(score: number) {
  return Number.isInteger(score)
    ? String(score)
    : score.toFixed(2)
}

function getOptionLabel(index: number) {
  return String.fromCharCode(65 + index)
}