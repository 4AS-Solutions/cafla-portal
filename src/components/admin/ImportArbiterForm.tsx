"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import { toast } from "sonner"

import RefereeSelect from "../shared/RefereeSelect"

type ArbiterGameStatus =
  | "ok"
  | "duplicate_db"
  | "duplicate_file"

type ArbiterGame = {
  game_id: string
  kickoff: string
  division: string
  league: string
  site: string
  home: string
  away: string
  comments: string
  center_referee: string
  ar1: string
  ar2: string
  status?: ArbiterGameStatus

  /*
   * Internal tournament context selected in CAFLA.
   */
  tournament_division_season_id: string | null
}

type Member = {
  id: string
  full_name: string
}

type TournamentSeason = {
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

type TournamentOptionsResponse = {
  success: boolean
  seasons: TournamentSeason[]
  divisionSeasons: DivisionSeason[]
  error?: string
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

/*
 * Maps the division name received from Arbiter
 * to the permanent internal CAFLA division.
 *
 * Ambiguous divisions intentionally return null.
 */
function getMappedDivisionName(
  arbiterDivision: string
): string | null {
  const normalized =
    normalizeText(arbiterDivision)

  const mappings: Record<string, string> = {
    // Monday
    "7 v 7 monday": "Monday 7s",
    "7v7 monday": "Monday 7s",
    "monday 7v7": "Monday 7s",
    "monday 9v9": "Monday 7s",

    // Tuesday
    "30+ tuesday": "Tuesday 30+ A",
    "30+ b tuesday": "Tuesday 30+ B",

    // Wednesday
    "48+ wednesday": "Wednesday 48+",

    // Thursday / Friday
    "7 v 7 thursday": "Thursday 7s",
    "7v7 thursday": "Thursday 7s",
    "7 v 7 friday": "Friday 7s",
    "7v7 friday": "Friday 7s",

    // Sunday divisions
    "first am": "First AM",
    "minor am": "Minor AM",
    "minor pm": "Minor PM",
    "major am": "Major AM",
    "metro am": "Metro AM",
    "metro pm": "Metro PM",
    "super metro": "Super Metro",
  }

  return mappings[normalized] ?? null
}

function resolveDivisionSeasonId({
  arbiterDivision,
  seasonId,
  divisionSeasons,
}: {
  arbiterDivision: string
  seasonId: string
  divisionSeasons: DivisionSeason[]
}) {
  const seasonDivisions =
    divisionSeasons.filter(
      (item) => item.seasonId === seasonId
    )

  const mappedDivisionName =
    getMappedDivisionName(arbiterDivision)

  /*
   * First try the explicit Arbiter → CAFLA mapping.
   */
  if (mappedDivisionName) {
    const mappedDivision =
      seasonDivisions.find(
        (item) =>
          normalizeText(item.divisionName) ===
          normalizeText(mappedDivisionName)
      )

    if (mappedDivision) {
      return mappedDivision.id
    }
  }

  /*
   * Fallback: direct normalized-name match.
   *
   * This also handles values such as:
   * "First  AM" → "First AM".
   */
  const exactDivision =
    seasonDivisions.find(
      (item) =>
        normalizeText(item.divisionName) ===
        normalizeText(arbiterDivision)
    )

  return exactDivision?.id ?? null
}

export default function ImportArbiterForm() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null)

  const [file, setFile] =
    useState<File | null>(null)

  const [preview, setPreview] =
    useState<ArbiterGame[] | null>(null)

  const [members, setMembers] =
    useState<Member[]>([])

  const [seasons, setSeasons] =
    useState<TournamentSeason[]>([])

  const [
    divisionSeasons,
    setDivisionSeasons,
  ] = useState<DivisionSeason[]>([])

  const [
    selectedSeasonId,
    setSelectedSeasonId,
  ] = useState("")

  const [
    loadingTournamentOptions,
    setLoadingTournamentOptions,
  ] = useState(false)

  const [
    loadingPreview,
    setLoadingPreview,
  ] = useState(false)

  const [
    loadingImport,
    setLoadingImport,
  ] = useState(false)

  const [message, setMessage] =
    useState<string | null>(null)

  const divisionsForSelectedSeason =
    divisionSeasons
      .filter(
        (item) =>
          item.seasonId === selectedSeasonId
      )
      .sort((a, b) =>
        a.divisionName.localeCompare(
          b.divisionName
        )
      )

  const unresolvedMatches =
    preview?.filter(
      (game) =>
        !game.tournament_division_season_id
    ) ?? []

  const hasUnresolvedMatches =
    unresolvedMatches.length > 0

  async function loadTournamentOptions() {
    setLoadingTournamentOptions(true)

    try {
      const response = await fetch(
        "/api/admin/tournaments/division-seasons"
      )

      const data =
        (await response.json()) as
          TournamentOptionsResponse

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to load tournament information."
        )
      }

      const loadedSeasons =
        data.seasons ?? []

      const loadedDivisionSeasons =
        data.divisionSeasons ?? []

      setSeasons(loadedSeasons)

      setDivisionSeasons(
        loadedDivisionSeasons
      )

      const activeSeason =
        loadedSeasons.find(
          (season) =>
            season.status === "active"
        )

      const defaultSeasonId =
        activeSeason?.id ||
        loadedSeasons[0]?.id ||
        ""

      setSelectedSeasonId(
        (currentValue) =>
          currentValue || defaultSeasonId
      )

      return {
        seasons: loadedSeasons,
        divisionSeasons:
          loadedDivisionSeasons,
        defaultSeasonId,
      }
    } finally {
      setLoadingTournamentOptions(false)
    }
  }

  useEffect(() => {
    void loadTournamentOptions().catch(
      (error) => {
        console.error(error)

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to load tournament information."

        setMessage(errorMessage)
      }
    )
  }, [])

  async function handlePreview() {
    if (!file) {
      setMessage(
        "Please select a file first."
      )
      return
    }

    setLoadingPreview(true)
    setMessage(null)

    try {
      let availableDivisionSeasons =
        divisionSeasons

      let seasonId =
        selectedSeasonId

      /*
       * Safety fallback in case the user requests
       * the preview before the initial options request
       * has completed.
       */
      if (
        availableDivisionSeasons.length === 0 ||
        !seasonId
      ) {
        const tournamentData =
          await loadTournamentOptions()

        availableDivisionSeasons =
          tournamentData.divisionSeasons

        seasonId =
          tournamentData.defaultSeasonId
      }

      if (!seasonId) {
        throw new Error(
          "No tournament season is available."
        )
      }

      const form = new FormData()
      form.append("file", file)

      const [
        previewResponse,
        membersResponse,
      ] = await Promise.all([
        fetch(
          "/api/admin/import-arbiter/preview",
          {
            method: "POST",
            body: form,
          }
        ),

        fetch(
          "/api/admin/members/all"
        ),
      ])

      const previewData =
        await previewResponse.json()

      const membersData =
        await membersResponse.json()

      if (!previewResponse.ok) {
        throw new Error(
          previewData.error ||
            "Failed to parse file."
        )
      }

      if (!membersResponse.ok) {
        throw new Error(
          membersData.error ||
            "Failed to load members."
        )
      }

      const mappedGames: ArbiterGame[] =
        previewData.games.map(
          (
            game: Omit<
              ArbiterGame,
              "tournament_division_season_id"
            >
          ) => ({
            ...game,

            tournament_division_season_id:
              resolveDivisionSeasonId({
                arbiterDivision:
                  game.division,
                seasonId,
                divisionSeasons:
                  availableDivisionSeasons,
              }),
          })
        )

      setSelectedSeasonId(seasonId)
      setPreview(mappedGames)

      setMembers(
        membersData.members ?? []
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to preview matches."

      setMessage(errorMessage)
    } finally {
      setLoadingPreview(false)
    }
  }

  async function handleImport() {
    if (
      !preview ||
      preview.length === 0
    ) {
      setMessage(
        "No matches to import."
      )
      return
    }

    if (!selectedSeasonId) {
      setMessage(
        "Please select a tournament season."
      )
      return
    }

    const missingContext =
      preview.filter(
        (game) =>
          !game
            .tournament_division_season_id
      )

    if (missingContext.length > 0) {
      setMessage(
        `${missingContext.length} match(es) still need an internal division.`
      )
      return
    }

    setLoadingImport(true)
    setMessage(null)

    try {
      const response = await fetch(
        "/api/admin/import-arbiter/import",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            rows: preview,
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Import failed."
        )
      }

      if (data.failed > 0) {
        toast.warning(
          `${data.imported} imported, ${data.failed} failed.`
        )

        console.error(
          "Arbiter import errors:",
          data.errors
        )
      } else {
        toast.success(
          `${data.imported} matches imported successfully.`
        )
      }

      setPreview(null)
      setFile(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to import matches."

      setMessage(errorMessage)
    } finally {
      setLoadingImport(false)
    }
  }

  function handleSeasonChange(
    seasonId: string
  ) {
    setSelectedSeasonId(seasonId)
    setMessage(null)

    setPreview((currentPreview) => {
      if (!currentPreview) {
        return currentPreview
      }

      return currentPreview.map(
        (game) => ({
          ...game,

          tournament_division_season_id:
            resolveDivisionSeasonId({
              arbiterDivision:
                game.division,

              seasonId,

              divisionSeasons,
            }),
        })
      )
    })
  }

  function updateRow(
    index: number,
    field: keyof ArbiterGame,
    value: string
  ) {
    setPreview((currentPreview) => {
      if (!currentPreview) return null

      const updated = [
        ...currentPreview,
      ]

      updated[index] = {
        ...updated[index],
        [field]: value,
      }

      return updated
    })
  }

  function deleteRow(index: number) {
    setPreview((currentPreview) => {
      if (!currentPreview) return null

      return currentPreview.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    })
  }

  function resetImport() {
    setPreview(null)
    setFile(null)
    setMessage(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function renderStatus(
    status?: ArbiterGameStatus
  ) {
    if (status === "duplicate_db") {
      return (
        <span className="
          text-xs font-medium
          text-red-400
        ">
          Already Imported
        </span>
      )
    }

    if (
      status === "duplicate_file"
    ) {
      return (
        <span className="
          text-xs font-medium
          text-yellow-400
        ">
          Duplicate
        </span>
      )
    }

    return (
      <span className="
        text-xs font-medium
        text-emerald-400
      ">
        OK
      </span>
    )
  }

  return (
    <div className="
      max-w-6xl
      space-y-6
    ">

      {/* TOURNAMENT CONTEXT */}
      <div className="
        rounded-2xl
        border border-white/10
        bg-[#0B0F0F]/80
        p-5
        space-y-4
      ">
        <div>
          <p className="
            text-sm font-semibold
            text-white
          ">
            Tournament Context
          </p>

          <p className="
            mt-1
            text-xs
            text-gray-500
          ">
            Select the season that applies
            to this Arbiter import.
          </p>
        </div>

        <div className="
          grid gap-4
          md:grid-cols-2
        ">
          <div className="space-y-2">
            <label className="
              text-xs font-medium
              text-gray-400
            ">
              Organization
            </label>

            <div className="
              flex min-h-11
              items-center
              rounded-xl
              border border-white/10
              bg-black/20
              px-4
              text-sm text-gray-300
            ">
              LA Municipal Soccer League
            </div>
          </div>

          <div className="space-y-2">
            <label className="
              text-xs font-medium
              text-gray-400
            ">
              Season
            </label>

            <select
              value={selectedSeasonId}
              onChange={(event) =>
                handleSeasonChange(
                  event.target.value
                )
              }
              disabled={
                loadingTournamentOptions ||
                seasons.length === 0 ||
                loadingImport
              }
              className="
                min-h-11
                w-full
                rounded-xl
                border border-white/10
                bg-[#071f1c]
                px-4
                text-sm text-white
                outline-none
                transition
                focus:border-emerald-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <option value="">
                {loadingTournamentOptions
                  ? "Loading seasons..."
                  : "Select a season"}
              </option>

              {seasons.map(
                (season) => (
                  <option
                    key={season.id}
                    value={season.id}
                  >
                    {season.label}
                    {season.status ===
                    "active"
                      ? " — Active"
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {/* FILE INPUT */}
      <div className="space-y-3">
        <label className="
          text-sm text-gray-400
        ">
          Upload Arbiter File
        </label>

        <div
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="
            flex cursor-pointer
            items-center justify-between
            rounded-xl
            border border-white/10
            bg-[#0B0F0F]/80
            px-4 py-3
            transition
            hover:border-emerald-500/30
          "
        >
          <div className="flex flex-col">
            <span
              className={`
                text-sm
                ${
                  file
                    ? "text-emerald-400"
                    : "text-white"
                }
              `}
            >
              {file
                ? file.name
                : "Select .xls or .xlsx file"}
            </span>

            <span className="
              text-xs text-gray-500
            ">
              Arbiter export only
            </span>
          </div>

          <span className="
            rounded-lg
            border border-emerald-500/20
            bg-emerald-500/10
            px-3 py-1
            text-xs text-emerald-400
          ">
            Browse
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx"
            onChange={(event) => {
              const selected =
                event.target.files?.[0] ||
                null

              setFile(selected)
              setPreview(null)
              setMessage(null)
            }}
            className="hidden"
          />
        </div>

        <button
          onClick={handlePreview}
          disabled={
            loadingPreview ||
            !selectedSeasonId
          }
          className="
            rounded-lg
            border border-white/10
            bg-[#0B0F0F]
            px-4 py-2
            text-sm text-white
            transition
            hover:border-yellow-400/40
            hover:text-yellow-300
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loadingPreview
            ? "Parsing file..."
            : "Preview Matches"}
        </button>
      </div>

      {message && (
        <p className="
          text-sm text-red-400
        ">
          {message}
        </p>
      )}

      {/* PREVIEW */}
      {preview && (
        <div className="space-y-6">

          <div className="
            flex flex-col gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">
            <div>
              <h2 className="
                text-lg font-semibold
                text-white
              ">
                Preview ({preview.length} matches)
              </h2>

              <p className="
                mt-1 text-xs
                text-gray-500
              ">
                {hasUnresolvedMatches
                  ? `${unresolvedMatches.length} match(es) need an internal division.`
                  : "All matches have tournament context."}
              </p>
            </div>

            <button
              onClick={resetImport}
              className="
                rounded-lg
                border border-red-500/20
                px-3 py-1.5
                text-xs text-red-400
                transition
                hover:bg-red-500/10
              "
            >
              Reset Import
            </button>
          </div>

          {hasUnresolvedMatches && (
            <div className="
              rounded-xl
              border border-yellow-500/20
              bg-yellow-500/10
              px-4 py-3
              text-sm text-yellow-200
            ">
              Review the highlighted matches
              and select the correct internal
              division before importing.
            </div>
          )}

          <div className="
            grid grid-cols-1
            gap-4
            overflow-visible
            md:grid-cols-2
            xl:grid-cols-3
          ">
            {preview.map(
              (game, index) => {
                const needsDivision =
                  !game
                    .tournament_division_season_id

                return (
                  <div
                    key={
                      game.game_id +
                      index
                    }
                    className={`
                      overflow-visible
                      rounded-2xl
                      border
                      bg-[#0B0F0F]/80
                      p-4
                      space-y-4
                      transition

                      ${
                        needsDivision
                          ? `
                            border-yellow-500/40
                            shadow-lg
                            shadow-yellow-500/5
                          `
                          : `
                            border-white/10
                            hover:border-emerald-500/30
                          `
                      }
                    `}
                  >
                    {/* HEADER */}
                    <div className="
                      flex items-start
                      justify-between
                      gap-4
                    ">
                      <div>
                        <p className="
                          text-sm font-semibold
                          text-white
                        ">
                          {game.home} vs{" "}
                          {game.away}
                        </p>

                        <p className="
                          mt-1 text-xs
                          text-gray-500
                        ">
                          Arbiter:{" "}
                          {game.division}
                        </p>
                      </div>

                      {renderStatus(
                        game.status
                      )}
                    </div>

                    {/* INTERNAL DIVISION */}
                    <div className="space-y-2">
                      <label className="
                        text-xs font-medium
                        text-gray-400
                      ">
                        Internal Division
                      </label>

                      <select
                        value={
                          game
                            .tournament_division_season_id ??
                          ""
                        }
                        onChange={(event) =>
                          updateRow(
                            index,
                            "tournament_division_season_id",
                            event.target.value
                          )
                        }
                        disabled={
                          loadingImport
                        }
                        className={`
                          min-h-10
                          w-full
                          rounded-lg
                          border
                          bg-[#071f1c]
                          px-3
                          text-sm text-white
                          outline-none
                          transition
                          disabled:cursor-not-allowed
                          disabled:opacity-50

                          ${
                            needsDivision
                              ? `
                                border-yellow-500/40
                                focus:border-yellow-400
                              `
                              : `
                                border-white/10
                                focus:border-emerald-500/40
                              `
                          }
                        `}
                      >
                        <option value="">
                          Select division
                        </option>

                        {divisionsForSelectedSeason.map(
                          (division) => (
                            <option
                              key={
                                division.id
                              }
                              value={
                                division.id
                              }
                            >
                              {
                                division.divisionName
                              }
                            </option>
                          )
                        )}
                      </select>

                      {needsDivision && (
                        <p className="
                          text-xs
                          text-yellow-400
                        ">
                          Manual selection required.
                        </p>
                      )}
                    </div>

                    {/* MATCH DETAILS */}
                    <div className="
                      space-y-2 text-xs
                    ">
                      <input
                        value={game.kickoff}
                        onChange={(event) =>
                          updateRow(
                            index,
                            "kickoff",
                            event.target.value
                          )
                        }
                        className="
                          w-full rounded
                          border border-white/10
                          bg-[#071f1c]
                          px-2 py-1
                          text-white
                        "
                      />

                      <input
                        value={game.site}
                        onChange={(event) =>
                          updateRow(
                            index,
                            "site",
                            event.target.value
                          )
                        }
                        className="
                          w-full rounded
                          border border-white/10
                          bg-[#071f1c]
                          px-2 py-1
                          text-white
                        "
                      />
                    </div>

                    {/* REFEREES */}
                    <div className="space-y-2">
                      {[
                        [
                          "center_referee",
                          game.center_referee,
                        ],
                        ["ar1", game.ar1],
                        ["ar2", game.ar2],
                      ].map(
                        ([field, value]) => (
                          <RefereeSelect
                            key={field}
                            value={value}
                            members={members}
                            onChange={(
                              selectedValue
                            ) =>
                              updateRow(
                                index,
                                field as keyof ArbiterGame,
                                selectedValue
                              )
                            }
                          />
                        )
                      )}
                    </div>

                    {/* FOOTER */}
                    <div className="
                      flex items-center
                      justify-between
                      pt-2
                    ">
                      <span className="
                        text-xs text-gray-500
                      ">
                        ID: {game.game_id}
                      </span>

                      <button
                        onClick={() =>
                          deleteRow(index)
                        }
                        disabled={
                          loadingImport
                        }
                        className="
                          rounded
                          border border-red-500/20
                          px-2 py-1
                          text-xs text-red-400
                          transition
                          hover:bg-red-500/10
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              }
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={
              loadingImport ||
              hasUnresolvedMatches ||
              preview.length === 0
            }
            className="
              rounded-lg
              bg-emerald-500
              px-5 py-2.5
              font-semibold text-black
              shadow-lg
              transition
              hover:bg-emerald-400
              hover:shadow-emerald-500/30
              disabled:cursor-not-allowed
              disabled:opacity-50
              disabled:shadow-none
            "
          >
            {loadingImport
              ? "Importing & Building Rosters..."
              : hasUnresolvedMatches
                ? `Select ${unresolvedMatches.length} Missing Division(s)`
                : "Import Matches"}
          </button>
        </div>
      )}
    </div>
  )
}