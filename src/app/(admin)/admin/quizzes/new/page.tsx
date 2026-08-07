import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { requireBoard } from "@/src/lib/auth/require-board"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import CreateAssessmentForm from "@/src/components/admin/quizzes/CreateAssessmentForm"

export default async function NewQuizAssessmentPage() {
  await requireBoard()

  return (
    <div className="space-y-7 px-3 pb-10 sm:px-6">
      <div className="space-y-4">
        <Link
          href="/admin/quizzes"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-gray-400
            transition
            hover:text-white
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quiz Management
        </Link>

        <PortalPageHeader
          title="Create Assessment"
          subtitle="Configure the assessment before adding languages and questions."
        />
      </div>

      <CreateAssessmentForm />
    </div>
  )
}