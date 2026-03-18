"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function MembersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [role, setRole] = useState("all")

  useEffect(() => {
    setSearch(searchParams.get("search") || "")
    setStatus(searchParams.get("status") || "all")
    setRole(searchParams.get("role") || "all")
  }, [searchParams])

  function updateURL(next: any) {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key)
      } else {
        params.set(key, value as string)
      }
    })

    router.push(`/admin/members?${params.toString()}`)
  }

  return (
    <div className="card-pro p-4 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">

      {/* LEFT SIDE */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">

        {/* SEARCH */}
        <input
          placeholder="Search member..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            updateURL({ search: e.target.value })
          }}
          className="
            w-full sm:w-64 px-3 py-2 rounded-lg
            bg-[#071f1c]
            border border-white/10
            text-sm text-white
            focus:outline-none
            focus:ring-2 focus:ring-emerald-500
          "
        />

        {/* STATUS */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            updateURL({ status: e.target.value })
          }}
          className="
            w-full sm:w-40 px-3 py-2 rounded-lg
            bg-[#071f1c]
            border border-white/10
            text-sm text-white
            focus:outline-none
          "
        >
          <option value="all">Status</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>

        {/* ROLE */}
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value)
            updateURL({ role: e.target.value })
          }}
          className="
            w-full sm:w-40 px-3 py-2 rounded-lg
            bg-[#071f1c]
            border border-white/10
            text-sm text-white
            focus:outline-none
          "
        >
          <option value="all">Role</option>
          <option value="member">Member</option>
          <option value="board">Board</option>
        </select>

      </div>

      {/* RIGHT SIDE (future ready) */}
      <div className="text-xs text-gray-400 hidden lg:block">
        Filters
      </div>

    </div>
  )
}