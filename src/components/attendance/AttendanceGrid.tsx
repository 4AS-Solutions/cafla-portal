"use client"

import { useState } from "react"
import AttendanceMemberCard from "./AttendanceMemberCard"

export default function AttendanceGrid({
  members,
  statusMap,
  sessionId
}: any) {

  const [search, setSearch] = useState("")

  const filtered = members.filter((m: any) =>
    m.full_name.toLowerCase().includes(search.toLowerCase())
  )

  return (

    <div className="space-y-4">

      <input
        placeholder="Search member..."
        className="border p-2 rounded w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid md:grid-cols-3 gap-4">

        {filtered.map((member: any) => (

          <AttendanceMemberCard
            key={member.id}
            member={member}
            sessionId={sessionId}
            initialStatus={statusMap[member.id]}
          />

        ))}

      </div>

    </div>
  )
}