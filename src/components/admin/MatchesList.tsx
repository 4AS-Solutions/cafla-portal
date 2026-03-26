"use client"

import { useEffect, useState } from "react"
import MatchesFilters from "./MatchesFilters"
import MatchesSearch from "./MatchesSearch"
import MatchCard from "./MatchCard"

type Match = {
  id: string
  home_team: string
  away_team: string
  league: string
  division: string
  location: string
  field: string
  kickoff_at: string
  report_status: string
}

export default function MatchesList() {

  const [matches, setMatches] = useState<Match[]>([])
  const [filtered, setFiltered] = useState<Match[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  async function fetchMatches() {
    const res = await fetch("/api/admin/matches")
    const data = await res.json()

    setMatches(data.matches)
    setFiltered(data.matches)
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  useEffect(() => {
    let result = [...matches]

    // 🔍 SEARCH
    if (search) {
      result = result.filter(m =>
        `${m.home_team} ${m.away_team} ${m.location}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    }

    // 🎯 FILTER STATUS
    if (statusFilter !== "all") {
      result = result.filter(m => m.report_status === statusFilter)
    }

    setFiltered(result)

  }, [search, statusFilter, matches])

  return (

    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <h1 className="text-xl font-semibold text-white">
          Matches ({filtered.length})
        </h1>

      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-3">

        <MatchesSearch value={search} onChange={setSearch} />

        <MatchesFilters
          status={statusFilter}
          onChange={setStatusFilter}
        />

      </div>

      {/* GRID */}
      <div className="
        grid gap-4
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
      ">

        {filtered.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}

      </div>

    </div>
  )
}