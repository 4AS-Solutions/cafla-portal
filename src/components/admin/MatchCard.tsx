"use client"

import { useRouter } from "next/navigation"

export default function MatchCard({ match }: any) {

  const router = useRouter()

  return (

    <div
      onClick={() => router.push(`/admin/matches/${match.id}`)}
      className="
        cursor-pointer
        bg-[#0B0F0F]/80
        border border-white/10
        rounded-2xl
        p-4
        space-y-3
        hover:border-emerald-500/30
        transition
      "
    >

      {/* HEADER */}
      <div className="flex justify-between">

        <div>
          <p className="text-white font-semibold text-sm">
            {match.home_team} vs {match.away_team}
          </p>

          <p className="text-xs text-gray-400">
            {match.division}
          </p>
        </div>

        <span className="
          text-xs px-2 py-1 rounded
          border border-yellow-500/20
          text-yellow-400
        ">
          {match.report_status}
        </span>

      </div>

      {/* DETAILS */}
      <div className="text-xs text-gray-400 space-y-1">

        <p>{formatDate(match.kickoff_at)}</p>

        <p>{match.location} — {match.field}</p>

        <p>{match.league}</p>

      </div>

    </div>
  )
}

function formatDate(date: string) {
  if (!date) return "No date"

  return new Date(date).toLocaleString()
}