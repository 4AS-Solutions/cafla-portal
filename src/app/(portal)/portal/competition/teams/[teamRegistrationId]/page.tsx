import TeamProfile from "@/src/components/competition/TeamProfile"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { requireUser } from "@/src/lib/auth/require-user"

type TeamProfilePageProps = {
  params: Promise<{
    teamRegistrationId: string
  }>
}

export default async function TeamProfilePage({
  params,
}: TeamProfilePageProps) {
  await requireUser()

  const { teamRegistrationId } = await params

  return (
    <div className="space-y-6 px-6">
      <PortalPageHeader
        title="Team Profile"
        subtitle="Review team performance, leaders, discipline, and roster information."
      />

      <TeamProfile
        teamRegistrationId={teamRegistrationId}
      />
    </div>
  )
}