"use client"

import MatchAssets from "@/src/components/match/MatchAssets"
import MatchHeader from "@/src/components/match/MatchHeader"
import MatchOfficials from "@/src/components/match/MatchOfficials"
import MatchScore from "@/src/components/match/MatchScore"
import { MatchTimeline } from "@/src/components/match/MatchTimeline"
import StatusBadge from "./StatusBadge"
import AdminActions from "./AdminActions"


export default function AdminReportDetail({
  match,
  center,
  ar1,
  ar2,
  report,
  goals,
  cards,
  assets
}: any) {

  if (!match) {
    return <div>Match not found</div>
  }

  const timeline = [
    ...goals.map((g: any) => ({
      minute: g.minute,
      type: "goal" as const,
      player: g.player_name,
      number: g.player_number,
      team: g.team,
    })),
    ...cards.map((c: any) => ({
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
      <div className="flex items-center justify-between">

        <MatchHeader match={match} />

        {report && (
          <StatusBadge status={report.status} />
        )}

      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">

          <MatchScore report={report} />

          <MatchTimeline events={timeline} />

          <MatchAssets assets={assets} />

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          <MatchOfficials center={center} ar1={ar1} ar2={ar2} />

          {report && (
            <AdminActions
              reportId={report.id}
              status={report.status}
            />
          )}

        </div>

      </div>

    </div>
  )
}