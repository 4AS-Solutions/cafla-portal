import { getEvidenceStatusLabel } from "@/src/lib/development/evidence-status"
import type { CurrentDevelopmentRanking } from "@/src/lib/queries/get-development-ranking-v2"

type Props = Pick<
  CurrentDevelopmentRanking,
  | "development_score"
  | "evidence_percentage"
  | "evidence_status"
  | "ranking_eligible"
  | "ranking_position"
>

export function DevelopmentOverview({
  development_score,
  evidence_percentage,
  evidence_status,
  ranking_eligible,
  ranking_position,
}: Props) {
  const progress = Math.max(0, Math.min(development_score ?? 0, 100))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs uppercase text-gray-400">Rank</p>
          <p className="text-lg font-semibold">
            {ranking_eligible && ranking_position !== null
              ? `#${ranking_position}`
              : "Not Ranked"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-400">Development Score</p>
          <p className="text-lg font-semibold">
            {development_score === null ? "—" : development_score.toFixed(1)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-400">Evidence</p>
          <p className="text-lg font-semibold text-yellow-400">
            {evidence_percentage === null ? "—" : `${evidence_percentage.toFixed(0)}%`}
          </p>
          <p className="text-xs text-gray-500">
            {getEvidenceStatusLabel(evidence_status)}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-gray-400">
          <span>Development performance</span>
          <span>{development_score === null ? "—" : `${development_score.toFixed(0)}%`}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
