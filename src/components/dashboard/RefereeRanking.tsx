import { RefereeRankingRow } from "@/src/types/ranking"

type Props = {
  ranking: RefereeRankingRow[]
}

export function RefereeRanking({ ranking }: Props) {
  return (
    <div className="space-y-2">

      {ranking.map((referee) => (
        <div
          key={referee.member_id}
          className="flex items-center justify-between rounded-md border p-3"
        >

          <div className="flex items-center gap-3">

            <span className="font-semibold w-6">
              #{referee.ranking_position}
            </span>

            <span className="text-sm">
              {referee.full_name}
            </span>

          </div>

          <div className="flex items-center gap-3">

            <span className="text-xs text-muted-foreground">
              {referee.referee_level}
            </span>

            <span className="font-semibold">
              {referee.development_score}
            </span>

          </div>

        </div>
      ))}

    </div>
  )
}