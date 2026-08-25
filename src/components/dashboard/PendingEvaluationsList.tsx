import Link from "next/link"

import { Button } from "@/src/components/ui/button"
import type { UserEvaluationObligation } from "@/src/lib/queries/get-user-evaluation-obligations"

const LOS_ANGELES_TIME_ZONE = "America/Los_Angeles"

function formatKickoff(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: LOS_ANGELES_TIME_ZONE,
  }).format(date)
}

export function PendingEvaluationsList({
  evaluations,
}: {
  evaluations: UserEvaluationObligation[]
}) {
  if (evaluations.length === 0) {
    return <div className="text-sm text-muted-foreground">No pending evaluations.</div>
  }

  return (
    <div className="space-y-3">
      {evaluations.map((evaluation) => (
        <div
          key={`${evaluation.match_id}-${evaluation.evaluated_id}`}
          className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/20 p-3"
        >
          <div className="min-w-0 text-sm">
            <div className="truncate font-medium">{evaluation.home_team} vs {evaluation.away_team}</div>
            <div className="text-xs text-muted-foreground">Evaluate: {evaluation.evaluated_name}</div>
            <div className="text-xs text-muted-foreground">{formatKickoff(evaluation.kickoff_at)}</div>
          </div>

          <Button asChild size="sm">
            <Link href={`/portal/evaluations/${evaluation.match_id}?referee=${evaluation.evaluated_id}`}>
              Evaluate
            </Link>
          </Button>
        </div>
      ))}
    </div>
  )
}
