import { getSessions } from "@/src/lib/queries/get-sessions"
import {
  CalendarDays,
  MapPin,
  Clock,
} from "lucide-react"

export async function Calendar() {

  const now = new Date()

  // ✅ SAFE DATE PARSER (SIN timezone hacks)
  function parseLocalDate(dateString: string) {
    if (!dateString) return new Date()

    // 🔥 IMPORTANTE: forzar que sea tratado como LA time
    const fixed = dateString.replace(" ", "T") + "-07:00"

    return new Date(fixed)
  }

  // 🔥 GET + CLEAN + FILTER
  const sessionsRaw = await getSessions()

  const sessions = sessionsRaw
    .filter((s: any) => s?.session_date)
    .map((s: any) => ({
      ...s,
      dateObj: parseLocalDate(s.session_date),
    }))
    .filter((s: any) => s.dateObj.getTime() + 15 * 60 * 1000 >= now.getTime())
    .sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime())

  const nextSession = sessions[0]

  // 🔥 ADDRESS MAPPING
  function getAddress(session: any) {
    if (session.location === "CAFLA") {
      return "5914 E. Washington Blvd, Commerce, CA 90040"
    }

    if (session.location === "Rosewood Park") {
      return "5600 Harbor St, Commerce, CA 90040"
    }

    return session.address || "Location details provided in session"
  }

  // 🔥 UNIFORM LOGIC
  function getUniformSet(session: any) {
    const day = parseLocalDate(session?.session_date).getDay()

    if (day === 1) {
      return [
        "/images/uniforms/monday-shirt.png",
        "/images/uniforms/short-training.png",
      ]
    }

    if (day === 4) {
      return [
        "/images/uniforms/thursday-shirt.png",
        "/images/uniforms/short-training.png",
      ]
    }

    if (day === 5) {
      return [
        "/images/uniforms/friday-jacket.png",
        "/images/uniforms/friday-shirt.png",
        "/images/uniforms/friday-pants.png",
        "/images/uniforms/friday-short.png",
        "/images/uniforms/friday-sweater.png",
      ]
    }

    return ["/images/uniforms/short-training.png"]
  }

  // 🔥 DATE FORMAT (CON timezone correcto)
  function formatFullDate(dateString: string) {
    const date = parseLocalDate(dateString)

    return date.toLocaleDateString("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <section
      id="calendar"
      className="relative py-28 cafla-section overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16">

          <h2 className="text-4xl md:text-5xl text-white font-bold mb-6">
            Training & Referee Schedule
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Stay updated with training sessions, meetings, and referee development activities.
          </p>

        </div>

        {/* NEXT SESSION */}
        {nextSession && (

          <div className="mb-20 text-center">

            <p className="text-sm text-yellow-400 uppercase tracking-wide mb-2">
              Next Session
            </p>

            <p className="text-white text-xl font-semibold mb-2">
              {formatFullDate(nextSession.session_date)}
            </p>

            <p className="text-lg text-white font-medium mb-1">
              {nextSession.title}
            </p>

            <p className="text-gray-400 mb-1">
              {parseLocalDate(nextSession.session_date).toLocaleTimeString("en-US", {
                timeZone: "America/Los_Angeles",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            <p className="text-gray-400 text-sm mb-6">
              {getAddress(nextSession)}
            </p>

            {/* UNIFORM */}
            <div className="flex justify-center">

              <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">

                <p className="text-xs text-yellow-400 uppercase tracking-wide mb-4 text-center">
                  Required Uniform
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

                  {getUniformSet(nextSession).map((img, i) => (

                    <div
                      key={i}
                      className="rounded-xl overflow-hidden border border-white/10 bg-black/30 p-2 hover:scale-105 hover:border-yellow-400/30 transition"
                    >
                      <img
                        src={img}
                        className="w-full h-24 object-contain"
                      />
                    </div>

                  ))}

                </div>

                <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed max-w-md mx-auto">
                  Note: If you are new and do not yet have the official uniform, please try to wear colors that closely match the standard referee attire.
                </p>

              </div>

            </div>

          </div>

        )}

        {/* FUTURE SESSIONS */}
        <div>

          <div className="text-center mb-12">

            <p className="text-sm text-yellow-400 uppercase tracking-wide mb-2">
              Upcoming Sessions
            </p>

            <h3 className="text-3xl font-bold text-white">
              Training, Meetings & Classes
            </h3>

          </div>

          <div className="overflow-x-auto pb-4">

            <div className="flex gap-6 w-max">

              {sessions.map((event: any, i: number) => {

                const date = parseLocalDate(event.session_date)

                return (

                  <div
                    key={i}
                    className="min-w-[260px] cafla-card p-6 rounded-xl flex-shrink-0 hover:scale-[1.04] transition-all"
                  >

                    <div className="flex items-center gap-2 text-yellow-400 mb-3">

                      <CalendarDays className="w-4 h-4" />

                      <span className="text-sm font-semibold">
                        {formatFullDate(event.session_date)}
                      </span>

                    </div>

                    <h3 className="text-white font-semibold mb-2">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>

                    <p className="text-gray-500 text-xs mb-2">
                      {getAddress(event)}
                    </p>

                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      {date.toLocaleTimeString("en-US", {
                        timeZone: "America/Los_Angeles",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                  </div>

                )

              })}

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}