import { NextResponse } from "next/server"
import { supabaseServer } from "@/src/lib/supabase/server"
import { requireBoard } from "@/src/lib/auth/require-board"

export async function POST(req: Request) {

  await requireBoard()

  const supabase = await supabaseServer()

  const { session_id, member_id, status } = await req.json()

  const { error } = await supabase
    .from("attendance_records")
    .upsert(
      {
        session_id,
        member_id,
        status
      },
      {
        onConflict: "session_id,member_id"
      }
    )

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}