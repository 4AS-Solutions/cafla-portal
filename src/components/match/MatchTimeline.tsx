import { MatchStage } from "./MatchStage"
import {
  TimelineEvent,
  type TimelineEventData,
} from "./MatchTimelineEvent"

function combineSecondYellowCards(
  events: TimelineEventData[]
): TimelineEventData[] {
  const combinedEvents: TimelineEventData[] = []

  for (let index = 0; index < events.length; index += 1) {
    const currentEvent = events[index]
    const nextEvent = events[index + 1]

    const isSecondYellowSequence =
      currentEvent.type === "card" &&
      currentEvent.card_type === "yellow" &&
      nextEvent?.type === "card" &&
      nextEvent.card_type === "red" &&
      currentEvent.minute === nextEvent.minute &&
      currentEvent.team === nextEvent.team &&
      currentEvent.player === nextEvent.player &&
      currentEvent.number === nextEvent.number

    if (isSecondYellowSequence) {
      combinedEvents.push({
        ...currentEvent,
        card_type: "second_yellow",
      })

      // Skip the following red-card event because both cards
      // are now represented by one combined timeline event.
      index += 1
      continue
    }

    combinedEvents.push(currentEvent)
  }

  return combinedEvents
}

export function MatchTimeline({
  events,
}: {
  events: TimelineEventData[]
}) {
  if (!events.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-sm text-gray-400">
        No events recorded.
      </div>
    )
  }

  /*
   * Keep the original order when multiple events
   * occurred during the same minute.
   */
  const sortedEvents = events
    .map((event, originalIndex) => ({
      event,
      originalIndex,
    }))
    .sort(
      (a, b) =>
        a.event.minute - b.event.minute ||
        a.originalIndex - b.originalIndex
    )
    .map(({ event }) => event)

  /*
   * Combine consecutive yellow + red cards when they
   * belong to the same player, team, and minute.
   */
  const timelineEvents =
    combineSecondYellowCards(sortedEvents)

  const firstHalfEvents = timelineEvents.filter(
    (event) => event.minute <= 45
  )

  const secondHalfEvents = timelineEvents.filter(
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
              key={`first-half-${event.minute}-${event.player}-${event.card_type ?? event.type}-${index}`}
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
              key={`second-half-${event.minute}-${event.player}-${event.card_type ?? event.type}-${index}`}
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