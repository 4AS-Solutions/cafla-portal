"use client"

import { CalendarDays, Clock, MapPin } from "lucide-react"

const recurringEvents = [
  {
    day: "Monday",
    title: "Recovery Session",
    time: "7:00 PM",
    location: "CAFLA Headquarters",
  },
  {
    day: "Thursday",
    title: "Training in the Field",
    time: "7:00 PM",
    location: "Montebello Sports Complex",
  },
]

export function RecurringSchedule() {
  return (
    <div className="mb-24">

      {/* HEADER */}
      <div className="text-center mb-12">

        <p className="text-sm uppercase tracking-[0.25em] text-yellow-400 mb-3">
          Weekly Schedule
        </p>

        <h3 className="text-2xl md:text-3xl text-white font-semibold">
          Recurring Training Sessions
        </h3>

        <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm">
          These sessions take place every week and are open to both active and prospective referees.
        </p>

      </div>

      {/* ITEMS */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

        {recurringEvents.map((event, i) => (
          <div
            key={i}
            className="cafla-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-yellow-400/30 hover:scale-[1.02] transition"
          >

            <div className="flex items-center gap-4">

              {/* ICON */}
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400 shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>

              {/* CONTENT */}
              <div>

                <p className="text-xs uppercase tracking-wide text-yellow-400 font-semibold">
                  {event.day}
                </p>

                <h4 className="text-white font-semibold text-base">
                  {event.title}
                </h4>

                {/* LOCATION */}
                <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>

                {/* TIME */}
                <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </div>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}