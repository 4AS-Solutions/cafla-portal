import { EvaluationForm } from "@/src/components/evaluations/EvaluationForm"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default async function EvaluationPage({ params, searchParams }: any) {

  const matchId = params.match_id
  const evaluatedId = searchParams.referee

  return (

    <div className="max-w-3xl space-y-6">

      <PortalPageHeader
        title="Submit Evaluation"
        subtitle="Rate the referee performance for this match."
      />


      <EvaluationForm
        matchId={matchId}
        evaluatedId={evaluatedId}
      />

    </div>

  )
}