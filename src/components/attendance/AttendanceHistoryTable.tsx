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

export default function AttendanceHistoryTable({ records }: any) {

  const [sessionId, setSessionId] = useState<string | null>(null)

  if (!records || records.length === 0) {
    return <p className="text-gray-500">No attendance records yet.</p>
  }

  return (

    <div className="border rounded-lg overflow-hidden">

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>Date</TableHead>
            <TableHead>Session</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attendance</TableHead>

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

              <TableCell>

                {r.attendance_sessions.title}

              </TableCell>

              <TableCell>

                {r.attendance_sessions.location}

              </TableCell>

              <TableCell className="capitalize">

                {r.status}

              </TableCell>

              <TableCell>

                <button
                  className="text-blue-600 text-sm hover:underline"
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