"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

type QuizLanguage = "es" | "en"

type QuizAttemptLauncherProps = {
  assessmentId: string
  language: QuizLanguage
}

export default function QuizAttemptLauncher({
  assessmentId,
  language,
}: QuizAttemptLauncherProps) {
  const router = useRouter()

  const startedRef = useRef(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  useEffect(() => {
    if (startedRef.current) return

    startedRef.current = true

    async function startAttempt() {
      try {
        const response = await fetch(
          `/api/quizzes/${assessmentId}/start`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              language,
            }),
          }
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Unable to start the quiz."
          )
        }

        const attemptId =
          result?.attempt?.id

        if (!attemptId) {
          throw new Error(
            "The quiz attempt could not be created."
          )
        }

        router.replace(
          `/portal/quizzes/${assessmentId}?attempt=${attemptId}`
        )

        router.refresh()
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to start the quiz."
        )
      }
    }

    void startAttempt()
  }, [assessmentId, language, router])

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-5 text-center">
        <p className="font-semibold text-red-200">
          Unable to start quiz
        </p>

        <p className="mt-2 text-sm text-red-200/70">
          {errorMessage}
        </p>

        <button
          type="button"
          onClick={() =>
            router.push("/portal/quizzes")
          }
          className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
        >
          Back to Quizzes
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[45vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10">
          <Loader2 className="h-5 w-5 animate-spin text-yellow-300" />
        </div>

        <p className="mt-4 font-medium text-white">
          Preparing your quiz
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Your questions and timer are being prepared.
        </p>
      </div>
    </div>
  )
}