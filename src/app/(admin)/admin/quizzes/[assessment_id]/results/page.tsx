import Link from "next/link"
import {
  ArrowLeft,
  BookOpenCheck,
  Settings2,
  XCircle,
} from "lucide-react"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getAdminQuizResults } from "@/src/lib/queries/get-admin-quiz-results"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import AssessmentResultsDashboard from "@/src/components/admin/quizzes/AssessmentResultsDashboard"

export default async function AssessmentResultsPage({
  params,
}: {
  params: Promise<{
    assessment_id: string
  }>
}) {
  await requireBoard()

  const { assessment_id } =
    await params

  const results =
    await getAdminQuizResults(
      assessment_id
    )

  if (!results) {
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
          href={`/admin/quizzes/${assessment_id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assessment Overview
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <PortalPageHeader
            title={`${results.assessment.title} Results`}
            subtitle="Monitor member progress, attempts, and assessment performance."
          />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              href={`/admin/quizzes/${assessment_id}/questions`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-gray-200 transition hover:bg-white/[0.08]"
            >
              <BookOpenCheck className="h-4 w-4" />
              Questions
            </Link>

            <Link
              href={`/admin/quizzes/${assessment_id}/manage`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-semibold text-black transition hover:bg-yellow-300"
            >
              <Settings2 className="h-4 w-4" />
              Manage
            </Link>
          </div>
        </div>
      </div>

      <AssessmentResultsDashboard
        results={results}
      />
    </div>
  )
}