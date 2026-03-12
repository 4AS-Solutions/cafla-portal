import { createClient } from "@/src/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  await supabase.auth.getUser()

  return NextResponse.json({ success: true })
}