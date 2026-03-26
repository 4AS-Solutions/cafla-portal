import { supabaseServer } from "@/src/lib/supabase/server"

export type AttendanceSession = {
  id: string
  title: string
  session_type: string
  session_date: string
  location: string | null
  created_by: string
  created_by_user: {
    full_name: string
  } | null
}

export async function getAttendanceSessions(): Promise<AttendanceSession[]> {

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
    .order("session_date", { ascending: false })

  if (error) {
    console.error("getAttendanceSessions error:", error)
    throw error
  }

  const normalized: AttendanceSession[] = (data ?? []).map((row: any) => {

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
        ? {
            full_name: rawCreator.full_name
          }
        : null
    }
  })

  return normalized
}