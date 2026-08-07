import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  XCircle,
} from "lucide-react"

import { requireUser } from "@/src/lib/auth/require-user"
import { getQuizAssessmentHistory } from "@/src/lib/queries/get-quiz-assessment-history"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import QuizAssessmentHistory from "@/src/components/quizzes/QuizAssessmentHistory"

export default async function QuizAssessmentHistoryPage({
  params,
}: {
  params: Promise<{
    assessment_id: string
  }>
}) {
  await requireUser()

  const { assessment_id } =
    await params

  let history

  try {
    history =
      await getQuizAssessmentHistory(
        assessment_id
      )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load attempt history."

    return (
      <div className="mx-auto max-w-xl px-3 py-10 sm:px-0">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-400" />

          <p className="mt-3 font-semibold text-amber-100">
            History unavailable
          </p>

          <p className="mt-2 text-sm leading-relaxed text-amber-100/70">
            {message}
          </p>

          <Link
            href="/portal/quizzes/history"
            className="mt-5 inline-flex rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black"
          >
            Back to Quiz History
          </Link>
        </div>
      </div>
    )
  }

  if (!history) {
    return (
      <div className="mx-auto max-w-xl px-3 py-10 sm:px-0">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-6 text-center">
          <XCircle className="mx-auto h-8 w-8 text-red-400" />

          <p className="mt-3 font-semibold text-red-100">
            Assessment history not found
          </p>

          <p className="mt-2 text-sm text-red-100/70">
            This assessment does not exist or you have not started it.
          </p>

          <Link
            href="/portal/quizzes/history"
            className="mt-5 inline-flex rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black"
          >
            Back to Quiz History
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-1 pb-10 sm:px-0">
      <Link
        href="/portal/quizzes/history"
        className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Quiz History
      </Link>

      <PortalPageHeader
        title={history.assessment.title}
        subtitle="Review your scores and attempts for this assessment."
      />

      <QuizAssessmentHistory
        history={history}
      />
    </div>
  )
}