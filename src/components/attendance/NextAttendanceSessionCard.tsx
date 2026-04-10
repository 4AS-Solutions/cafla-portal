import Link from "next/link"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { formatDate } from "@/src/lib/utils/format-date"
import type { AttendanceSession } from "@/src/lib/queries/get-attendance-sessions"

export default function NextAttendanceSessionCard({
  session
}: {
  session: AttendanceSession | null
}) {

  if (!session) {
    return (
      <div className="bg-[#0B0F0F] border border-white/10 rounded-2xl p-6 text-gray-400 text-sm">
        No upcoming sessions.
      </div>
    )
  }

  return (
    <div className="
      bg-[#0B0F0F]
      border border-emerald-400/30
      rounded-2xl
      p-6
      flex flex-col justify-between
      shadow-lg shadow-emerald-500/10
    ">

      {/* INFO */}
      <div className="space-y-4">

        <div>
          <p className="text-xs text-emerald-400 uppercase tracking-wider">
            Next Session
          </p>

          <h3 className="text-xl font-semibold text-white">
            {session.title}
          </h3>

          <p className="text-xs text-gray-400">
            {session.session_type}
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-300">

          <div className="flex items-center gap-2">
            <Calendar size={16} />
            {formatDate(session.session_date)}
          </div>

          {session.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {session.location}
            </div>
          )}

        </div>

      </div>

      {/* ACTION 🔥 */}
      <Link
        href={`/admin/attendance/${session.id}`}
        className="
          mt-6
          flex items-center justify-between
          text-sm font-medium
          px-4 py-2
          rounded-xl
          bg-emerald-500
          text-black
          hover:bg-emerald-400
          transition
        "
      >
        Manage Session
        <ArrowRight size={16} />
      </Link>

    </div>
  )
}