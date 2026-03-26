import { getQuizHistory } from "@/src/lib/queries/get-quiz-history"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import QuizHistoryCard from "@/src/components/quizzes/QuizHistoryCard"

export default async function QuizHistoryPage() {

  const attempts = await getQuizHistory();


  return (

    <div className="space-y-6">

      <PortalPageHeader
        title="Quiz History"
        subtitle="Review your completed quizzes."
      />

      {attempts.length === 0 && (
        <p className="text-muted-foreground">
          No quizzes completed yet.
        </p>
      )}

      <div className="space-y-4">

        {attempts.map((attempt: any) => (

          <QuizHistoryCard
            key={attempt.id}
            attempt={attempt}
          />

        ))}

      </div>

    </div>

  )
}