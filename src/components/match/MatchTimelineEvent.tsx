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

  return (
    <div
      className="
        grid grid-cols-[1fr_auto_1fr] items-center
        rounded-md px-2 py-2
        transition-all duration-200
        hover:scale-[1.01] hover:bg-white/5
      "
    >
      {/* HOME EVENT */}
      <div className="flex min-w-0 justify-end pr-3">
        {isHome && (
          <div className="flex min-w-0 flex-col items-end">
            <div className="flex min-w-0 items-center justify-end gap-2">
              <span className="truncate text-sm font-medium tracking-tight text-white">
                {event.player} #{event.number}
              </span>

              <MatchEventIcon
                type={eventIconType}
                size={18}
              />
            </div>
          </div>
        )}
      </div>

      {/* MINUTE */}
      <div className="relative z-10 flex items-center justify-center">
        <div
          className="
            rounded-md border border-white/10
            bg-[#18231f] px-2 py-[2px]
            text-[11px] text-gray-300
            backdrop-blur-sm
          "
        >
          {event.minute}'
        </div>
      </div>

      {/* AWAY EVENT */}
      <div className="flex min-w-0 pl-3">
        {!isHome && (
          <div className="flex min-w-0 flex-col items-start">
            <div className="flex min-w-0 items-center gap-2">
              <MatchEventIcon
                type={eventIconType}
                size={18}
              />

              <span className="truncate text-sm font-medium tracking-tight text-white">
                {event.player} #{event.number}
              </span>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}