import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getAdminQuizQuestionBank } from "@/src/lib/queries/get-admin-quiz-question-bank"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import QuestionGroupEditor from "@/src/components/admin/quizzes/QuestionGroupEditor"


export default async function NewQuestionGroupPage({
  params,
}: {
  params: Promise<{
    assessment_id: string
  }>
}) {
  await requireBoard()

  const { assessment_id } = await params

  const bank =
    await getAdminQuizQuestionBank(assessment_id)

  if (!bank) {
    return (
      <div className="mx-auto max-w-xl px-3 py-10 sm:px-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="font-semibold text-red-100">
            Assessment not found
          </p>

          <Link
            href="/admin/quizzes"
            className="mt-5 inline-flex rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black"
          >
            Back to Quiz Management
          </Link>
        </div>
      </div>
    )
  }

  if (bank.versions.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-3 py-10 sm:px-6">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
          <p className="font-semibold text-amber-100">
            Configure languages first
          </p>

          <p className="mt-2 text-sm text-amber-100/70">
            At least one language version is required before creating questions.
          </p>

          <Link
            href={`/admin/quizzes/${assessment_id}/edit`}
            className="mt-5 inline-flex rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black"
          >
            Configure Languages
          </Link>
        </div>
      </div>
    )
  }

  if (bank.assessment.contentLocked) {
    return (
      <div className="mx-auto max-w-xl px-3 py-10 sm:px-6">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
          <p className="font-semibold text-amber-100">
            Question bank locked
          </p>

          <p className="mt-2 text-sm text-amber-100/70">
            New questions cannot be added after a member begins the assessment.
          </p>

          <Link
            href={`/admin/quizzes/${assessment_id}/questions`}
            className="mt-5 inline-flex rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black"
          >
            Back to Question Bank
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7 px-3 pb-10 sm:px-6">
      <div className="space-y-4">
        <Link
          href={`/admin/quizzes/${assessment_id}/questions`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Question Bank
        </Link>

        <PortalPageHeader
          title="Create Question Group"
          subtitle="Create the equivalent question and answers for every enabled language."
        />
      </div>

      <QuestionGroupEditor
        assessmentId={assessment_id}
        assessmentTitle={bank.assessment.title}
        versions={bank.versions}
      />
    </div>
  )
}