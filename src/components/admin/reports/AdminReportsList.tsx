"use client"

import { useState } from "react"
import AdminReportsFilters from "./AdminReportsFilters"
import AdminReportCard from "./AdminReportCard"


export default function AdminReportsList({ reports }: any) {

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")

  const filtered = reports.filter((r: any) => {

    const text = `${r.matches?.home_team} ${r.matches?.away_team}`.toLowerCase()

    const matchesSearch = text.includes(search.toLowerCase())
    const matchesStatus = status === "all" || r.status === status

    return matchesSearch && matchesStatus
  })

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="text-sm text-gray-400">
          {filtered.length} reports
        </div>

      </div>

      <AdminReportsFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />

      {/* GRID */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

        {filtered.map((report: any) => (
          <AdminReportCard key={report.id} report={report} />
        ))}

      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400">
          No reports found.
        </p>
      )}

    </div>
  )
}