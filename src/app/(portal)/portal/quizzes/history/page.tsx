import { getQuizHistory } from "@/src/lib/queries/get-quiz-history"
import Link from "next/link"

export default async function QuizHistoryPage() {

  const attempts = await getQuizHistory()

  return (

    <div className="max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        Quiz History
      </h1>

      {attempts.length === 0 && (
        <p className="text-gray-500">
          No quizzes completed yet.
        </p>
      )}

      <div className="space-y-4">

        {attempts.map((attempt: any) => (

          <div
            key={attempt.id}
            className="border rounded-lg p-4 flex justify-between items-center"
          >

            <div>

              <p className="font-semibold">
                {attempt.quizzes.title}
              </p>

              <p className="text-sm text-gray-500">
                Score: {attempt.score}%
              </p>

            </div>

            <Link
              href={`/portal/quizzes/review/${attempt.id}`}
              className="text-blue-600 text-sm"
            >
              Review
            </Link>

          </div>

        ))}

      </div>

    </div>

  )
}