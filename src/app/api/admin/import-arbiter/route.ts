import { NextResponse } from "next/server"
import { createClient } from "@/src/lib/supabase/server"
import { parseArbiterFile } from "@/src/lib/importers/arbiter-parser"
import { matchReferee } from "@/src/lib/importers/referee-matcher"
import { getProfile } from "@/src/lib/queries/get-profile"

export async function POST(req: Request) {
  const authData = await getProfile()

  if (!authData?.profile || authData.profile.role !== "board") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const supabase = await createClient()

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }

  if (!file.name.endsWith(".xls") && !file.name.endsWith(".xlsx")) {
    return NextResponse.json(
      { error: "Only Excel files (.xls or .xlsx) are allowed." },
      { status: 400 }
    )
  }

  const fileArrayBuffer = await file.arrayBuffer()
  const rows = await parseArbiterFile(fileArrayBuffer)
  console.log("ROWS: ", rows)
  let imported = 0

  for (const row of rows) {
    const center = await matchReferee(row.center_referee, supabase)
    const ar1 = await matchReferee(row.ar1, supabase)
    const ar2 = await matchReferee(row.ar2, supabase)

    const { data, error } = await supabase.from("matches").upsert(
      {
        arbiter_match_id: row.game_id,
        home_team: row.home,
        away_team: row.away,
        league: row.league,
        division: row.division,
        location: row.site,
        arbiter_comments: row.comments,
        center_referee_id: center,
        assistant_referee_1_id: ar1,
        assistant_referee_2_id: ar2,
      },
      {
        onConflict: "arbiter_match_id",
      }
    )
    imported++
  }

  return NextResponse.json({ imported })
}