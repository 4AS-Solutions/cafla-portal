import {
  NextRequest,
  NextResponse,
} from "next/server"

import { getUser } from "@/src/lib/auth/get-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type RouteContext = {
  params: Promise<{
    teamRegistrationId: string
  }>
}

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

type PlayerStatRow = {
  player_id: string
  external_player_id: string | null

  first_name: string
  last_name: string
  player_name: string

  team_id: string
  team_name: string

  division_season_id: string
  division_id: string
  division_name: string

  season_id: string
  season_term: string
  season_year: number
  season_label: string

  goals: number
  yellow_cards: number
  direct_red_cards: number
  second_yellow_reds: number
  total_red_cards: number
}

type CardReasonRow = {
  player_id: string
  player_name: string

  team_id: string
  team_name: string

  division_season_id: string
  season_id: string

  card_type: string
  reason_code: string | null
  card_count: number
}

type RosterRow = {
  active: boolean

  player:
    | {
        id: string
        external_player_id: string | null
        first_name: string
        last_name: string
      }
    | {
        id: string
        external_player_id: string | null
        first_name: string
        last_name: string
      }[]
    | null
}

function getSingleRelation<T>(
  value: T | T[] | null
): T | null {
  if (!value) return null

  return Array.isArray(value)
    ? value[0] ?? null
    : value
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
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

    const { teamRegistrationId } = await context.params


    if (!teamRegistrationId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "teamRegistrationId is required.",
        },
        {
          status: 400,
        }
      )
    }

    const supabaseAdmin =
      getSupabaseAdmin()

    // =============================================
    // TEAM STANDING
    // =============================================

    const {
      data: standingData,
      error: standingError,
    } = await supabaseAdmin
      .schema("tournaments")
      .from("team_season_standings")
      .select("*")
      .eq(
        "team_registration_id",
        teamRegistrationId
      )
      .maybeSingle()

    if (standingError) {
      console.error(
        "[TEAM PROFILE] Standing query failed:",
        standingError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load team information.",
        },
        {
          status: 500,
        }
      )
    }

    if (!standingData) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Team registration was not found.",
        },
        {
          status: 404,
        }
      )
    }

    const standing =
      standingData as StandingRow

    // =============================================
    // PLAYER STATS
    // =============================================

    const {
      data: playerStatsData,
      error: playerStatsError,
    } = await supabaseAdmin
      .schema("tournaments")
      .from("player_team_season_stats")
      .select("*")
      .eq("team_id", standing.team_id)
      .eq(
        "division_season_id",
        standing.division_season_id
      )
      .order("goals", {
        ascending: false,
      })
      .order("yellow_cards", {
        ascending: false,
      })

    if (playerStatsError) {
      console.error(
        "[TEAM PROFILE] Player stats query failed:",
        playerStatsError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load player statistics.",
        },
        {
          status: 500,
        }
      )
    }

    // =============================================
    // CARD REASONS
    // =============================================

    const {
      data: cardReasonsData,
      error: cardReasonsError,
    } = await supabaseAdmin
      .schema("tournaments")
      .from("player_card_reason_stats")
      .select("*")
      .eq("team_id", standing.team_id)
      .eq(
        "division_season_id",
        standing.division_season_id
      )
      .order("card_count", {
        ascending: false,
      })

    if (cardReasonsError) {
      console.error(
        "[TEAM PROFILE] Card reasons query failed:",
        cardReasonsError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load disciplinary information.",
        },
        {
          status: 500,
        }
      )
    }

    // =============================================
    // ACTIVE SEASON ROSTER
    // =============================================

    const {
      data: rosterData,
      error: rosterError,
    } = await supabaseAdmin
      .schema("tournaments")
      .from("player_registrations")
      .select(`
        active,
        player:players (
          id,
          external_player_id,
          first_name,
          last_name
        )
      `)
      .eq(
        "team_registration_id",
        teamRegistrationId
      )
      .eq("active", true)

    if (rosterError) {
      console.error(
        "[TEAM PROFILE] Roster query failed:",
        rosterError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load team roster.",
        },
        {
          status: 500,
        }
      )
    }

    const playerStats =
      (playerStatsData ?? []) as PlayerStatRow[]

    const cardReasons =
      (cardReasonsData ?? []) as CardReasonRow[]

    const roster = (
      (rosterData ?? []) as RosterRow[]
    )
      .map((row) =>
        getSingleRelation(row.player)
      )
      .filter(
        (
          player
        ): player is NonNullable<
          ReturnType<
            typeof getSingleRelation<{
              id: string
              external_player_id:
                | string
                | null
              first_name: string
              last_name: string
            }>
          >
        > => player !== null
      )
      .sort((a, b) => {
        const lastNameComparison =
          a.last_name.localeCompare(
            b.last_name
          )

        if (lastNameComparison !== 0) {
          return lastNameComparison
        }

        return a.first_name.localeCompare(
          b.first_name
        )
      })

    // =============================================
    // LEADERS
    // =============================================

    const topScorers = [...playerStats]
      .filter((player) => player.goals > 0)
      .sort((a, b) => {
        if (b.goals !== a.goals) {
          return b.goals - a.goals
        }

        return a.player_name.localeCompare(
          b.player_name
        )
      })
      .slice(0, 5)

    const mostCautioned = [...playerStats]
      .filter(
        (player) =>
          player.yellow_cards > 0
      )
      .sort((a, b) => {
        if (
          b.yellow_cards !==
          a.yellow_cards
        ) {
          return (
            b.yellow_cards -
            a.yellow_cards
          )
        }

        return a.player_name.localeCompare(
          b.player_name
        )
      })
      .slice(0, 5)

    const mostSentOff = [...playerStats]
      .filter(
        (player) =>
          player.total_red_cards > 0
      )
      .sort((a, b) => {
        if (
          b.total_red_cards !==
          a.total_red_cards
        ) {
          return (
            b.total_red_cards -
            a.total_red_cards
          )
        }

        return a.player_name.localeCompare(
          b.player_name
        )
      })
      .slice(0, 5)

    // =============================================
    // RESPONSE
    // =============================================

    return NextResponse.json({
      success: true,

      team: {
        teamRegistrationId:
          standing.team_registration_id,

        teamId: standing.team_id,
        teamName: standing.team_name,

        position: standing.position,

        divisionSeasonId:
          standing.division_season_id,

        divisionId:
          standing.division_id,

        divisionName:
          standing.division_name,

        seasonId:
          standing.season_id,

        seasonTerm:
          standing.season_term,

        seasonYear:
          standing.season_year,

        seasonLabel:
          standing.season_label,
      },

      performance: {
        played: standing.played,
        won: standing.won,
        drawn: standing.drawn,
        lost: standing.lost,
        forfeits: standing.forfeits,

        goalsFor:
          standing.goals_for,

        goalsAgainst:
          standing.goals_against,

        goalDifference:
          standing.goal_difference,

        totalPoints:
          standing.total_points,
      },

      leaders: {
        topScorers: topScorers.map(
          (player) => ({
            playerId: player.player_id,
            playerName:
              player.player_name,
            goals: player.goals,
          })
        ),

        mostCautioned:
          mostCautioned.map(
            (player) => ({
              playerId:
                player.player_id,

              playerName:
                player.player_name,

              yellowCards:
                player.yellow_cards,
            })
          ),

        mostSentOff:
          mostSentOff.map(
            (player) => ({
              playerId:
                player.player_id,

              playerName:
                player.player_name,

              directRedCards:
                player.direct_red_cards,

              secondYellowReds:
                player.second_yellow_reds,

              totalRedCards:
                player.total_red_cards,
            })
          ),
      },

      disciplinaryReasons:
        cardReasons.map((reason) => ({
          playerId: reason.player_id,
          playerName:
            reason.player_name,

          cardType: reason.card_type,
          reasonCode:
            reason.reason_code,

          count: reason.card_count,
        })),

      roster: roster.map((player) => ({
        playerId: player.id,

        externalPlayerId:
          player.external_player_id,

        firstName: player.first_name,
        lastName: player.last_name,

        playerName: `${player.first_name} ${player.last_name}`,
      })),
    })
  } catch (error) {
    console.error(
      "[TEAM PROFILE] Unexpected API error:",
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