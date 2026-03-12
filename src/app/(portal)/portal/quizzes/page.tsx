import { getQuizzes } from "@/src/lib/queries/get-quizzes"
import QuizList from "@/src/components/quizzes/QuizList"
import Link from "next/link"

export default async function QuizzesPage() {

  const quizzes = await getQuizzes()

  return (

    <div className="max-w-5xl mx-auto space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          Quizzes
        </h1>

        <Link
          href="/portal/quizzes/history"
          className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
        >
          Quiz History
        </Link>

      </div>

      <QuizList quizzes={quizzes} />

    </div>
  )
}