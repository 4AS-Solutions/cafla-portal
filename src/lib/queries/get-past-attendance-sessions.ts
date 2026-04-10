import { supabaseServer } from "@/src/lib/supabase/server"
import type { AttendanceSession } from "./get-attendance-sessions"

export async function getPastAttendanceSessions({
  page = 0,
  limit = 6
}: {
  page?: number
  limit?: number
}): Promise<{
  data: AttendanceSession[]
  count: number
}> {

  const supabase = await supabaseServer()

  const from = page * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
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
    `, { count: "exact" })
    .lt("session_date", new Date().toISOString())
    .order("session_date", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("getPastAttendanceSessions error:", error)
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
        ? { full_name: rawCreator.full_name }
        : null
    }
  })

  return {
    data: normalized,
    count: count ?? 0
  }
}