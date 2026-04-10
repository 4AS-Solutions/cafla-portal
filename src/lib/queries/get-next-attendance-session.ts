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


export async function getNextAttendanceSessions(): Promise<AttendanceSession | null> {
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
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("getNextAttendanceSession error:", error)
    throw error
  }

  if (!data) return null

  const rawCreator = Array.isArray(data.creator)
    ? data.creator[0]
    : data.creator

  return {
    id: data.id,
    title: data.title,
    session_type: data.session_type,
    session_date: data.session_date,
    location: data.location,
    created_by: data.created_by,
    created_by_user: rawCreator
      ? { full_name: rawCreator.full_name }
      : null
  }
}