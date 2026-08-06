import Link from "next/link"

import { requireUser } from "@/src/lib/auth/require-user"
import { getQuizzes } from "@/src/lib/queries/get-quizzes"


import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { Button } from "@/src/components/ui/button"
import QuizList from "@/src/components/quizzes/QuizList"

export default async function QuizzesPage() {
  const user = await requireUser()

  const quizzes = await getQuizzes(user.id)

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Quizzes"
        subtitle="Test your knowledge and track your development throughout the current cycle."
      />

      <div className="flex justify-end">
        <Link href="/portal/quizzes/history">
          <Button
            size="sm"
            variant="outline"
            className="
              border-white/10
              bg-[#0B0F0F]
              text-gray-200
              hover:border-yellow-400/40
              hover:bg-white/[0.04]
              hover:text-white
            "
          >
            Quiz History
          </Button>
        </Link>
      </div>

      <QuizList quizzes={quizzes} />
    </div>
  )
}