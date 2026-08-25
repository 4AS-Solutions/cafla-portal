import { EvaluationObligationsView } from "@/src/components/evaluations/EvaluationObligationsView"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { requireUser } from "@/src/lib/auth/require-user"
import { getUserEvaluationObligations } from "@/src/lib/queries/get-user-evaluation-obligations"

export default async function EvaluationsPage() {

  await requireUser()

  const obligations = await getUserEvaluationObligations()

  return (

    <div className="max-w-6xl space-y-6">

      <PortalPageHeader
        title="Evaluations"
        subtitle="Complete match-crew evaluations and review your recent activity."
      />

      <EvaluationObligationsView obligations={obligations} />

    </div>

  )
}
