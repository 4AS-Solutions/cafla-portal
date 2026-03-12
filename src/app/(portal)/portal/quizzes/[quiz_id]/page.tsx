import { getQuizDetails } from "@/src/lib/queries/get-quiz-details"
import QuizRunner from "@/src/components/quizzes/QuizRunner"

export default async function QuizPage({
  params
}: {
  params: Promise<{ quiz_id: string }>
}) {

  const { quiz_id } = await params

  const { quiz, questions, attempt } =
    await getQuizDetails(quiz_id)

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto">
        <p>Quiz not found.</p>
      </div>
    )
  }

  if (attempt) {
    return (

      <div className="max-w-4xl mx-auto space-y-4">

        <h1 className="text-2xl font-bold">
          {quiz.title}
        </h1>

        <div className="border rounded-lg p-6">

          <p className="text-lg font-medium">
            Quiz already completed
          </p>

          <p className="text-gray-500">
            Your score: {attempt.score}%
          </p>

        </div>

      </div>
    )
  }

  return (

    <div className="max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        {quiz.title}
      </h1>

      <QuizRunner
        quiz={quiz}
        questions={questions}
      />

    </div>

  )
}