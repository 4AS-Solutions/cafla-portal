import MatchCard from "./MatchCard"

export default function MatchList({ matches }: { matches: any[] }) {

  if (!matches || matches.length === 0) {
    return <p className="text-gray-500">No matches assigned.</p>
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  )
}