"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  Trophy,
} from "lucide-react"
import { useRouter } from "next/navigation"

type Season = {
  id: string
  term: string
  year: number
  status: string
  label: string
}

type DivisionSeason = {
  id: string
  divisionId: string
  divisionName: string
  seasonId: string
  seasonTerm: string
  seasonYear: number
  seasonStatus: string
  seasonLabel: string
  label: string
}

type Standing = {
  position: number
  teamRegistrationId: string
  teamId: string
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  forfeits: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  totalPoints: number
}

type TournamentOptionsResponse = {
  success: boolean
  seasons: Season[]
  divisionSeasons: DivisionSeason[]
  error?: string
}

type StandingsResponse = {
  success: boolean
  competition: {
    seasonId: string
    seasonLabel: string
    divisionId: string
    divisionSeasonId: string
    divisionName: string
  } | null
  standings: Standing[]
  error?: string
}

function formatGoalDifference(value: number) {
  if (value > 0) return `+${value}`
  return String(value)
}

export default function CompetitionCenter() {
  const router = useRouter()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [divisionSeasons, setDivisionSeasons] =
    useState<DivisionSeason[]>([])

  const [selectedSeasonId, setSelectedSeasonId] = useState("")
  const [selectedDivisionSeasonId, setSelectedDivisionSeasonId] =
    useState("")

  const [standings, setStandings] = useState<Standing[]>([])

  const [loadingOptions, setLoadingOptions] = useState(true)
  const [loadingStandings, setLoadingStandings] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const availableDivisions = useMemo(
    () =>
      divisionSeasons
        .filter(
          (divisionSeason) =>
            divisionSeason.seasonId === selectedSeasonId
        )
        .sort((a, b) =>
          a.divisionName.localeCompare(b.divisionName)
        ),
    [divisionSeasons, selectedSeasonId]
  )

  const selectedDivision = availableDivisions.find(
    (division) => division.id === selectedDivisionSeasonId
  )

  useEffect(() => {
    async function loadTournamentOptions() {
      setLoadingOptions(true)
      setErrorMessage(null)

      try {
        const response = await fetch(
          "/api/admin/tournaments/division-seasons"
        )

        const data =
          (await response.json()) as TournamentOptionsResponse

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load competition options."
          )
        }

        const loadedSeasons = data.seasons ?? []
        const loadedDivisionSeasons = data.divisionSeasons ?? []

        setSeasons(loadedSeasons)
        setDivisionSeasons(loadedDivisionSeasons)

        const activeSeason =
          loadedSeasons.find(
            (season) => season.status === "active"
          ) ?? loadedSeasons[0]

        if (!activeSeason) {
          return
        }

        setSelectedSeasonId(activeSeason.id)

        const firstDivision =
          loadedDivisionSeasons
            .filter(
              (divisionSeason) =>
                divisionSeason.seasonId === activeSeason.id
            )
            .sort((a, b) =>
              a.divisionName.localeCompare(b.divisionName)
            )[0] ?? null

        setSelectedDivisionSeasonId(firstDivision?.id ?? "")
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load competition options."
        )
      } finally {
        setLoadingOptions(false)
      }
    }

    void loadTournamentOptions()
  }, [])

  useEffect(() => {
    if (!selectedSeasonId || !selectedDivisionSeasonId) {
      setStandings([])
      return
    }

    async function loadStandings() {
      setLoadingStandings(true)
      setErrorMessage(null)

      try {
        const params = new URLSearchParams({
          seasonId: selectedSeasonId,
          divisionSeasonId: selectedDivisionSeasonId,
        })

        const response = await fetch(
          `/api/competition/standings?${params.toString()}`
        )

        const data =
          (await response.json()) as StandingsResponse

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load standings."
          )
        }

        setStandings(data.standings ?? [])
      } catch (error) {
        setStandings([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load standings."
        )
      } finally {
        setLoadingStandings(false)
      }
    }

    void loadStandings()
  }, [selectedSeasonId, selectedDivisionSeasonId])

  function handleSeasonChange(seasonId: string) {
    setSelectedSeasonId(seasonId)

    const firstDivision =
      divisionSeasons
        .filter(
          (divisionSeason) =>
            divisionSeason.seasonId === seasonId
        )
        .sort((a, b) =>
          a.divisionName.localeCompare(b.divisionName)
        )[0] ?? null

    setSelectedDivisionSeasonId(firstDivision?.id ?? "")
  }

  if (loadingOptions) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-[#0B0F0F]/80">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading competition data...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
              Season
            </label>

            <select
              value={selectedSeasonId}
              onChange={(event) =>
                handleSeasonChange(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-white/10 bg-[#071f1c] px-4 text-sm text-white outline-none transition focus:border-emerald-500/40"
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.label}
                  {season.status === "active" ? " — Active" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
              Division
            </label>

            <select
              value={selectedDivisionSeasonId}
              onChange={(event) =>
                setSelectedDivisionSeasonId(event.target.value)
              }
              disabled={availableDivisions.length === 0}
              className="h-11 w-full rounded-xl border border-white/10 bg-[#071f1c] px-4 text-sm text-white outline-none transition focus:border-emerald-500/40 disabled:opacity-50"
            >
              {availableDivisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.divisionName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/80">
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />

              <h2 className="font-semibold text-white">
                {selectedDivision?.divisionName ?? "Standings"}
              </h2>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              {selectedDivision?.seasonLabel ?? "Select a competition."}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-300">
                Top 4 advance to playoffs
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedDivisionSeasonId((current) => current)
            }}
            disabled={loadingStandings}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                loadingStandings ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {loadingStandings ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating standings...
            </div>
          </div>
        ) : standings.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center px-6 text-center">
            <div>
              <p className="font-medium text-white">
                No standings available
              </p>

              <p className="mt-1 text-sm text-gray-500">
                This division does not have registered teams yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.025] text-left text-[11px] uppercase tracking-[0.16em] text-gray-500">
                  <th className="px-5 py-3 text-center">Pos</th>
                  <th className="px-5 py-3">Team</th>
                  <th className="px-3 py-3 text-center">PJ</th>
                  <th className="px-3 py-3 text-center">PG</th>
                  <th className="px-3 py-3 text-center">PE</th>
                  <th className="px-3 py-3 text-center">PP</th>
                  <th className="px-3 py-3 text-center">GF</th>
                  <th className="px-3 py-3 text-center">GC</th>
                  <th className="px-3 py-3 text-center">DG</th>
                  <th className="px-5 py-3 text-center">PTS</th>
                </tr>
              </thead>

              <tbody>
                {standings.map((standing) => (
                  <tr
                    key={standing.teamRegistrationId}
                    className={`
                      border-b border-white/5
                      text-sm transition
                      last:border-b-0
                      hover:bg-white/[0.035]

                      ${
                        standing.position <= 4
                          ? "bg-emerald-500/[0.035]"
                          : ""
                      }

                      ${
                        standing.position === 4
                          ? "border-b-2 border-b-cyan-500/30"
                          : ""
                      }
                    `}
                  >
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`
                          inline-flex h-8 min-w-8
                          items-center justify-center
                          rounded-full px-2
                          text-xs font-bold
                          ring-1

                          ${
                            standing.position === 1
                              ? `
                                bg-yellow-400/15
                                text-yellow-300
                                ring-yellow-400/30
                                shadow-[0_0_18px_rgba(250,204,21,0.12)]
                              `
                              : standing.position === 2
                                ? `
                                  bg-slate-300/10
                                  text-slate-200
                                  ring-slate-300/20
                                `
                                : standing.position === 3
                                  ? `
                                    bg-emerald-500/15
                                    text-emerald-300
                                    ring-emerald-500/25
                                  `
                                  : standing.position === 4
                                    ? `
                                      bg-cyan-500/10
                                      text-cyan-300
                                      ring-cyan-500/20
                                    `
                                    : `
                                      bg-white/5
                                      text-gray-400
                                      ring-white/5
                                    `
                          }
                        `}
                      >
                        {standing.position}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/portal/competition/teams/${standing.teamRegistrationId}`
                          )
                        }
                        className="font-medium text-white transition hover:text-emerald-300 cursor-pointer"
                      >
                        {standing.teamName}
                      </button>
                    </td>

                    <td className="px-3 py-4 text-center text-gray-300">
                      {standing.played}
                    </td>

                    <td className="px-3 py-4 text-center text-gray-300">
                      {standing.won}
                    </td>

                    <td className="px-3 py-4 text-center text-gray-300">
                      {standing.drawn}
                    </td>

                    <td className="px-3 py-4 text-center text-gray-300">
                      {standing.lost}
                    </td>

                    <td className="px-3 py-4 text-center text-gray-300">
                      {standing.goalsFor}
                    </td>

                    <td className="px-3 py-4 text-center text-gray-300">
                      {standing.goalsAgainst}
                    </td>

                    <td
                      className={`
                        px-3 py-4 text-center font-medium
                        ${
                          standing.goalDifference > 0
                            ? "text-emerald-400"
                            : standing.goalDifference < 0
                              ? "text-red-400"
                              : "text-gray-400"
                        }
                      `}
                    >
                      {formatGoalDifference(
                        standing.goalDifference
                      )}
                    </td>

                    <td className="px-5 py-4 text-center text-base font-bold text-yellow-300">
                      {standing.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}