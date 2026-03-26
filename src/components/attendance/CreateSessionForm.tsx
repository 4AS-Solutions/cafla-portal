"use client"

import { useState } from "react"

export default function CreateSessionForm() {

  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const res = await fetch("/api/admin/attendance/create-session", {
      method: "POST",
      body: formData
    })

    if (res.ok) {
      location.reload()
    }

    setLoading(false)
  }

  return (

    <form
      onSubmit={handleSubmit}
      className="
        bg-[#0B0F0F]
        border border-white/10
        rounded-2xl
        p-6
        space-y-6
      "
    >

      {/* HEADER */}
      <div>
        <h3 className="text-lg font-semibold text-white">
          Create Attendance Session
        </h3>
        <p className="text-sm text-gray-400">
          Schedule a new training, meeting, or class session
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-4">

        <input
          name="title"
          placeholder="Session title"
          required
          className="
            bg-black/40 border border-white/10 rounded-lg px-3 py-2
            text-sm text-white placeholder-gray-500
            focus:outline-none focus:border-white/30
          "
        />

        <select
          name="session_type"
          required
          className="
            bg-[#0B0F0F] border border-white/10 rounded-lg px-3 py-2
            text-sm text-white
            focus:outline-none focus:border-white/10
          "
        >
          <option value="">Select type</option>
          <option value="Training">Training</option>
          <option value="Meeting">Meeting</option>
          <option value="Class">Class</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="datetime-local"
          name="session_date"
          required
          className="
            bg-black/40 border border-white/10 rounded-lg px-3 py-2
            text-sm text-white
            focus:outline-none focus:border-white/30
          "
        />

        <input
          name="location"
          placeholder="Location"
          className="
            bg-black/40 border border-white/10 rounded-lg px-3 py-2
            text-sm text-white placeholder-gray-500
            focus:outline-none focus:border-white/30
          "
        />

      </div>

      {/* BUTTON */}
      <div className="flex justify-end">

        <button
          disabled={loading}
          className="
            px-5 py-2.5
            rounded-xl
            text-sm font-medium
            bg-emerald-500
            text-black
            hover:bg-emerald-400
            transition
          "
        >
          {loading ? "Creating..." : "Create Session"}
        </button>

      </div>

    </form>
  )
}