import { NextResponse } from "next/server"
import { createClient } from "@/src/lib/supabase/server"
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
}

export async function POST(req: Request) {

  const authData = await getProfile()

  if (!authData?.profile || authData.profile.role !== "board") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const supabase = await createClient()

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

  let imported = 0

  for (const row of rows) {

    try {

      // Resolver árbitros (mapping automático)
      const members = (await supabase.from("members").select("id, full_name")).data ?? []
      
      const center = await matchReferee(row.center_referee, supabase, members)
      const ar1 = await matchReferee(row.ar1, supabase, members)
      const ar2 = await matchReferee(row.ar2, supabase, members)

      const kickoff_at = parseKickoff(row.kickoff)
      
      const parts = row.site.split(",")
      const locationName = parts[0]?.trim() || null
      const fieldName = parts[1]?.trim() || null

      const { error } = await supabase
        .from("matches")
        .upsert(
          {
            arbiter_match_id: row.game_id,
            home_team: row.home,
            away_team: row.away,
            league: row.league,
            division: row.division,

            location: locationName,
            field: fieldName,
            kickoff_at: kickoff_at,
            
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
        console.error("Import error for match:", row.game_id, error)
        continue
      }

      imported++

    } catch (err) {

      console.error("Unexpected import error:", row, err)

    }

  }

  return NextResponse.json({
    success: true,
    imported,
    total_rows: rows.length
  })
}