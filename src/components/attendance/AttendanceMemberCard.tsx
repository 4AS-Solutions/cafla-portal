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

  function getClass(type: string) {

    const base = `
      h-10 rounded-xl text-sm font-semibold
      border transition-all duration-200
      flex items-center justify-center
    `

    // 🔥 ACTIVE STATES (FUERTES)
    if (status === type) {
      switch (type) {
        case "present":
          return `${base} bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30`
        case "excused":
          return `${base} bg-blue-600 text-black border-blue-400 shadow-md shadow-blue-600/30`
        case "late":
          return `${base} bg-yellow-400 text-black border-yellow-300 shadow-md shadow-yellow-400/30`
      }
    }

    // 🔥 INACTIVE (mejor contraste)
    return `${base} bg-white/5 text-gray-300 border-white/10 hover:bg-white/10`
  }

  return (

    <div className="
      bg-[#0D1111]
      border border-white/10
      rounded-2xl
      p-5
      space-y-4
      hover:border-white/20
      hover:bg-[#101616]
      transition
    ">

      <p className="text-sm font-semibold text-white">
        {member.full_name}
      </p>

      <div className="grid grid-cols-3 gap-2">

        <button
          onClick={() => updateStatus("present")}
          className={getClass("present")}
        >
          Present
        </button>

        <button
          onClick={() => updateStatus("excused")}
          className={getClass("excused")}
        >
          Excused
        </button>

        <button
          onClick={() => updateStatus("late")}
          className={getClass("late")}
        >
          Late
        </button>

      </div>

    </div>
  )
}