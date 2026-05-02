import MatchAssets from "@/src/components/match/MatchAssets"
import MatchHeader from "@/src/components/match/MatchHeader"
import MatchOfficials from "@/src/components/match/MatchOfficials"
import MatchScore from "@/src/components/match/MatchScore"
import { MatchTimeline } from "@/src/components/match/MatchTimeline"
import MatchNarrativeSummary from "@/src/components/reports/MatchNarrativeSummary"
import { getMatchDetails } from "@/src/lib/queries/get-match-details"
import { getCardReasons } from "@/src/lib/queries/get-card-reasons"

export default async function MatchDetailsPage({
  params,
}: {
  params: Promise<{ match_id: string }>
}) {

  const { match_id } = await params

  const {
    match,
    center,
    ar1,
    ar2,
    report,
    goals,
    cards,
    assets,
    comments,
  } = await getMatchDetails(match_id)

  // 🔥 NUEVO: traer razones
  const cardReasons = await getCardReasons()

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
    <div className="space-y-8">

      {/* HEADER */}
      <MatchHeader
        match={match}
        status={report?.status}
      />

      {/* 🔥 GRID 3 COLUMNAS */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ================= COL 1 ================= */}
        <div className="space-y-6">

          <MatchScore report={report} />

          <MatchTimeline events={timeline} />

          <MatchAssets assets={assets} />

        </div>

        {/* ================= COL 2 ================= */}
        <div className="space-y-6">

          {cards && cards.length > 0 && (
            <MatchNarrativeSummary
              cards={cards}
              reasons={cardReasons}
            />
          )}

        </div>

        {/* ================= COL 3 ================= */}
        <div className="space-y-6">

          <MatchOfficials center={center} ar1={ar1} ar2={ar2} />

          {comments && (
            <div className="rounded-xl border border-white/10 bg-black/30 p-5">
              
              <p className="text-sm font-semibold text-gray-300 mb-2">
                Referee Comments
              </p>

              <p className="text-sm text-white/90 whitespace-pre-line">
                {comments}
              </p>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}