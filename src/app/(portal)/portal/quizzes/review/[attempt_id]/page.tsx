import { getQuizReview } from "@/src/lib/queries/get-quiz-review"

export default async function QuizReviewPage({
  params
}: {
  params: Promise<{ attempt_id: string }>
}) {

  const { attempt_id } = await params

  const { attempt, answers, questions } =
    await getQuizReview(attempt_id)

  return (

    <div className="max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        {attempt.quizzes.title}
      </h1>

      <p className="text-lg">
        Score: {attempt.score}%
      </p>

      {questions.map((q: any, index: number) => {

        const userAnswer =
          answers.find((a: any) => a.question_id === q.id)?.selected_answer

        const correct = q.correct_answer

        return (

          <div
            key={q.id}
            className="border rounded-lg p-4 space-y-3"
          >

            <p className="font-medium">
              {index + 1}. {q.question_text}
            </p>

            <p>
              Your answer: <b>{userAnswer?.toUpperCase()}</b>
            </p>

            <p>
              Correct answer: <b>{correct.toUpperCase()}</b>
            </p>

            <p className="text-gray-600">
              Explanation: {q.explanation}
            </p>

          </div>

        )

      })}

    </div>

  )
}