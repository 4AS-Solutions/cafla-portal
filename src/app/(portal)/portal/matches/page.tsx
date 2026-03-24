import { supabaseServer } from "@/src/lib/supabase/server"
import { getUserMatches } from "@/src/lib/matches/get-user-matches"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import MatchSummaryBar from "@/src/components/match/MatchSummaryBar"
import MatchList from "@/src/components/match/MatchList"

export default async function page() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const matches = await getUserMatches(user.id)

  const now = new Date()

  const upcomingCount = matches.filter((match) => {
    const kickoff = new Date(match.kickoff_at)
    return kickoff > now
  }).length

  const pendingReportsCount = matches.filter((match) => {
    const kickoff = new Date(match.kickoff_at)
    const isPlayed = kickoff <= now
    const isCenterRef = match.role === "CR"
    const isPending =
      !match.report_status || match.report_status === "pending"

    return isPlayed && isCenterRef && isPending
  }).length

  const submittedReportsCount = matches.filter((match) => {
    return (
      match.report_status === "submitted" ||
      match.report_status === "approved" ||
      match.report_status === "revision_required"
    )
  }).length

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="My Matches"
        subtitle="View your assignments and submit match reports."
      />

      <MatchSummaryBar
        upcomingCount={upcomingCount}
        pendingReportsCount={pendingReportsCount}
        submittedReportsCount={submittedReportsCount}
      />

      <MatchList matches={matches} />
    </div>
  )
}