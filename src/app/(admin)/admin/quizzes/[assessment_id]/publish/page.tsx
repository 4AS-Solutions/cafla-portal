import Link from "next/link"
import {
  ArrowLeft,
  XCircle,
} from "lucide-react"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getAdminQuizEditor } from "@/src/lib/queries/get-admin-quiz-editor"
import { getAdminQuizQuestionBank } from "@/src/lib/queries/get-admin-quiz-question-bank"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import PublishAssessmentReview from "@/src/components/admin/quizzes/PublishAssessmentReview"

export default async function PublishAssessmentPage({
  params,
}: {
  params: Promise<{
    assessment_id: string
  }>
}) {
  await requireBoard()

  const { assessment_id } =
    await params

  const [editor, bank] =
    await Promise.all([
      getAdminQuizEditor(
        assessment_id
      ),

      getAdminQuizQuestionBank(
        assessment_id
      ),
    ])

  if (!editor || !bank) {
    return (
      <div className="mx-auto max-w-xl px-3 py-10 sm:px-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <XCircle className="mx-auto h-8 w-8 text-red-400" />

          <p className="mt-3 font-semibold text-red-100">
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
          title="Review & Publish"
          subtitle="Review the complete assessment before making it available to members."
        />
      </div>

      <PublishAssessmentReview
        assessment={
          editor.assessment
        }
        versions={
          editor.versions
        }
        bank={bank}
      />
    </div>
  )
}