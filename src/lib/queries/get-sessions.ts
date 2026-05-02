import { supabaseServer } from "@/src/lib/supabase/server"

export async function getSessions() {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("*")
    .order("session_date", { ascending: true })

  if (error) {
    console.error("getSessions error:", error)
    return []
  }

  return data ?? []
}