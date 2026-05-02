"use client"

import { useRouter, useSearchParams } from "next/navigation"
import AttendanceSessionsTable from "./AttendanceSessionsTable"

export default function PastAttendanceSessions({
  sessions,
  total,
  page,
  limit
}: {
  sessions: any[]
  total: number
  page: number
  limit: number
}) {

  const router = useRouter()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(total / limit)

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`?${params.toString()}`)
  }

  if (!sessions.length) return null

  return (
    <div className="space-y-6">

      <h3 className="text-lg text-white font-semibold">
        Past Sessions
      </h3>

      <AttendanceSessionsTable sessions={sessions} />

      {/* PAGINATION */}
      <div className="flex items-center justify-between">

        <button
          disabled={page === 0}
          onClick={() => goToPage(page - 1)}
          className="px-4 py-2 rounded-lg bg-white/5 text-sm text-white disabled:opacity-30"
        >
          Previous
        </button>

        <p className="text-sm text-gray-400">
          Page {page + 1} of {totalPages}
        </p>

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => goToPage(page + 1)}
          className="px-4 py-2 rounded-lg bg-white/5 text-sm text-white disabled:opacity-30"
        >
          Next
        </button>

      </div>

    </div>
  )
}