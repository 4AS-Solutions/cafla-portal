import Link from "next/link"
import MatchStatusBadge from "./MatchStatusBadge"
import { getMatchStatus } from "@/src/lib/matches/get-match-status"

export default function MatchCard({ match }: { match: any }) {

  const status = getMatchStatus(match)

  return (
    <Link href={`/portal/matches/${match.id}`}>

      <div className="border rounded-lg p-4 hover:bg-gray-50 transition">

        <div className="flex justify-between items-center">

          <h3 className="font-semibold">
            {match.home_team} vs {match.away_team}
          </h3>

          <MatchStatusBadge status={status} />

        </div>

        <p className="text-sm text-gray-500">
          {match.league} • {match.division}
        </p>

        <p className="text-sm mt-1">
          {new Date(match.kickoff_at).toLocaleString()}
        </p>

        <p className="text-xs text-gray-400">
          {match.location} • {match.field}
        </p>

      </div>

    </Link>
  )
}