import { getQuizzes } from "@/src/lib/queries/get-quizzes"
import QuizList from "@/src/components/quizzes/QuizList"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"

export default async function QuizzesPage() {

  const quizzes = await getQuizzes()

  return (

    <div className="space-y-6">

      <PortalPageHeader
        title="Quizzes"
        subtitle="Test your knowledge of the Laws of the Game."
      />

      <div className="flex justify-end">

        <Link href="/portal/quizzes/history">
          <Button
            size="sm"
            className="bg-[#0B0F0F] border border-white/10 hover:border-yellow-400/40"
          >
            Quiz History
          </Button>
        </Link>

      </div>

      <QuizList quizzes={quizzes} />

    </div>
  )
}