import { createClient } from "@/src/lib/supabase/server"

export type AttendanceSession = {
  id: string
  title: string
  session_type: string
  session_date: string
  location: string | null
}

export async function getAttendanceSessions(): Promise<AttendanceSession[]> {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("attendance_sessions")
    .select(`
      id,
      title,
      session_type,
      session_date,
      location
    `)
    .order("session_date", { ascending: false })

  if (error) {
    console.error("getAttendanceSessions error:", error)
    throw error
  }

  return data ?? []
}