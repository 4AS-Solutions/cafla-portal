export default function MatchInfo({ match }: any) {

  return (

    <div className="
      bg-[#0B0F0F]/80
      border border-white/10
      rounded-2xl
      p-4
      space-y-3
    ">

      <h2 className="text-sm text-gray-400">Match Info</h2>

      <div className="text-sm text-white space-y-2">

        <p>
          <span className="text-gray-400">Date:</span> {formatDate(match.kickoff_at)}
        </p>

        <p>
          <span className="text-gray-400">Location:</span> {match.location}
        </p>

        <p>
          <span className="text-gray-400">Field:</span> {match.field}
        </p>

      </div>

    </div>

  )
}

function formatDate(date: string) {
  if (!date) return "No date"
  return new Date(date).toLocaleString()
}