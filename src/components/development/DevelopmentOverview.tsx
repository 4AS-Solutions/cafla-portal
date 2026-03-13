type Props = {
  ranking_position: number
  development_score: number
  referee_level: string
}

export function DevelopmentOverview({
  ranking_position,
  development_score,
  referee_level
}: Props) {

  const progress = Math.min(100, Number(development_score))

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-3 gap-4">

        <div>
          <p className="text-xs text-gray-400 uppercase">
            Rank
          </p>
          <p className="text-lg font-semibold">
            #{ranking_position}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">
            Score
          </p>
          <p className="text-lg font-semibold">
            {Number(development_score).toFixed(1)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">
            Level
          </p>
          <p className="text-lg font-semibold text-yellow-400">
            {referee_level}
          </p>
        </div>

      </div>


      <div>

        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress to next level</span>
          <span>{progress.toFixed(0)}%</span>
        </div>

        <div className="h-2 bg-white/10 rounded-full overflow-hidden">

          <div
            className="h-2 bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />

        </div>

      </div>

    </div>
  )
}