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
      <div className="text-sm text-muted-foreground">
        No events recorded.
      </div>
    )
  }

  return (
    <div className="relative max-w-xl mx-auto">

      {/* vertical center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

      <div className="space-y-6">

        {events.map((e, i) => {
          let Icon = Volleyball
          let iconStyle = "text-gray-600"

          if (e.card_type === "yellow") {
            Icon = RectangleVertical
            iconStyle = "text-yellow-500 fill-yellow-400"
          }

          if (e.card_type === "red") {
            Icon = RectangleVertical
            iconStyle = "text-red-600 fill-red-500"
          }

          const isHome = e.team === "home"

          return (
            <div key={i} className="grid grid-cols-2 items-center gap-4">

              {/* HOME SIDE */}
              <div className={`flex items-center gap-2 justify-end pr-4 ${!isHome && "opacity-0"}`}>
                <span className="text-sm">
                  {e.player} #{e.number}
                </span>

                <Icon
                  size={18}
                  className={iconStyle}
                  strokeWidth={1.8}
                />
              </div>

              {/* AWAY SIDE */}
              <div className={`flex items-center gap-2 pl-4 ${isHome && "opacity-0"}`}>
                <Icon
                  size={18}
                  className={iconStyle}
                  strokeWidth={1.8}
                />

                <span className="text-sm">
                  {e.player} #{e.number}
                </span>
              </div>

              {/* minute indicator */}
              <div className="col-span-2 flex justify-center -mt-3">
                <div className="text-xs bg-background px-2 text-muted-foreground">
                  {e.minute}'
                </div>
              </div>

            </div>
          )
        })}

      </div>
    </div>
  )
}