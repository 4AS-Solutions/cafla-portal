import { getSessions } from "@/src/lib/queries/get-sessions"

import {
  Clock,
  MapPin,
} from "lucide-react"

import {
  formatFullDate,
  formatSessionTime,
  getAddress,
  getNextSession,
} from "@/src/lib/utils/session-utils"

export async function JoinHero() {

  // 🔥 FETCH SESSIONS
  const sessionsRaw = await getSessions()

  // 🔥 CENTRALIZED SESSION LOGIC
  const nextSession = getNextSession(sessionsRaw)

  return (
    <section className="relative py-32 cafla-section overflow-hidden">

      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* EYEBROW */}
        <p className="text-sm uppercase tracking-[0.3em] text-yellow-400 mb-6">
          Structured Referee Development Since 1962
        </p>

        {/* TITLE */}
        <h1 className="font-heading text-4xl md:text-6xl text-white mb-6">
          Join CAFLA
        </h1>

        {/* SUBTITLE */}
        <div className="max-w-3xl mx-auto mb-12 space-y-5">

          <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
            CAFLA develops soccer referees through structured instruction,
            mentorship, fitness preparation, and official match experience.
          </p>

          <p className="text-gray-400 text-base md:text-lg leading-relaxed">
            Attend an upcoming training session to learn about the referee
            development process, certification pathway, expectations, and
            opportunities within CAFLA.
          </p>

        </div>

        {/* NEXT SESSION */}
        {nextSession && (

          <div className="
            cafla-card
            max-w-2xl
            mx-auto
            p-8
            rounded-3xl
            border border-yellow-400/20
            bg-white/5
            backdrop-blur-md
            mb-12
          ">

            {/* LABEL */}
            <p className="text-sm uppercase tracking-[0.25em] text-yellow-400 mb-4">
              Next Training Session
            </p>

            {/* DATE */}
            <h2 className="text-2xl md:text-3xl text-white font-semibold mb-2">
              {formatFullDate(nextSession.session_date)}
            </h2>

            {/* SESSION TITLE */}
            <p className="text-lg text-gray-300 mb-2">
              {nextSession.title}
            </p>

            <p className="text-sm text-gray-300 mb-6">
              {nextSession.location}
            </p>

            {/* META */}
            <div className="
              flex
              flex-col
              md:flex-row
              items-center
              justify-center
              gap-6
              text-gray-300
              text-sm
            ">

              {/* TIME */}
              <div className="flex items-center gap-2">

                <Clock className="w-4 h-4 text-yellow-400" />

                <span>
                  {formatSessionTime(nextSession.session_date)}
                </span>

              </div>

              {/* LOCATION */}
              <div className="flex items-center gap-2">

                <MapPin className="w-4 h-4 text-yellow-400" />

                <span>
                  {getAddress(nextSession)}
                </span>

              </div>

            </div>

            {/* NOTE */}
            <p className="
              text-xs
              text-gray-500
              mt-6
              max-w-md
              mx-auto
              leading-relaxed
            ">
              New referee candidates are welcome to attend this session and
              learn more about the CAFLA referee development program.
            </p>

          </div>

        )}

        {/* CTA */}
        <a
          href="#join-form"
          className="
            inline-flex items-center justify-center
            bg-gradient-to-r
            from-yellow-400
            to-yellow-500
            text-black
            font-semibold
            px-10 py-4
            rounded-xl
            hover:scale-105
            transition duration-300
            shadow-xl shadow-yellow-500/25
          "
        >
          Reserve Your Spot
        </a>

      </div>

    </section>
  )
}