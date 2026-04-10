import Link from "next/link"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import type { AttendanceSession } from "@/src/lib/queries/get-attendance-sessions"
import { formatDate } from '../../lib/utils/format-date';

export default function AttendanceSessionsTable({
  sessions, showAction = true
}: {
  sessions: AttendanceSession[]
  showAction?: boolean
}) {
  
  if (!sessions.length) {
    return (
      <div className="text-sm text-gray-400">
        No attendance sessions yet.
      </div>
    )
  }

  return (

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

      {sessions.map((session) => (

        <div
          key={session.id}
          className="
            group
            bg-[#0D1111]
            border border-white/10
            rounded-2xl
            p-5
            flex flex-col justify-between
            hover:border-emerald-400/40
            hover:shadow-lg hover:shadow-emerald-500/10
            transition
          "
        >

          {/* TOP */}
          <div className="space-y-3">

            {/* TITLE */}
            <div>
              <p className="text-white font-semibold">
                {session.title}
              </p>
              <p className="text-xs text-emerald-400">
                {session.session_type}
              </p>
              <p className="text-xs text-gray-500">
                Created by:{" "}
                {session.created_by_user?.full_name || "Unknown"}
              </p>
            </div>

            {/* META */}
            <div className="space-y-2 text-xs text-gray-400">

              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>
                  {formatDate(session.session_date)}
                </span>
              </div>

              {session.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>{session.location}</span>
                </div>
              )}

            </div>

          </div>

          {/* ACTION */}
          {showAction && (
            <Link
              href={`/admin/attendance/${session.id}`}
              className="
                mt-5
                flex items-center justify-between
                text-sm font-medium
                px-4 py-2
                rounded-xl
                bg-white/5
                border border-white/10
                text-white
                group-hover:bg-emerald-500
                group-hover:text-black
                transition
              "
            >
              Manage Session
              <ArrowRight size={16} />
            </Link>
          )}

        </div>

      ))}

    </div>
  )
}