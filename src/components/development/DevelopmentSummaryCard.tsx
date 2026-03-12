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
    <div className="space-y-3">

      <div className="flex justify-between text-sm">
        <span>Rank</span>
        <span className="font-semibold">#{ranking_position}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span>Score</span>
        <span className="font-semibold">{development_score}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span>Level</span>
        <span className="font-semibold">{referee_level}</span>
      </div>

      <div className="space-y-1">

        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-green-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-xs text-muted-foreground text-right">
          {progress.toFixed(0)}%
        </div>

      </div>

      <Link
        href="/portal/development"
        className="text-xs text-primary underline"
      >
        View Details
      </Link>

    </div>
  )
}