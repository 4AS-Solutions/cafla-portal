import { NextRequest, NextResponse } from "next/server"

import { getUser } from "@/src/lib/auth/get-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type StandingRow = {
  position: number
  team_registration_id: string
  team_id: string
  team_name: string

  division_season_id: string
  division_id: string
  division_name: string

  season_id: string
  season_term: string
  season_year: number
  season_label: string

  played: number
  won: number
  drawn: number
  lost: number
  forfeits: number

  goals_for: number
  goals_against: number
  goal_difference: number

  total_points: number
}

export async function GET(request: NextRequest) {
  try {
    // =============================================
    // AUTHENTICATION
    // =============================================

    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      )
    }

    // =============================================
    // QUERY PARAMETERS
    // =============================================

    const searchParams =
      request.nextUrl.searchParams

    const seasonId =
      searchParams.get("seasonId")

    const divisionSeasonId =
      searchParams.get("divisionSeasonId")

    if (!seasonId) {
      return NextResponse.json(
        {
          success: false,
          error: "seasonId is required.",
        },
        {
          status: 400,
        }
      )
    }

    if (!divisionSeasonId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "divisionSeasonId is required.",
        },
        {
          status: 400,
        }
      )
    }

    // =============================================
    // LOAD STANDINGS
    // =============================================

    const supabaseAdmin =
      getSupabaseAdmin()

    const { data, error } =
      await supabaseAdmin
        .schema("tournaments")
        .from("team_season_standings")
        .select(`
          position,
          team_registration_id,
          team_id,
          team_name,
          division_season_id,
          division_id,
          division_name,
          season_id,
          season_term,
          season_year,
          season_label,
          played,
          won,
          drawn,
          lost,
          forfeits,
          goals_for,
          goals_against,
          goal_difference,
          total_points
        `)
        .eq("season_id", seasonId)
        .eq(
          "division_season_id",
          divisionSeasonId
        )
        .order("position", {
          ascending: true,
        })

    if (error) {
      console.error(
        "[COMPETITION] Unable to load standings:",
        error
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load competition standings.",
        },
        {
          status: 500,
        }
      )
    }

    const rows =
      (data ?? []) as StandingRow[]

    const firstRow =
      rows[0] ?? null

    // =============================================
    // RESPONSE
    // =============================================

    return NextResponse.json({
      success: true,

      competition: firstRow
        ? {
            seasonId:
              firstRow.season_id,

            seasonLabel:
              firstRow.season_label,

            divisionId:
              firstRow.division_id,

            divisionSeasonId:
              firstRow.division_season_id,

            divisionName:
              firstRow.division_name,
          }
        : null,

      standings: rows.map((row) => ({
        position: row.position,

        teamRegistrationId:
          row.team_registration_id,

        teamId: row.team_id,
        teamName: row.team_name,

        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        forfeits: row.forfeits,

        goalsFor: row.goals_for,
        goalsAgainst:
          row.goals_against,

        goalDifference:
          row.goal_difference,

        totalPoints:
          row.total_points,
      })),
    })
  } catch (error) {
    console.error(
      "[COMPETITION] Standings API error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          "Unexpected server error.",
      },
      {
        status: 500,
      }
    )
  }
}