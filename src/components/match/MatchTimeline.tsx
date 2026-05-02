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

      {/* HEADER */}
      <h2 className="text-sm font-semibold text-gray-300 mb-5 tracking-tight">
        Match Timeline
      </h2>

      <div className="relative max-w-xl mx-auto">

        {/* CENTER LINE */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

        <div className="space-y-3">

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
              <div
                key={i}
                className="
                  grid grid-cols-2 items-center
                  transition-all duration-200
                  hover:bg-white/5 hover:scale-[1.015]
                  rounded-md px-2 py-1
                "
              >

                {/* HOME */}
                <div
                  className={`
                    flex items-center gap-2 justify-end pr-4
                    ${!isHome && "opacity-0"}
                  `}
                >
                  <span className="text-sm text-white font-medium tracking-tight">
                    {e.player} #{e.number}
                  </span>

                  <Icon
                    size={18}
                    className={`${iconStyle} drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]`}
                    strokeWidth={1.8}
                  />
                </div>

                {/* AWAY */}
                <div
                  className={`
                    flex items-center gap-2 pl-4
                    ${isHome && "opacity-0"}
                  `}
                >
                  <Icon
                    size={18}
                    className={`${iconStyle} drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]`}
                    strokeWidth={1.8}
                  />

                  <span className="text-sm text-white font-medium tracking-tight">
                    {e.player} #{e.number}
                  </span>
                </div>

                {/* MINUTE */}
                <div className="col-span-2 flex justify-center -mt-2">

                  <div
                    className="
                      text-[11px]
                      bg-white/10 border border-white/10
                      px-2 py-[2px]
                      rounded-md
                      text-gray-300
                      backdrop-blur-sm
                    "
                  >
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