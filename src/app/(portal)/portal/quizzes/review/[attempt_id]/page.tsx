import { getQuizReview } from "@/src/lib/queries/get-quiz-review"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { CheckCircle, XCircle } from "lucide-react"

export default async function QuizReviewPage({
  params
}: {
  params: Promise<{ attempt_id: string }>
}) {

  const { attempt_id } = await params

  const { attempt, answers, questions } =
    await getQuizReview(attempt_id)

  return (

    <div className="space-y-6">

      <PortalPageHeader
        title={attempt.quizzes.title}
        subtitle="Review your answers and learn from the correct ones."
      />

      <div className="rounded-xl border border-white/10 p-6 bg-[#0B0F0F]/80 backdrop-blur-md">

        <p className="text-lg font-semibold">
          Score: {attempt.score}%
        </p>

      </div>

      <div className="space-y-4">

        {questions.map((q: any, index: number) => {

          const userAnswer =
            answers.find((a: any) => a.question_id === q.id)?.selected_answer

          const correct = q.correct_answer

          const isCorrect = userAnswer === correct

          return (

            <div
              key={q.id}
              className="rounded-xl border border-white/10 p-5 bg-[#0B0F0F]/80 backdrop-blur-md space-y-3"
            >

              <div className="flex items-center gap-2 text-white font-medium">

                {isCorrect
                  ? <CheckCircle size={16} className="text-green-400"/>
                  : <XCircle size={16} className="text-red-400"/>
                }

                {index + 1}. {q.question_text}

              </div>

              <p className="text-sm text-gray-300">

                Your answer:{" "}
                <b>{userAnswer?.toUpperCase() ?? "No answer"}</b>

              </p>

              <p className="text-sm text-gray-300">

                Correct answer:{" "}
                <b>{correct.toUpperCase()}</b>

              </p>

              {q.explanation && (

                <p className="text-sm text-gray-400">

                  {q.explanation}

                </p>

              )}

            </div>

          )

        })}

      </div>

    </div>

  )
}