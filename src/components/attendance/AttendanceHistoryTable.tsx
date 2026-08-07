"use client"

import { useState } from "react"
import {
  CalendarDays,
  ChevronRight,
  MapPin,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

import AttendanceSessionDialog from "./AttendanceSessionDialog"
import AttendanceStatusBadge from "./AttendanceStatusBadge"

export default function AttendanceHistoryTable({
  records,
}: any) {
  const [sessionId, setSessionId] =
    useState<string | null>(null)

  if (!records || records.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-8 text-center">
        <p className="text-sm font-medium text-white">
          No attendance records yet
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Your attendance history will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* MOBILE */}
      <div className="space-y-3 md:hidden">

        {records.map((record: any) => (
          <button
            key={record.id}
            type="button"
            onClick={() =>
              setSessionId(record.id)
            }
            className="
              w-full
              rounded-2xl
              border border-white/10
              bg-[#0B0F0F]/80
              p-4
              text-left
              transition-colors
              active:bg-white/[0.05]
            "
          >
            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">
                <p className="font-medium text-white">
                  {record.title}
                </p>

                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <CalendarDays className="h-3.5 w-3.5 text-gray-500" />

                  {new Date(
                    record.session_date
                  ).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </div>

                <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />

                  <span className="truncate">
                    {record.location}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <AttendanceStatusBadge
                  status={record.status}
                />
              </div>

            </div>

            <div className="mt-4 flex items-center justify-end gap-1 border-t border-white/5 pt-3 text-xs font-medium text-yellow-400">
              View Details

              <ChevronRight className="h-3.5 w-3.5" />
            </div>

          </button>
        ))}

      </div>

      {/* DESKTOP */}
      <div className="hidden overflow-hidden rounded-xl border border-white/10 bg-[#0B0F0F]/80 md:block">

        <Table>

          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                Details
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>

            {records.map((record: any) => (
              <TableRow key={record.id}>

                <TableCell>
                  {new Date(
                    record.session_date
                  ).toLocaleDateString("en-US")}
                </TableCell>

                <TableCell className="font-medium">
                  {record.title}
                </TableCell>

                <TableCell className="text-gray-400">
                  {record.location}
                </TableCell>

                <TableCell>
                  <AttendanceStatusBadge
                    status={record.status}
                  />
                </TableCell>

                <TableCell className="text-right">
                  <button
                    type="button"
                    className="text-sm text-yellow-400 hover:underline"
                    onClick={() =>
                      setSessionId(record.id)
                    }
                  >
                    View
                  </button>
                </TableCell>

              </TableRow>
            ))}

          </TableBody>

        </Table>

      </div>

      {sessionId && (
        <AttendanceSessionDialog
          sessionId={sessionId}
          open
          onClose={() =>
            setSessionId(null)
          }
        />
      )}
    </>
  )
}