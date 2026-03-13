import Link from "next/link"
import { Button } from "@/src/components/ui/button"

type Evaluation = {
  match_id: string
  evaluated: string;
  home_team: string
  away_team: string
  evaluated_name: string
  match_date?: string | null
}

export function PendingEvaluationsList({
  evaluations,
}: {
  evaluations: Evaluation[]
}) {

  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No pending evaluations.
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {evaluations.map((evaluation) => (

        <div
          key={`${evaluation.match_id}-${evaluation.evaluated}`}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3"
        >

          <div className="text-sm">

            <div className="font-medium">
              {evaluation.home_team} vs {evaluation.away_team}
            </div>

            <div className="text-xs text-muted-foreground">
              Evaluate: {evaluation.evaluated_name}
            </div>

            {evaluation.match_date && (
              <div className="text-xs text-muted-foreground">
                {new Date(evaluation.match_date).toLocaleString()}
              </div>
            )}

          </div>

          <Link href={`/portal/evaluations/${evaluation.match_id}`}>
            <Button size="sm">
              Evaluate
            </Button>
          </Link>

        </div>

      ))}

    </div>
  )
}