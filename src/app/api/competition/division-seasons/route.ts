import { NextResponse } from "next/server"

import { requireUser } from "@/src/lib/auth/require-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

const ALLOWED_DIVISIONS = new Set([
  "First AM",
  "Minor AM",
  "Minor PM",
  "Major AM",
  "Metro AM",
  "Metro PM",
  "Super Metro",
])

type DivisionSeasonRow = {
  id: string
  active: boolean
  division:
    | {
        id: string
        name: string
      }
    | {
        id: string
        name: string
      }[]
    | null
  season:
    | {
        id: string
        term: string
        year: number
        status: string
      }
    | {
        id: string
        term: string
        year: number
        status: string
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

export async function GET() {
  try {
    await requireUser()

    const supabaseAdmin =
      getSupabaseAdmin()

    const {
      data,
      error,
    } = await supabaseAdmin
      .schema("tournaments")
      .from("division_seasons")
      .select(`
        id,
        active,
        division:divisions (
          id,
          name
        ),
        season:seasons (
          id,
          term,
          year,
          status
        )
      `)
      .eq("active", true)

    if (error) {
      console.error(
        "[COMPETITION] Unable to load division seasons:",
        error
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load competition divisions.",
        },
        {
          status: 500,
        }
      )
    }

    const divisionSeasons = (
      (data ?? []) as DivisionSeasonRow[]
    )
      .map((row) => {
        const division =
          getSingleRelation(
            row.division
          )

        const season =
          getSingleRelation(
            row.season
          )

        if (!division || !season) {
          return null
        }

        return {
          id: row.id,

          divisionId:
            division.id,

          divisionName:
            division.name,

          seasonId:
            season.id,

          seasonTerm:
            season.term,

          seasonYear:
            season.year,

          seasonStatus:
            season.status,

          seasonLabel:
            `${season.term} ${season.year}`,

          label:
            `${division.name} — ${season.term} ${season.year}`,
        }
      })
      .filter(
        (
          item
        ): item is NonNullable<
          typeof item
        > =>
          item !== null
      )
      .filter((item) =>
        ALLOWED_DIVISIONS.has(
          item.divisionName
        )
      )
      .sort((a, b) => {
        if (
          a.seasonYear !==
          b.seasonYear
        ) {
          return (
            b.seasonYear -
            a.seasonYear
          )
        }

        if (
          a.seasonTerm !==
          b.seasonTerm
        ) {
          return (
            a.seasonTerm.localeCompare(
              b.seasonTerm
            )
          )
        }

        return (
          a.divisionName.localeCompare(
            b.divisionName
          )
        )
      })

    const seasons =
      Array.from(
        new Map(
          divisionSeasons.map(
            (item) => [
              item.seasonId,
              {
                id:
                  item.seasonId,

                term:
                  item.seasonTerm,

                year:
                  item.seasonYear,

                status:
                  item.seasonStatus,

                label:
                  item.seasonLabel,
              },
            ]
          )
        ).values()
      )

    return NextResponse.json({
      success: true,
      seasons,
      divisionSeasons,
    })
  } catch (error) {
    console.error(
      "[COMPETITION] Division seasons API error:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error."

    const status =
      message === "Unauthorized"
        ? 401
        : 500

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status,
      }
    )
  }
}