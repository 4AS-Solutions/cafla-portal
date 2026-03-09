import { NextResponse } from "next/server"
import { parseArbiterFile } from "@/src/lib/importers/arbiter-parser"

export async function POST(req: Request) {

  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()

  const rows = await parseArbiterFile(buffer)

  return NextResponse.json({
    games: rows,
    count: rows.length
  })
}