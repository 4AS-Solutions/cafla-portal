import MatchCard from "./MatchCard"
import { getMatchStatus } from "@/src/lib/matches/get-match-status"

type Match = any

function Section({
  title,
  matches,
}: {
  title: string
  matches: Match[]
}) {

  if (matches.length === 0) return null

  return (

    <div className="space-y-4">

      <div className="flex items-center justify-between">

        <h2 className="text-sm font-semibold text-gray-300 tracking-wide">
          {title}
        </h2>

        <span className="text-xs text-gray-500">
          {matches.length}
        </span>

      </div>

      {/* GRID LAYOUT */}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">

        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}

      </div>

    </div>
  )
}

export default function MatchList({ matches }: { matches: Match[] }) {

  if (!matches || matches.length === 0) {

    return (
      <div className="text-sm text-gray-400 border border-dashed border-white/10 rounded-lg p-6 text-center">
        No matches assigned yet.
      </div>
    )
  }

  const upcoming: Match[] = []
  const pendingReports: Match[] = []
  const completed: Match[] = []

  matches.forEach((match) => {

    const status = getMatchStatus(match)

    if (status === "upcoming") {
      upcoming.push(match)
    }

    else if (status === "pending_report") {
      pendingReports.push(match)
    }

    else {
      completed.push(match)
    }

  })

  return (

    <div className="space-y-8">

      <Section
        title="Upcoming Matches"
        matches={upcoming}
      />

      <Section
        title="Pending Reports"
        matches={pendingReports}
      />

      <Section
        title="Completed Matches"
        matches={completed}
      />

    </div>
  )
}