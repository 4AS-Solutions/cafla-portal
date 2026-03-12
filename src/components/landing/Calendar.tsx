"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { calendarData } from "@/src/lib/calendar/calendarPlan."



export function Calendar() {

  const months = Object.keys(calendarData)
  const [monthIndex, setMonthIndex] = useState(0)

  const nextMonth = () => {
    setMonthIndex((prev) => (prev + 1) % months.length)
  }

  const prevMonth = () => {
    setMonthIndex((prev) => (prev - 1 + months.length) % months.length)
  }

  const currentMonth = months[monthIndex]

  return (
    <section
      id="calendar"
      className="relative py-28 cafla-section overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-6">

        {/* header */}

        <div className="text-center mb-16">

          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
            Upcoming Referee Classes
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Stay updated with our monthly referee meetings, fitness sessions,
            and educational workshops. New referees are welcome to attend.
          </p>

        </div>


        {/* month selector */}

        <div className="flex items-center justify-center gap-8 mb-16">

          <button
            onClick={prevMonth}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <ChevronLeft className="text-white" />
          </button>

          <h3 className="text-2xl text-white font-semibold">
            {currentMonth}
          </h3>

          <button
            onClick={nextMonth}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <ChevronRight className="text-white" />
          </button>

        </div>


        {/* cards */}

        <div className="overflow-hidden">

          <AnimatePresence mode="wait">

            <motion.div
              key={currentMonth}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.35 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >

              {calendarData[currentMonth].map((event, i) => (

                <div
                  key={i}
                  className="cafla-card p-8 rounded-xl hover:scale-[1.04] transition-all duration-300"
                >

                  {/* date */}

                  <div className="flex items-center gap-2 text-yellow-400 mb-4">

                    <CalendarDays size={18} />

                    <span className="text-sm font-semibold">
                      {event.date}
                    </span>

                  </div>


                  {/* title */}

                  <h3 className="text-lg text-white font-semibold mb-4">
                    {event.title}
                  </h3>


                  {/* location */}

                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <MapPin size={16} />
                    {event.location}
                  </div>


                  {/* time */}

                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                    <Clock size={16} />
                    {event.time}
                  </div>


                  {/* add to calendar */}

                  <a
                    href={event.googleLink}
                    target="_blank"
                    className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition"
                  >
                    Add to Google Calendar
                  </a>

                </div>

              ))}

            </motion.div>

          </AnimatePresence>

        </div>

      </div>

    </section>
  )
}