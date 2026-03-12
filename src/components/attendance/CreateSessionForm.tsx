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

    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded-lg">

      <h3 className="font-semibold">
        Create Attendance Session
      </h3>

      <input
        name="title"
        placeholder="Session title"
        required
        className="border p-2 rounded w-full"
      />

      <select
        name="session_type"
        required
        className="border p-2 rounded w-full"
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
        className="border p-2 rounded w-full"
      />

      <input
        name="location"
        placeholder="Location"
        className="border p-2 rounded w-full"
      />

      <button
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Creating..." : "Create Session"}
      </button>

    </form>

  )
}