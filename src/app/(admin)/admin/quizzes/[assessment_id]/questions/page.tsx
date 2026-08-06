import Link from "next/link"
import {
  ArrowLeft,
  LockKeyhole,
} from "lucide-react"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getAdminQuizQuestionBank } from "@/src/lib/queries/get-admin-quiz-question-bank"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import QuestionBankBuilder from "@/src/components/admin/quizzes/QuestionBankBuilder"

export default async function QuizQuestionBankPage({
  params,
}: {
  params: Promise<{
    assessment_id: string
  }>
}) {
  await requireBoard()

  const { assessment_id } =
    await params

  const bank =
    await getAdminQuizQuestionBank(
      assessment_id
    )

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

  return (
    <div className="space-y-7 px-3 pb-10 sm:px-6">
      <div className="space-y-4">
        <Link
          href={`/admin/quizzes/${assessment_id}/edit`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Languages
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <PortalPageHeader
            title={bank.assessment.title}
            subtitle="Build and validate the bilingual question bank."
          />

          <span
            className={`
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              px-3
              py-1.5
              text-xs
              font-semibold
              uppercase
              tracking-wide
              ${
                bank.assessment.contentLocked
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                  : "border-gray-500/20 bg-gray-500/10 text-gray-300"
              }
            `}
          >
            {bank.assessment.contentLocked && (
              <LockKeyhole className="h-3.5 w-3.5" />
            )}

            {bank.assessment.contentLocked
              ? "Content locked"
              : bank.assessment.status}
          </span>
        </div>
      </div>

      <QuestionBankBuilder
        bank={bank}
      />
    </div>
  )
}