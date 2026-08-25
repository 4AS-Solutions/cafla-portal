import type { UserEvaluationScore } from "@/src/lib/queries/get-user-evaluation-score"

function Percentage({ value }: { value: number | null }) {
  return <span>{value === null ? "—" : `${value.toFixed(0)}%`}</span>
}

export function EvaluationStatsCard({ score }: { score: UserEvaluationScore | null }) {
  if (!score || score.evaluation_status === "insufficient_feedback") {
    return (
      <div className="space-y-3 text-sm">
        <p className="font-medium text-gray-300">Not enough data yet</p>
        <p className="text-xs leading-5 text-gray-500">Evaluation metrics will appear after eligible feedback is received.</p>
        {score && <p className="text-xs text-gray-500">Received: {score.evaluations_received}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between font-semibold"><span>Evaluation Score</span><Percentage value={score.evaluation_score} /></div>
      <div className="flex justify-between"><span>Quality</span><Percentage value={score.quality_percentage} /></div>
      <div className="flex justify-between"><span>Compliance</span><Percentage value={score.compliance_percentage} /></div>
      <div className="flex justify-between"><span>Received</span><span>{score.evaluations_received}</span></div>
      <div className="flex justify-between"><span>Completed On Time</span><span>{score.evaluations_completed_on_time}</span></div>
      <div className="flex justify-between"><span>Missed</span><span>{score.evaluations_missed}</span></div>
    </div>
  )
}
