"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ClipboardCheck, Loader2 } from "lucide-react"

type OpenAttendanceButtonProps = {
  sessionId: string
}

export default function OpenAttendanceButton({
  sessionId,
}: OpenAttendanceButtonProps) {
  const router = useRouter()

  const [loading, setLoading] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  async function openAttendance() {
    setLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch(
        `/api/admin/attendance/${sessionId}/open`,
        {
          method: "POST",
        }
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to open attendance."
        )
      }

      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to open attendance."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={openAttendance}
        className="
          inline-flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-emerald-500
          px-5
          py-2.5
          text-sm
          font-semibold
          text-black
          transition
          hover:bg-emerald-400
          disabled:cursor-not-allowed
          disabled:opacity-60
          sm:w-auto
        "
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ClipboardCheck className="h-4 w-4" />
        )}

        {loading
          ? "Opening..."
          : "Open Attendance"}
      </button>

      {errorMessage && (
        <p className="max-w-xs text-sm text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  )
}