"use client"

import { useMemo, useState } from "react"

import AttendanceMemberCard from "./AttendanceMemberCard"

type AttendanceStatus =
  | "present"
  | "late"
  | "excused"

type AttendanceMember = {
  id: string
  full_name: string
}

type AttendanceGridProps = {
  members: AttendanceMember[]
  statusMap: Record<
    string,
    AttendanceStatus | undefined
  >
  sessionId: string
  disabled?: boolean
}

export default function AttendanceGrid({
  members,
  statusMap,
  sessionId,
  disabled = false,
}: AttendanceGridProps) {
  const [search, setSearch] = useState("")

  /*
   * Esta copia local conserva todas las selecciones,
   * aunque una tarjeta desaparezca temporalmente
   * debido al buscador.
   */
  const [statuses, setStatuses] = useState<
    Record<string, AttendanceStatus | undefined>
  >(() => ({ ...statusMap }))

  const filteredMembers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    if (!normalizedSearch) {
      return members
    }

    return members.filter((member) =>
      member.full_name
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [members, search])

  function updateLocalStatus(
    memberId: string,
    status: AttendanceStatus | undefined
  ) {
    setStatuses((current) => ({
      ...current,
      [memberId]: status,
    }))
  }

  return (
    <div className="space-y-6">
      <input
        type="search"
        placeholder="Search referee..."
        disabled={disabled}
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        className="
          w-full
          rounded-xl
          border
          border-white/10
          bg-black/40
          px-4
          py-2.5
          text-sm
          text-white
          placeholder:text-gray-500
          outline-none
          transition
          focus:border-white/30
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      />

      {filteredMembers.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-8 text-center text-sm text-gray-500">
          No referees found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((member) => (
            <AttendanceMemberCard
              key={member.id}
              member={member}
              sessionId={sessionId}
              status={statuses[member.id]}
              disabled={disabled}
              onStatusChange={
                updateLocalStatus
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}