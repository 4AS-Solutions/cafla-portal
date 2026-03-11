"use client"

import { useState } from "react"

type Props = {
  member: {
    id: string
    full_name: string
  }
  sessionId: string
  initialStatus?: string
}

export default function AttendanceMemberCard({
  member,
  sessionId,
  initialStatus
}: Props) {

  const [status, setStatus] = useState(initialStatus)

  async function updateStatus(newStatus: string) {

    setStatus(newStatus)

    await fetch("/api/admin/attendance/update-record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: sessionId,
        member_id: member.id,
        status: newStatus
      })
    })
  }

  return (

    <div className="border rounded-lg p-4 space-y-3 bg-white">

      <div className="font-medium">
        {member.full_name}
      </div>

      <div className="flex gap-2">

        <button
          onClick={() => updateStatus("present")}
          className={`px-2 py-1 text-sm rounded border ${
            status === "present"
              ? "bg-green-600 text-white"
              : ""
          }`}
        >
          Present
        </button>

        <button
          onClick={() => updateStatus("late")}
          className={`px-2 py-1 text-sm rounded border ${
            status === "late"
              ? "bg-yellow-500 text-white"
              : ""
          }`}
        >
          Late
        </button>

        <button
          onClick={() => updateStatus("excused")}
          className={`px-2 py-1 text-sm rounded border ${
            status === "excused"
              ? "bg-blue-600 text-white"
              : ""
          }`}
        >
          Excused
        </button>

      </div>

    </div>
  )
}