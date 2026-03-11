import { NextResponse } from "next/server"
import { parseArbiterFile } from "@/src/lib/importers/arbiter-parser"
import { createClient } from "@/src/lib/supabase/server"

export async function POST(req: Request) {

  const supabase = await createClient()

  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()

  const rows = await parseArbiterFile(buffer)

  const gameIds = rows.map(r => r.game_id)

  // Buscar duplicados en BD
  const { data: existing } = await supabase
    .from("matches")
    .select("arbiter_match_id")
    .in("arbiter_match_id", gameIds)

  const existingIds = new Set(existing?.map(e => e.arbiter_match_id) || [])

  // detectar duplicados dentro del archivo
  const seen = new Set()

  const games = rows.map(row => {

    let status = "ok"

    if (seen.has(row.game_id)) {
      status = "duplicate_file"
    }

    if (existingIds.has(row.game_id)) {
      status = "duplicate_db"
    }

    seen.add(row.game_id)

    return {
      ...row,
      status
    }
  })

  return NextResponse.json({
    games,
    count: games.length
  })
}