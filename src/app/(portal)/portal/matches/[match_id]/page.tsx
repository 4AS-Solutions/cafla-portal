import MatchAssets from "@/src/components/match/MatchAssets"
import MatchHeader from "@/src/components/match/MatchHeader"
import MatchOfficials from "@/src/components/match/MatchOfficials"
import MatchScore from "@/src/components/match/MatchScore"
import { MatchTimeline } from "@/src/components/match/MatchTimeline"
import { getMatchDetails } from "@/src/lib/queries/get-match-details"



export default async function MatchDetailsPage({
  params,
}: {
  params: Promise<{ match_id: string }>
}) {
  const { match_id } = await params

  const { match, center, ar1, ar2, report, goals, cards, assets } = await getMatchDetails(match_id)

  if (!match) {
    return <div>Match not found</div>
  }

  const timeline = [
    ...goals.map((g) => ({
      minute: g.minute,
      type: "goal" as const,
      player: g.player_name,
      number: g.player_number,
      team: g.team,
    })),
    ...cards.map((c) => ({
      minute: c.minute,
      type: "card" as const,
      player: c.player_name,
      number: c.player_number,
      team: c.team,
      card_type: c.card_type,
    })),
  ].sort((a, b) => a.minute - b.minute)

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      <MatchHeader match={match} />
      <MatchScore report={report} />
      <MatchOfficials center={center} ar1={ar1} ar2={ar2} />
      <MatchTimeline events={timeline} />
      <MatchAssets assets={assets} />

    </div>
  )
}