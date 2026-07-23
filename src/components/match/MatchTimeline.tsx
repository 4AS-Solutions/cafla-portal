
import { MatchEventIcon } from "../icons/MatchEventIcon"
import { MatchStage } from "./MatchStage"
import { TimelineEvent } from "./MatchTimelineEvent"

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

  const sortedEvents = [...events].sort(
    (a, b) => a.minute - b.minute
  )

  const firstHalfEvents = sortedEvents.filter(
    (event) => event.minute <= 45
  )

  const secondHalfEvents = sortedEvents.filter(
    (event) => event.minute >= 46
  )

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-6">
      {/* HEADER */}
      <h2 className="mb-5 text-sm font-semibold tracking-tight text-gray-300">
        Match Timeline
      </h2>

      <div className="relative mx-auto max-w-xl">
        {/* CENTER LINE */}
        <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-white/10" />

        <div className="space-y-3">
          <MatchStage
            label="Kickoff"
            minute={0}
            variant="highlight"
          />

          {firstHalfEvents.map((event, index) => (
            <TimelineEvent
              key={`first-half-${event.minute}-${index}`}
              event={event}
            />
          ))}

          <MatchStage
            label="Half Time"
            minute={45}
          />

          <MatchStage
            label="Second Half"
            minute={46}
          />

          {secondHalfEvents.map((event, index) => (
            <TimelineEvent
              key={`second-half-${event.minute}-${index}`}
              event={event}
            />
          ))}

          <MatchStage
            label="Full Time"
            minute={90}
            variant="highlight"
          />
        </div>
      </div>
    </div>
  )
}