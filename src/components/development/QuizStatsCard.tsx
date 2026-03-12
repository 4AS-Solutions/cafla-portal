type Props = {
  quizzes_taken: number
  avg_quiz_score: string
  max_score?: string
  min_score?: string
}

export function QuizStatsCard({
  quizzes_taken,
  avg_quiz_score,
  max_score,
  min_score
}: Props) {

  return (
    <div className="space-y-2 text-sm">

      <div className="flex justify-between">
        <span>Quizzes Taken</span>
        <span className="font-semibold">{quizzes_taken}</span>
      </div>

      <div className="flex justify-between">
        <span>Average Score</span>
        <span className="font-semibold">{avg_quiz_score}</span>
      </div>

      <div className="flex justify-between">
        <span>Max Score</span>
        <span>{max_score ?? "-"}</span>
      </div>

      <div className="flex justify-between">
        <span>Min Score</span>
        <span>{min_score ?? "-"}</span>
      </div>

    </div>
  )
}