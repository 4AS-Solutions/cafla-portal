import type { MemberQuiz } from "@/src/lib/queries/get-quizzes"

import QuizCard from "./QuizCard"

type QuizListProps = {
  quizzes: MemberQuiz[]
}

export default function QuizList({
  quizzes,
}: QuizListProps) {
  if (quizzes.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 px-5 py-12 text-center">
        <p className="font-medium text-white">
          No quizzes available
        </p>

        <p className="mt-1 text-sm text-gray-500">
          New assessments for your development cycle will appear here.
        </p>
      </div>
    )
  }

  const activeQuizzes = quizzes.filter(
    (quiz) =>
      quiz.status === "available" ||
      quiz.status === "upcoming"
  )

  const closedQuizzes = quizzes.filter(
    (quiz) =>
      quiz.status === "closed" ||
      quiz.status === "archived"
  )

  return (
    <div className="space-y-8">
      {activeQuizzes.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Current Assessments
            </h2>

            <p className="text-sm text-gray-500">
              Available and upcoming quizzes for your current cycle.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {activeQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
              />
            ))}
          </div>
        </section>
      )}

      {closedQuizzes.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Previous Assessments
            </h2>

            <p className="text-sm text-gray-500">
              Completed or closed quizzes from this development cycle.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {closedQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}