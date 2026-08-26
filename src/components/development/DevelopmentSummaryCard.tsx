import Link from "next/link"

import { getEvidenceStatusLabel } from "@/src/lib/development/evidence-status"
import type { CurrentDevelopmentRanking } from "@/src/lib/queries/get-development-ranking-v2"

export function RefereeDevelopmentCard({
  current,
}: {
  current: CurrentDevelopmentRanking
}) {
  const progress = Math.max(0, Math.min(current.development_score ?? 0, 100))
  const rank = current.ranking_eligible && current.ranking_position !== null
    ? `#${current.ranking_position}`
    : "Not Ranked"

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-400">Rank</p>
          <p className="text-lg font-semibold text-white">{rank}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-400">Development</p>
          <p className="text-lg font-semibold text-white">
            {current.development_score === null ? "—" : current.development_score.toFixed(1)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-400">Evidence</p>
          <p className="text-lg font-semibold text-yellow-400">
            {current.evidence_percentage === null
              ? "—"
              : `${current.evidence_percentage.toFixed(0)}%`}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Development performance</span>
          <span>{current.development_score === null ? "—" : `${current.development_score.toFixed(0)}%`}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-500">
          {getEvidenceStatusLabel(current.evidence_status)}
        </p>
      </div>

      <div className="flex justify-end">
        <Link href="/portal/development" className="text-xs font-medium text-yellow-400 transition hover:text-yellow-300">
          View full development
        </Link>
      </div>
    </div>
  )
}
