type Props = {
  assessments_counted: number
  assessments_not_attempted: number
  quiz_score: number
}

export function QuizStatsCard({
  assessments_counted,
  assessments_not_attempted,
  quiz_score,
}: Props) {

  return (
    <div className="space-y-2 text-sm">

      <div className="flex justify-between">
        <span>Quiz Score</span>
        <span className="font-semibold text-white">{quiz_score.toFixed(0)}%</span>
      </div>

      <div className="flex justify-between">
        <span>Assessments Counted</span>
        <span className="font-semibold">{assessments_counted}</span>
      </div>

      <div className="flex justify-between">
        <span>Not Attempted</span>
        <span>{assessments_not_attempted}</span>
      </div>

    </div>
  )
}
