import { Trophy } from "lucide-react"

type ScoreboardSectionProps = {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
}

export default function ScoreboardSection({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
}: ScoreboardSectionProps) {
  return (
    <section
      className="
        rounded-2xl
        border border-white/10
        bg-[#0B0F0F]/80
        p-6 sm:p-8
        backdrop-blur-md
      "
    >
      <h2
        className="
          mb-6 flex items-center gap-2
          text-lg font-semibold text-white
        "
      >
        <Trophy size={18} className="text-yellow-400" />
        Match Score
      </h2>

      <div
        className="
          flex flex-col items-center
          gap-6
          md:flex-row
          md:justify-center
        "
      >
        {/* HOME */}
        <div className="text-center">
          <div
            className="
              mb-2 text-sm text-gray-400
            "
          >
            {homeTeam}
          </div>

          <div
            className="
              text-5xl font-bold text-white
            "
          >
            {homeScore}
          </div>
        </div>

        {/* DASH */}
        <div
          className="
            text-4xl font-bold text-yellow-400
          "
        >
          -
        </div>

        {/* AWAY */}
        <div className="text-center">
          <div
            className="
              mb-2 text-sm text-gray-400
            "
          >
            {awayTeam}
          </div>

          <div
            className="
              text-5xl font-bold text-white
            "
          >
            {awayScore}
          </div>
        </div>
      </div>

      <p
        className="
          mt-6 text-center text-xs
          text-gray-500
        "
      >
        Match score is calculated automatically from submitted goals.
      </p>
    </section>
  )
}