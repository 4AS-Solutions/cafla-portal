export default function MatchReferees({ match }: any) {

  return (

    <div className="
      bg-[#0B0F0F]/80
      border border-white/10
      rounded-2xl
      p-4
      space-y-3
    ">

      <h2 className="text-sm text-gray-400">Referees</h2>

      <div className="text-sm text-white space-y-2">

        <p>
          <span className="text-gray-400">Center:</span>{" "}
          {match.center_referee?.full_name || "Unassigned"}
        </p>

        <p>
          <span className="text-gray-400">AR1:</span>{" "}
          {match.ar1?.full_name || "Unassigned"}
        </p>

        <p>
          <span className="text-gray-400">AR2:</span>{" "}
          {match.ar2?.full_name || "Unassigned"}
        </p>

      </div>

    </div>

  )
}