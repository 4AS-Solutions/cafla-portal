import { MatchEventIcon } from "../icons/MatchEventIcon"

export type TimelineEventData = {
  minute: number
  type: "goal" | "card"
  player: string
  number: string
  team: "home" | "away"
  card_type?: string
}

type TimelineEventProps = {
  event: TimelineEventData
}

export function TimelineEvent({
  event,
}: TimelineEventProps) {
  const isHome = event.team === "home"

  const eventIconType =
    event.type === "goal"
      ? "goal"
      : event.card_type === "second_yellow"
        ? "second_yellow"
        : event.card_type === "red"
          ? "red"
          : "yellow"

  const playerLabel = `#${event.number} ${event.player}`

  return (
    <div
      className="
        grid min-w-0
        grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
        items-center rounded-md px-2 py-2
        transition-all duration-200
        hover:scale-[1.01] hover:bg-white/5
      "
    >
      {/* HOME EVENT */}
      <div className="flex min-w-0 justify-end pr-2 sm:pr-3">
        {isHome && (
          <div className="flex w-full min-w-0 items-center justify-end gap-2">
            <span
              title={playerLabel}
              className="
                min-w-0 flex-1 truncate
                text-right text-sm font-medium
                tracking-tight text-white
              "
            >
              {playerLabel}
            </span>

            <span className="shrink-0">
              <MatchEventIcon
                type={eventIconType}
                size={18}
              />
            </span>
          </div>
        )}
      </div>

      {/* MINUTE */}
      <div className="relative z-10 flex shrink-0 items-center justify-center">
        <div
          className="
            whitespace-nowrap rounded-md
            border border-white/10 bg-[#18231f]
            px-2 py-[2px] text-[11px]
            text-gray-300 backdrop-blur-sm
          "
        >
          {event.minute}'
        </div>
      </div>

      {/* AWAY EVENT */}
      <div className="flex min-w-0 pl-2 sm:pl-3">
        {!isHome && (
          <div className="flex w-full min-w-0 items-center gap-2">
            <span className="shrink-0">
              <MatchEventIcon
                type={eventIconType}
                size={18}
              />
            </span>

            <span
              title={playerLabel}
              className="
                min-w-0 flex-1 truncate
                text-left text-sm font-medium
                tracking-tight text-white
              "
            >
              {playerLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}