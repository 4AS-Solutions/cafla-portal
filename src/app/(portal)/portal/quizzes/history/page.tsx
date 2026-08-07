import {
  getQuizHistory,
} from "@/src/lib/queries/get-quiz-history"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import QuizHistoryCard from "@/src/components/quizzes/QuizHistoryCard"

import {
  BookOpenCheck,
  ClipboardCheck,
  History,
} from "lucide-react"
import Link from "next/link"

export default async function QuizHistoryPage() {
  const assessments =
    await getQuizHistory()

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Quiz History"
        subtitle="Review your assessments, scores, and previous attempts."
      />

      <div
        className="
          flex
          flex-col
          gap-2
          rounded-2xl
          border
          border-white/10
          bg-[#0B0F0F]/80
          p-2
          sm:w-fit
          sm:flex-row
        "
      >
        <Link
          href="/portal/quizzes"
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
            hover:border-yellow-400/30
            hover:bg-white/[0.06]
            hover:text-white
          "
        >
          <ClipboardCheck className="h-4 w-4" />
          Assessments
        </Link>

        <div
          className="
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-yellow-400
            px-4
            text-sm
            font-semibold
            text-black
          "
        >
          <History className="h-4 w-4" />
          Quiz History
        </div>
      </div>

      {assessments.length === 0 ? (
        <div
          className="
            flex min-h-[280px]
            flex-col items-center justify-center
            rounded-2xl
            border border-white/10
            bg-[#0B0F0F]/80
            px-6 py-12
            text-center
          "
        >
          <div
            className="
              mb-4 flex h-12 w-12
              items-center justify-center
              rounded-xl
              border border-yellow-500/20
              bg-yellow-500/10
            "
          >
            <BookOpenCheck className="h-5 w-5 text-yellow-400" />
          </div>

          <h2 className="font-semibold text-white">
            No assessment history yet
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
            Assessments will appear here after you begin
            your first attempt.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-yellow-400" />

            <p className="text-sm text-slate-400">
              {assessments.length}{" "}
              {assessments.length === 1
                ? "assessment"
                : "assessments"}{" "}
              in your history
            </p>
          </div>

          <div className="space-y-4">
            {assessments.map(
              (assessment) => (
                <QuizHistoryCard
                  key={
                    assessment.assessmentId
                  }
                  assessment={assessment}
                />
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}