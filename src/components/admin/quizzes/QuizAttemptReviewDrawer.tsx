"use client"

import {
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react"
import {
  useEffect,
  useState,
} from "react"

import QuizAttemptReviewContent from "./QuizAttemptReviewContent"

import type {
  AdminQuizAttemptReview,
} from "@/src/lib/queries/get-admin-quiz-attempt-review"

type QuizAttemptReviewDrawerProps = {
  attemptId: string | null
  open: boolean
  onClose: () => void
}

type ReviewResponse = {
  success: boolean
  review?: AdminQuizAttemptReview
  error?: string
}

export default function QuizAttemptReviewDrawer({
  attemptId,
  open,
  onClose,
}: QuizAttemptReviewDrawerProps) {
  const [review, setReview] =
    useState<AdminQuizAttemptReview | null>(
      null
    )

  const [loading, setLoading] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  useEffect(() => {
    if (!open || !attemptId) {
      return
    }

    const controller =
      new AbortController()

    async function loadReview() {
      setLoading(true)
      setErrorMessage(null)
      setReview(null)

      try {
        const response = await fetch(
          `/api/admin/quizzes/attempts/${attemptId}/review`,
          {
            method: "GET",
            cache: "no-store",
            signal:
              controller.signal,
          }
        )

        const result =
          (await response.json()) as ReviewResponse

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Unable to load the attempt review."
          )
        }

        if (!result.review) {
          throw new Error(
            "The review response did not contain attempt data."
          )
        }

        setReview(result.review)
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the attempt review."
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadReview()

    return () => {
      controller.abort()
    }
  }, [attemptId, open])

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      "hidden"

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        "keydown",
        handleKeyDown
      )
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        justify-end
      "
      role="dialog"
      aria-modal="true"
      aria-label="Quiz attempt review"
    >
      {/* OVERLAY */}
      <button
        type="button"
        aria-label="Close attempt review"
        onClick={onClose}
        className="
          absolute
          inset-0
          bg-black/70
          backdrop-blur-sm
        "
      />

      {/* DRAWER */}
      <aside
        className="
          relative
          z-10
          flex
          h-full
          w-full
          flex-col
          border-l
          border-white/10
          bg-[#07100E]
          shadow-2xl
          sm:max-w-2xl
          xl:max-w-3xl
        "
      >
        {/* HEADER */}
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-emerald-950/50 to-[#07100E] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300/70">
              Assessment Results
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Attempt Review
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review the member&apos;s original questions, answers, and explanations.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              text-gray-400
              transition
              hover:bg-white/[0.08]
              hover:text-white
            "
            aria-label="Close attempt review"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-3 py-4 sm:px-5 sm:py-5">
            {loading ? (
              <LoadingState />
            ) : errorMessage ? (
              <ErrorState
                message={errorMessage}
              />
            ) : review ? (
              <QuizAttemptReviewContent
                review={review}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-emerald-400" />

        <p className="mt-3 text-sm font-medium text-white">
          Loading attempt review...
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Retrieving the original question snapshot and answers.
        </p>
      </div>
    </div>
  )
}

function ErrorState({
  message,
}: {
  message: string
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />

        <p className="mt-3 font-semibold text-red-100">
          Unable to load review
        </p>

        <p className="mt-2 text-sm leading-relaxed text-red-100/70">
          {message}
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <p className="font-medium text-white">
          No attempt selected
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Select a completed attempt to review it.
        </p>
      </div>
    </div>
  )
}