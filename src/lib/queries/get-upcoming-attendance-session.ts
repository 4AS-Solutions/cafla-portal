import { supabaseServer } from "@/src/lib/supabase/server"
import type { AttendanceSession } from "./get-attendance-sessions"

export async function getUpcomingAttendanceSessions(): Promise<AttendanceSession[]> {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("attendance_sessions")
    .select(`
      id,
      title,
      session_type,
      session_date,
      location,
      created_by,
      creator:members!attendance_sessions_created_by_fkey (
        full_name
      )
    `)
    .gte("session_date", new Date().toISOString())
    .order("session_date", { ascending: true })
    .limit(6)

  if (error) {
    console.error("getUpcomingAttendanceSessions error:", error)
    throw error
  }

  return (data ?? []).map((row: any) => {
    const rawCreator = Array.isArray(row.creator)
      ? row.creator[0]
      : row.creator

    return {
      id: row.id,
      title: row.title,
      session_type: row.session_type,
      session_date: row.session_date,
      location: row.location,
      created_by: row.created_by,
      created_by_user: rawCreator
        ? { full_name: rawCreator.full_name }
        : null
    }
  })
}