import Link from "next/link"
import MatchStatusBadge from "./MatchStatusBadge"
import { getMatchStatus } from "@/src/lib/matches/get-match-status"

import {
  CalendarDays,
  MapPin,
  Users
} from "lucide-react"

export default function MatchCard({ match }: { match: any }) {

  const status = getMatchStatus(match)

  let href = `/portal/matches/${match.id}`

  if (status === "pending_report") {
    href = `/portal/reports/${match.id}`
  }

  const kickoff = new Date(match.kickoff_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const isPending = status === "pending_report"

  return (

    <Link href={href}>

      <div
        className={`
        group
        rounded-xl
        border
        p-4
        transition-all
        cursor-pointer
        bg-[#0B0F0F]/80
        backdrop-blur-md

        ${isPending
          ? "border-yellow-500/40 bg-yellow-500/5"
          : "border-white/10 hover:border-yellow-400/40 hover:bg-white/5"}
      `}
      >

        {/* HEADER */}

        <div className="flex items-start justify-between gap-3">

          <div>

            <h3 className="text-sm font-semibold text-white group-hover:text-yellow-400 transition">

              {match.home_team} vs {match.away_team}

            </h3>

            <p className="text-xs text-gray-400 mt-1">
              {match.league} • {match.division}
            </p>

          </div>

          <MatchStatusBadge status={status} />

        </div>


        {/* MATCH META */}

        <div className="mt-3 space-y-1 text-sm">

          <div className="flex items-center gap-2 text-gray-300">

            <CalendarDays size={14} className="text-gray-400" />

            <span>{kickoff}</span>

          </div>

          <div className="flex items-center gap-2 text-gray-400 text-xs">

            <MapPin size={14} />

            <span>{match.location} • {match.field}</span>

          </div>

        </div>


        {/* CREW PREVIEW */}

        <div className="mt-3 border-t border-white/10 pt-3">

          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">

            <Users size={14} />

            Crew

          </div>

          <div className="text-xs space-y-0.5 text-gray-300">

            <div>
              <span className="text-gray-500 mr-1">CR</span>
              {match.center_referee?.full_name ?? "TBD"}
            </div>

            <div>
              <span className="text-gray-500 mr-1">AR1</span>
              {match.ar1?.full_name ?? "TBD"}
            </div>

            <div>
              <span className="text-gray-500 mr-1">AR2</span>
              {match.ar2?.full_name ?? "TBD"}
            </div>

          </div>

        </div>

      </div>

    </Link>
  )
}