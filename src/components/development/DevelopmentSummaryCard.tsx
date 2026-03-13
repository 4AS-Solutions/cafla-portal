import { RefereeRankingRow } from "@/src/types/ranking"
import Link from "next/link"

type Props = Pick<
  RefereeRankingRow,
  "ranking_position" | "development_score" | "referee_level"
>

export function RefereeDevelopmentCard({
  ranking_position,
  development_score,
  referee_level
}: Props) {

  const score = Number(development_score)

  const progress = Math.max(0, Math.min(score, 100))

  return (
    <div className="space-y-5">

      {/* Top Info */}
      <div className="grid grid-cols-3 gap-4 text-sm">

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Rank
          </p>
          <p className="text-lg font-semibold text-white">
            #{ranking_position}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Score
          </p>
          <p className="text-lg font-semibold text-white">
            {score.toFixed(1)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Level
          </p>
          <p className="text-lg font-semibold text-yellow-400">
            {referee_level}
          </p>
        </div>

      </div>

      {/* Progress */}
      <div className="space-y-2">

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Progress to next level</span>
          <span>{progress.toFixed(0)}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-end">

        <Link
          href="/portal/development"
          className="text-xs font-medium text-yellow-400 transition hover:text-yellow-300"
        >
          View full development
        </Link>

      </div>

    </div>
  )
}