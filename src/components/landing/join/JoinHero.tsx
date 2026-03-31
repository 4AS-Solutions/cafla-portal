"use client"

import { CalendarDays, MapPin, Clock } from "lucide-react"

type NextSession = {
  day: string
  date: string
  time: string
  location: string
}

export function JoinHero() {

  // 🔥 MOCK DATA (luego viene de Supabase)
  const nextSession: NextSession = {
    day: "Friday",
    date: "March 14",
    time: "7:00 PM",
    location: "CAFLA Headquarters",
  }

  return (
    <section className="relative py-32 cafla-section overflow-hidden">

      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* TITLE */}
        <h1 className="font-heading text-4xl md:text-6xl text-white mb-6">
          Join CAFLA
        </h1>

        {/* SUBTITLE */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Attend our next training session and learn how to become a referee.
          Meet our team, understand the process, and take your first step into officiating.
        </p>

        {/* 🔥 NEXT SESSION CARD */}
        <div className="cafla-card max-w-2xl mx-auto p-8 rounded-3xl border border-yellow-400/20 bg-white/5 backdrop-blur-md mb-12">

          <p className="text-sm uppercase tracking-[0.25em] text-yellow-400 mb-4">
            Next Session
          </p>

          <h2 className="text-2xl md:text-3xl text-white font-semibold mb-6">
            {nextSession.day} — {nextSession.date}
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-gray-300 text-sm">

            {/* TIME */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              {nextSession.time}
            </div>

            {/* LOCATION */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-yellow-400" />
              {nextSession.location}
            </div>

          </div>

        </div>

        {/* CTA */}
        <a
          href="#join-form"
          className="
            inline-flex items-center gap-3
            bg-gradient-to-r from-yellow-400 to-yellow-500
            text-black font-semibold
            px-10 py-4 rounded-xl
            hover:scale-105 transition duration-300
            shadow-xl shadow-yellow-500/25
          "
        >
          Confirm Attendance
        </a>

      </div>

    </section>
  )
}