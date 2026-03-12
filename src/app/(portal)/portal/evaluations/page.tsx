import { getProfile } from "@/src/lib/queries/get-profile"
import { getPendingEvaluations } from "@/src/lib/queries/evaluations"
import { EvaluationList } from "@/src/components/evaluations/EvaluationList"

export default async function EvaluationsPage() {

  const profile = await getProfile()

  const memberId = profile?.profile?.id

  const evaluations = memberId
    ? await getPendingEvaluations(memberId)
    : []

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Evaluations
      </h1>

      <EvaluationList evaluations={evaluations ?? []} />

    </div>
  )
}