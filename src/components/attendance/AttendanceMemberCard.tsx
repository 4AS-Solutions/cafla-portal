"use client"

import { useState } from "react"

type AttendanceStatus =
  | "present"
  | "late"
  | "excused"

type Props = {
  member: {
    id: string
    full_name: string
  }
  sessionId: string
  status?: AttendanceStatus
  disabled?: boolean
  onStatusChange: (
    memberId: string,
    status: AttendanceStatus | undefined
  ) => void
}

export default function AttendanceMemberCard({
  member,
  sessionId,
  status,
  disabled = false,
  onStatusChange,
}: Props) {
  const [saving, setSaving] =
    useState(false)

  async function updateStatus(
    newStatus: AttendanceStatus
  ) {
    if (disabled || saving) return

    const previousStatus = status

    onStatusChange(
      member.id,
      newStatus
    )

    setSaving(true)

    try {
      const response = await fetch(
        "/api/admin/attendance/update-record",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            member_id: member.id,
            status: newStatus,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to update attendance."
        )
      }
    } catch (error) {
      /*
       * Si el servidor falla, restauramos
       * exactamente el estado anterior.
       */
      onStatusChange(
        member.id,
        previousStatus
      )

      console.error(
        "[ATTENDANCE] Unable to update member:",
        error
      )
    } finally {
      setSaving(false)
    }
  }

  function getClass(
    type: AttendanceStatus
  ) {
    const base = `
      flex
      h-10
      items-center
      justify-center
      rounded-xl
      border
      text-sm
      font-semibold
      transition-all
      duration-200
      disabled:cursor-not-allowed
      disabled:opacity-50
    `

    if (status === type) {
      switch (type) {
        case "present":
          return `${base} border-emerald-400 bg-emerald-500 text-black shadow-md shadow-emerald-500/30`

        case "late":
          return `${base} border-yellow-300 bg-yellow-400 text-black shadow-md shadow-yellow-400/30`

        case "excused":
          return `${base} border-sky-400 bg-sky-500 text-black shadow-md shadow-sky-500/30`
      }
    }

    return `${base} border-white/10 bg-white/5 text-gray-300 hover:bg-white/10`
  }

  const controlsDisabled =
    disabled || saving

  return (
    <div
      className="
        space-y-4
        rounded-2xl
        border
        border-white/10
        bg-[#0D1111]
        p-5
        transition
        hover:border-white/20
        hover:bg-[#101616]
      "
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-semibold text-white">
          {member.full_name}
        </p>

        {saving && (
          <span className="shrink-0 text-xs text-gray-500">
            Saving...
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={controlsDisabled}
          onClick={() =>
            updateStatus("present")
          }
          className={getClass("present")}
        >
          Present
        </button>

        <button
          type="button"
          disabled={controlsDisabled}
          onClick={() =>
            updateStatus("excused")
          }
          className={getClass("excused")}
        >
          Excused
        </button>

        <button
          type="button"
          disabled={controlsDisabled}
          onClick={() =>
            updateStatus("late")
          }
          className={getClass("late")}
        >
          Late
        </button>
      </div>

      {disabled && (
        <p className="pt-1 text-center text-xs text-gray-500">
          Attendance has not been opened yet.
        </p>
      )}
    </div>
  )
}