import type { CurrentDevelopmentRanking } from "@/src/lib/queries/get-development-ranking-v2"

export function RefereeRanking({
  ranking,
}: {
  ranking: CurrentDevelopmentRanking[]
}) {
  if (ranking.length === 0) {
    return <p className="text-sm text-gray-500">No ranking data is available for the active cycle.</p>
  }

  return (
    <div className="space-y-2">
      {ranking.map((referee) => {
        const ranked = referee.ranking_eligible && referee.ranking_position !== null

        return (
          <div key={referee.member_id} className="flex items-center justify-between rounded-md border border-white/10 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-20 shrink-0 text-sm font-semibold">
                {ranked ? `#${referee.ranking_position}` : "Not Ranked"}
              </span>
              <span className="truncate text-sm">{referee.full_name}</span>
            </div>
            <div className="ml-3 text-right">
              <p className="font-semibold">
                {referee.ranking_score === null ? "—" : referee.ranking_score.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Development {referee.development_score === null ? "—" : referee.development_score.toFixed(1)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
