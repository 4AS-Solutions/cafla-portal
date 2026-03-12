import { EvaluationForm } from "@/src/components/evaluations/EvaluationForm"

export default async function EvaluationPage({ params, searchParams }: any) {

  const matchId = params.match_id
  const evaluatedId = searchParams.referee

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Submit Evaluation
      </h1>

      <EvaluationForm
        matchId={matchId}
        evaluatedId={evaluatedId}
      />

    </div>
  )
}