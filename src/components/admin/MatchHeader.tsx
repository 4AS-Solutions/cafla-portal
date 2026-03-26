export default function MatchHeader({ match }: any) {

  return (

    <div className="
      bg-[#0B0F0F]/80
      border border-white/10
      rounded-2xl
      p-5
      space-y-2
    ">

      <div className="flex justify-between items-center">

        <h1 className="text-xl font-semibold text-white">
          {match.home_team} vs {match.away_team}
        </h1>

        <span className="
          text-xs px-3 py-1 rounded-lg
          border border-yellow-500/20
          text-yellow-400
        ">
          {match.report_status}
        </span>

      </div>

      <p className="text-sm text-gray-400">
        {match.league} — {match.division}
      </p>

    </div>

  )
}