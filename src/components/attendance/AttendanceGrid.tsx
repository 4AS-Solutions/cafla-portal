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

    <div className="space-y-6">

      {/* SEARCH */}
      <input
        placeholder="Search referee..."
        className="
          w-full
          bg-black/40
          border border-white/10
          rounded-xl
          px-4 py-2.5
          text-sm text-white placeholder-gray-500
          focus:outline-none focus:border-white/30
        "
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* GRID */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

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