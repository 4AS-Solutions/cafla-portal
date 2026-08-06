"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CreateSessionForm() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const form = event.currentTarget

    setLoading(true)
    setErrorMessage(null)

    try {
      const formData = new FormData(form)

      const response = await fetch(
        "/api/admin/attendance/create-session",
        {
          method: "POST",
          body: formData,
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to create attendance session."
        )
      }

      form.reset()
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create attendance session."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        space-y-6
        rounded-2xl
        border
        border-white/10
        bg-[#0B0F0F]
        p-6
      "
    >
      {/* HEADER */}
      <div>
        <h3 className="text-lg font-semibold text-white">
          Create Attendance Session
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          Schedule a new training, meeting, class, or special activity.
        </p>
      </div>

      {/* ERROR */}
      {errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* FIELDS */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="attendance-title"
            className="text-sm font-medium text-gray-300"
          >
            Session title
          </label>

          <input
            id="attendance-title"
            name="title"
            type="text"
            placeholder="Example: Field Training"
            required
            disabled={loading}
            className="
              w-full
              rounded-lg
              border
              border-white/10
              bg-black/40
              px-3
              py-2.5
              text-sm
              text-white
              placeholder:text-gray-500
              outline-none
              transition
              focus:border-emerald-500/40
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="attendance-session-type"
            className="text-sm font-medium text-gray-300"
          >
            Session type
          </label>

          <select
            id="attendance-session-type"
            name="session_type"
            required
            disabled={loading}
            defaultValue=""
            className="
              w-full
              rounded-lg
              border
              border-white/10
              bg-[#0B0F0F]
              px-3
              py-2.5
              text-sm
              text-white
              outline-none
              transition
              focus:border-emerald-500/40
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <option value="" disabled>
              Select type
            </option>

            <option value="training">
              Training
            </option>

            <option value="meeting">
              Meeting
            </option>

            <option value="class">
              Class
            </option>

            <option value="special">
              Special
            </option>

            <option value="other">
              Other
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="attendance-session-date"
            className="text-sm font-medium text-gray-300"
          >
            Date and time
          </label>

          <input
            id="attendance-session-date"
            type="datetime-local"
            name="session_date"
            required
            disabled={loading}
            className="
              w-full
              rounded-lg
              border
              border-white/10
              bg-black/40
              px-3
              py-2.5
              text-sm
              text-white
              outline-none
              transition
              focus:border-emerald-500/40
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="attendance-location"
            className="text-sm font-medium text-gray-300"
          >
            Location
          </label>

          <input
            id="attendance-location"
            name="location"
            type="text"
            placeholder="Example: Rosewood Park"
            disabled={loading}
            className="
              w-full
              rounded-lg
              border
              border-white/10
              bg-black/40
              px-3
              py-2.5
              text-sm
              text-white
              placeholder:text-gray-500
              outline-none
              transition
              focus:border-emerald-500/40
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />
        </div>
      </div>

      {/* SCORE OPTION */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
        <input
          type="checkbox"
          name="counts_for_score"
          defaultChecked
          disabled={loading}
          className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500"
        />

        <span>
          <span className="block text-sm font-medium text-white">
            Counts toward attendance score
          </span>

          <span className="mt-1 block text-xs leading-relaxed text-gray-500">
            Disable this for social or optional activities that should appear
            in the history but should not affect referee development metrics.
          </span>
        </span>
      </label>

      {/* BUTTON */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="
            rounded-xl
            bg-emerald-500
            px-5
            py-2.5
            text-sm
            font-medium
            text-black
            transition
            hover:bg-emerald-400
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {loading
            ? "Creating..."
            : "Create Session"}
        </button>
      </div>
    </form>
  )
}