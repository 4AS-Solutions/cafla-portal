"use client"

import { useEffect, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"

import AttendanceStatusBadge from "./AttendanceStatusBadge"

export default function AttendanceSessionDialog({
  sessionId,
  open,
  onClose
}: any) {

  const [list, setList] = useState<any[]>([])

  useEffect(() => {

    if (!open) return

    fetch(`/api/attendance/session-list?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => setList(data))

  }, [open, sessionId])

  return (

    <Dialog open={open} onOpenChange={onClose}>

      <DialogContent className="max-w-md">

        <DialogHeader>

          <DialogTitle>
            Session Attendance
          </DialogTitle>

        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">

          {list.map((m, i) => (

            <div
              key={i}
              className="flex justify-between items-center border-b border-white/10 pb-2"
            >

              <span className="text-sm">
                {m.name}
              </span>

              <AttendanceStatusBadge status={m.status} />

            </div>

          ))}

        </div>

      </DialogContent>

    </Dialog>

  )
}