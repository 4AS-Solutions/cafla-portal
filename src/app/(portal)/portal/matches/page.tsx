import { createClient } from "@/src/lib/supabase/server"
import { getUserMatches } from "@/src/lib/matches/get-user-matches"
import MatchList from "@/src/components/match/MatchList"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default async function page() {

  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const matches = await getUserMatches(user.id)

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="My Matches"
        subtitle="View your assignments and submit match reports."
      />

      <MatchList matches={matches} />
    </div>
  )
}