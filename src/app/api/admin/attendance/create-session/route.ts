import { NextResponse } from "next/server"
import { createAttendanceSession } from "@/src/lib/queries/create-attendance-session"
import { requireBoard } from "@/src/lib/auth/require-board"

export async function POST(req: Request) {

  const profile = await requireBoard()

  const formData = await req.formData()

  const title = formData.get("title") as string
  const session_type = formData.get("session_type") as string
  const session_date = formData.get("session_date") as string
  const location = formData.get("location") as string

  const session = await createAttendanceSession({
    title,
    session_type,
    session_date,
    location,
    created_by: profile.id
  })

  return NextResponse.json(session)
}