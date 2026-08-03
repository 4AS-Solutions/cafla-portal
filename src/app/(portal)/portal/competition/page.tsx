import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import CompetitionCenter from "@/src/components/competition/CompetitionCenter"
import { requireUser } from "@/src/lib/auth/require-user"

export default async function CompetitionPage() {
  await requireUser()

  return (
    <div className="space-y-6 px-6">
      <PortalPageHeader
        title="Competition Center"
        subtitle="Explore standings, team performance, and competition intelligence."
      />

      <CompetitionCenter />
    </div>
  )
}