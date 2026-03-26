import { getProfile } from "@/src/lib/queries/get-profile"
import { getPendingEvaluations } from "@/src/lib/queries/evaluations"
import { EvaluationList } from "@/src/components/evaluations/EvaluationList"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default async function EvaluationsPage() {

  const profile = await getProfile()

  const memberId = profile?.profile?.id

  const evaluations = memberId
    ? await getPendingEvaluations(memberId)
    : []

  return (

    <div className="space-y-6 max-w-6xl">

      <PortalPageHeader
        title="Evaluations"
        subtitle="View and manage your pending evaluations."
      />

      <EvaluationList evaluations={evaluations ?? []} />

    </div>

  )
}