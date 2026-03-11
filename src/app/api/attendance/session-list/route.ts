import { NextResponse } from "next/server"
import { getSessionAttendanceList } from "@/src/lib/queries/get-session-attendance-list"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)

  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ error: "missing session_id" }, { status: 400 })
  }

  const data = await getSessionAttendanceList(sessionId)

  return NextResponse.json(data)
}