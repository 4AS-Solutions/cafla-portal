"use client"

import { useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table"

import AttendanceSessionDialog from "./AttendanceSessionDialog"
import AttendanceStatusBadge from "./AttendanceStatusBadge"

export default function AttendanceHistoryTable({ records }: any) {

  const [sessionId, setSessionId] = useState<string | null>(null)

  if (!records || records.length === 0) {
    return <p className="text-gray-500">No attendance records yet.</p>
  }

  return (

    <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0B0F0F]/80">

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>Date</TableHead>
            <TableHead>Session</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Details</TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {records.map((r: any) => (

            <TableRow key={r.attendance_sessions.id}>

              <TableCell>

                {new Date(
                  r.attendance_sessions.session_date
                ).toLocaleDateString("en-US")}

              </TableCell>

              <TableCell className="font-medium">

                {r.attendance_sessions.title}

              </TableCell>

              <TableCell className="text-gray-400">

                {r.attendance_sessions.location}

              </TableCell>

              <TableCell>

                <AttendanceStatusBadge status={r.status} />

              </TableCell>

              <TableCell className="text-right">

                <button
                  className="text-sm text-yellow-400 hover:underline"
                  onClick={() =>
                    setSessionId(r.attendance_sessions.id)
                  }
                >
                  View
                </button>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

      {sessionId && (

        <AttendanceSessionDialog
          sessionId={sessionId}
          open={true}
          onClose={() => setSessionId(null)}
        />

      )}

    </div>

  )
}