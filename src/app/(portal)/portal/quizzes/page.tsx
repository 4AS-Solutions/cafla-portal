import Link from "next/link"

import { requireUser } from "@/src/lib/auth/require-user"
import { getQuizzes } from "@/src/lib/queries/get-quizzes"


import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { Button } from "@/src/components/ui/button"
import QuizList from "@/src/components/quizzes/QuizList"
import { ClipboardCheck, History } from "lucide-react"

export default async function QuizzesPage() {
  const user = await requireUser()

  const quizzes = await getQuizzes(user.id)

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Quizzes"
        subtitle="Test your knowledge and track your development throughout the current cycle."
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
    <ClipboardCheck className="h-4 w-4" />
    Assessments
  </div>

  <Link
    href="/portal/quizzes/history"
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
    <History className="h-4 w-4" />
    Quiz History
  </Link>
</div>

      <QuizList quizzes={quizzes} />
    </div>
  )
}