"use client"

import Link from "next/link"
import { useAuth } from "../providers/AuthProvider"

type Match = {
  match_id: string
  home_team: string
  away_team: string
  league?: string | null
  division?: string | null
  field?: string | null
  kickoff_at?: string | null
  center_referee?: string | null
  assistant_referee_1?: string | null
  assistant_referee_2?: string | null
}

function formatMatchDate(value?: string | null) {
  if (!value) return "Date pending"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Date pending"
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function UpcomingMatchesTable({ matches }: { matches: Match[] }) {
  const { profile } = useAuth();
  const userName = profile?.full_name ?? "";

  if (!matches || matches.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-black/20 p-4 text-sm text-gray-400">
        No upcoming matches.
      </div>
    )
  }

  function getMyRole(match: Match, userName: string) {
    if (match.center_referee === userName) {
      return "CR"
    }
    if (match.assistant_referee_1 === userName) {
      return "AR1"
    }
    if (match.assistant_referee_2 === userName) {
      return "AR2"
    }
    return null
  }

  /**
   * Limit to next 3 matches
   */
  const nextMatches = matches.slice(0, 3)


  return (
    <div className="space-y-4">

      {/* GRID */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {nextMatches.map((match) => {

          const myRole = getMyRole(match, userName);

          return (
            <div
              key={match.match_id}
              className="rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-yellow-400/30 hover:bg-black/30"
            >

            {/* MATCH */}
            <div className="text-sm font-semibold text-white">
              {match.home_team} vs {match.away_team}
            </div>

            {/* LEAGUE */}
            {(match.league || match.division) && (
              <div className="mt-1 text-xs text-gray-400">
                {match.league ?? ""} {match.division ? `• ${match.division}` : ""}
              </div>
            )}

            {/* DATE */}
            <div className="mt-2 text-sm text-gray-300">
              {formatMatchDate(match.kickoff_at)}
            </div>

            {/* FIELD */}
            <div className="mt-2 text-xs text-gray-400">
              Field: {match.field ?? "TBD"}
            </div>

            {/* CREW */}
            <div className="mt-3 space-y-1 text-xs text-gray-400">
              <div>
                <span className={myRole === "CR" ? "text-yellow-400 font-semibold" : ""}>CR: {match.center_referee ?? "TBD"}</span>
              </div>

              <div>
                <span className={myRole === "AR1" ? "text-yellow-400 font-semibold" : ""}>AR1: {match.assistant_referee_1 ?? "TBD"}</span>
              </div>

              <div>
                <span className={myRole === "AR2" ? "text-yellow-400 font-semibold" : ""}>AR2: {match.assistant_referee_2 ?? "TBD"}</span>
              </div>
            </div>

          </div>
        )})}

      </div>

      {/* VIEW ALL */}
      <div className="flex justify-end">
        <Link
          href="/portal/matches"
          className="text-xs font-medium text-yellow-400 transition hover:text-yellow-300"
        >
          View full matches
        </Link>
      </div>

    </div>
  )
}