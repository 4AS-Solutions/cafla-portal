import { Volleyball, RectangleVertical } from "lucide-react"

type Event = {
  minute: number
  type: "goal" | "card"
  player: string
  number: string
  team: "home" | "away"
  card_type?: string
}

export function MatchTimeline({ events }: { events: Event[] }) {

  if (!events.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-sm text-gray-400">
        No events recorded.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-6">

      <h2 className="text-sm font-semibold text-gray-300 mb-6">
        Match Timeline
      </h2>

      <div className="relative max-w-xl mx-auto">

        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

        <div className="space-y-6">

          {events.map((e, i) => {

            let Icon = Volleyball
            let iconStyle = "text-green-400"

            if (e.card_type === "yellow") {
              Icon = RectangleVertical
              iconStyle = "text-yellow-400 fill-yellow-400"
            }

            if (e.card_type === "red") {
              Icon = RectangleVertical
              iconStyle = "text-red-500 fill-red-500"
            }

            const isHome = e.team === "home"

            return (
              <div key={i} className="grid grid-cols-2 items-center gap-4">

                {/* HOME */}
                <div className={`flex items-center gap-2 justify-end pr-4 ${!isHome && "opacity-0"}`}>

                  <span className="text-sm text-white">
                    {e.player} #{e.number}
                  </span>

                  <Icon
                    size={18}
                    className={iconStyle}
                    strokeWidth={1.8}
                  />

                </div>

                {/* AWAY */}
                <div className={`flex items-center gap-2 pl-4 ${isHome && "opacity-0"}`}>

                  <Icon
                    size={18}
                    className={iconStyle}
                    strokeWidth={1.8}
                  />

                  <span className="text-sm text-white">
                    {e.player} #{e.number}
                  </span>

                </div>

                {/* minute */}
                <div className="col-span-2 flex justify-center -mt-3">

                  <div className="text-xs bg-white/10 border border-white/10 px-2 py-[2px] rounded text-gray-300">
                    {e.minute}'
                  </div>

                </div>

              </div>
            )
          })}

        </div>

      </div>

    </div>
  )
}