import { NextResponse } from "next/server"
import { supabaseServer } from "@/src/lib/supabase/server"
import { matchReferee } from "@/src/lib/importers/referee-matcher"
import { getProfile } from "@/src/lib/queries/get-profile"
import { parseKickoff } from "@/src/lib/utils/format-date"

type ArbiterRow = {
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

  /*
   * Explicit tournament context selected during preview.
   * PostgreSQL will use this value to build match_context
   * and the match roster automatically.
   */
  tournament_division_season_id: string | null
}

export async function POST(req: Request) {
  const authData = await getProfile()

  if (
    !authData?.profile ||
    authData.profile.role !== "board"
  ) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  const supabase = await supabaseServer()

  let rows: ArbiterRow[] = []

  try {
    const body = await req.json()
    rows = body.rows
  } catch {
    return NextResponse.json(
      { error: "Invalid import payload." },
      { status: 400 }
    )
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: "No rows provided." },
      { status: 400 }
    )
  }

  /*
   * Every row must have an explicit division-season
   * before it can be imported.
   */
  const rowsWithoutTournamentContext = rows.filter(
    (row) => !row.tournament_division_season_id
  )

  if (rowsWithoutTournamentContext.length > 0) {
    return NextResponse.json(
      {
        error:
          `${rowsWithoutTournamentContext.length} match(es) do not have a tournament division selected.`,
      },
      { status: 400 }
    )
  }

  /*
   * Load members once instead of querying them
   * repeatedly inside the import loop.
   */
  const { data: membersData, error: membersError } =
    await supabase
      .from("members")
      .select("id, full_name")

  if (membersError) {
    console.error(
      "Unable to load members for Arbiter import:",
      membersError
    )

    return NextResponse.json(
      {
        error:
          "Unable to load referee information.",
      },
      { status: 500 }
    )
  }

  const members = membersData ?? []

  let imported = 0
  let failed = 0

  const errors: Array<{
    game_id: string
    message: string
  }> = []

  for (const row of rows) {
    try {
      // ---------------------------------------------
      // RESOLVE REFEREES
      // ---------------------------------------------

      const center = await matchReferee(
        row.center_referee,
        supabase,
        members
      )

      const ar1 = await matchReferee(
        row.ar1,
        supabase,
        members
      )

      const ar2 = await matchReferee(
        row.ar2,
        supabase,
        members
      )

      // ---------------------------------------------
      // FORMAT MATCH DATA
      // ---------------------------------------------

      const kickoffAt = parseKickoff(row.kickoff)

      const siteParts = row.site.split(",")

      const locationName =
        siteParts[0]?.trim() || null

      const fieldName =
        siteParts.slice(1).join(",").trim() || null

      // ---------------------------------------------
      // UPSERT MATCH
      //
      // PostgreSQL trigger will automatically:
      // 1. Resolve team registrations
      // 2. Create match_context
      // 3. Create match_rosters
      // ---------------------------------------------

      const { error } = await supabase
        .from("matches")
        .upsert(
          {
            arbiter_match_id: row.game_id,

            home_team: row.home,
            away_team: row.away,

            /*
             * Preserve the original values from Arbiter.
             * The internal tournament relationship lives
             * in tournament_division_season_id.
             */
            league: row.league,
            division: row.division,

            tournament_division_season_id:
              row.tournament_division_season_id,

            location: locationName,
            field: fieldName,
            kickoff_at: kickoffAt,

            arbiter_comments: row.comments,

            center_referee_id: center,
            assistant_referee_1_id: ar1,
            assistant_referee_2_id: ar2,
          },
          {
            onConflict: "arbiter_match_id",
          }
        )

      if (error) {
        throw new Error(error.message)
      }

      imported++
    } catch (error) {
      failed++

      const message =
        error instanceof Error
          ? error.message
          : "Unexpected import error."

      console.error(
        `Unexpected import error for match ${row.game_id}:`,
        error
      )

      errors.push({
        game_id: row.game_id,
        message,
      })
    }
  }

  return NextResponse.json({
    success: failed === 0,
    imported,
    failed,
    total_rows: rows.length,
    errors,
  })
}