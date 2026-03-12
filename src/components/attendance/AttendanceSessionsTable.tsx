import Link from "next/link"
import type { AttendanceSession } from "@/src/lib/queries/get-attendance-sessions"

export default function AttendanceSessionsTable({
  sessions
}: {
  sessions: AttendanceSession[]
}) {

  if (!sessions.length) {
    return <p>No attendance sessions yet.</p>
  }

  return (

    <div className="border rounded-lg overflow-hidden">

      <table className="w-full text-sm">

        <thead className="bg-gray-100">

          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Location</th>
            <th className="p-2 text-left"></th>
          </tr>

        </thead>

        <tbody>

          {sessions.map((session) => (

            <tr key={session.id} className="border-t">

              <td className="p-2">{session.title}</td>

              <td className="p-2">{session.session_type}</td>

              <td className="p-2">
                {new Date(session.session_date).toLocaleString("en-US")}
              </td>

              <td className="p-2">{session.location}</td>

              <td className="p-2">

                <Link
                  href={`/admin/attendance/${session.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Manage
                </Link>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  )
}