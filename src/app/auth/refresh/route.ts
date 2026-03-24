import { supabaseServer } from "@/src/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await supabaseServer()

  await supabase.auth.getUser()

  return NextResponse.json({ success: true })
}