"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"

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

      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            Session Attendance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">

          {list.map((m, i) => (

            <div
              key={i}
              className="flex justify-between border-b pb-1"
            >
              <span>{m.name}</span>
              <span className="capitalize text-sm">
                {m.status}
              </span>
            </div>

          ))}

        </div>

      </DialogContent>

    </Dialog>

  )
}