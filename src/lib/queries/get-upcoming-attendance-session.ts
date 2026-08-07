import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

import {
  type AdminAttendanceSession,
  type AttendanceSessionRow,
  getActiveDevelopmentCycle,
  normalizeAttendanceSessions,
} from "./attendance-session-helpers"

export async function getUpcomingAttendanceSessions(): Promise<
  AdminAttendanceSession[]
> {
  const supabaseAdmin = getSupabaseAdmin()

  const activeCycle =
    await getActiveDevelopmentCycle()

  if (!activeCycle) {
    return []
  }

  const now = new Date().toISOString()

  /*
   * Averiguamos si existe una sesión abierta.
   *
   * Si existe, NextAttendanceSessionCard mostrará esa
   * sesión y Upcoming puede mostrar todas las scheduled.
   *
   * Si no existe, NextAttendanceSessionCard mostrará la
   * primera scheduled y la excluimos de Upcoming para no
   * repetir la misma sesión en ambas secciones.
   */
  const {
    data: openSession,
    error: openSessionError,
  } = await supabaseAdmin
    .schema("development")
    .from("attendance_sessions")
    .select("id")
    .eq("cycle_id", activeCycle.id)
    .eq("status", "open")
    .limit(1)
    .maybeSingle()

  if (openSessionError) {
    console.error(
      "[ATTENDANCE] Unable to verify open sessions:",
      openSessionError
    )

    throw new Error(
      "Unable to load upcoming attendance sessions."
    )
  }

  const limit = openSession ? 6 : 7

  const {
    data,
    error,
  } = await supabaseAdmin
    .schema("development")
    .from("attendance_sessions")
    .select(`
      id,
      cycle_id,
      title,
      session_type,
      scheduled_at,
      location,
      status,
      counts_for_score,
      created_by
    `)
    .eq("cycle_id", activeCycle.id)
    .eq("status", "scheduled")
    .gte("scheduled_at", now)
    .order("scheduled_at", {
      ascending: true,
    })
    .limit(limit)

  if (error) {
    console.error(
      "[ATTENDANCE] Unable to load upcoming sessions:",
      error
    )

    throw new Error(
      "Unable to load upcoming attendance sessions."
    )
  }

  let rows =
    (data ?? []) as AttendanceSessionRow[]

  /*
   * Sin una sesión open, la primera scheduled ya aparece
   * en Next Session. La retiramos de Upcoming.
   */
  if (!openSession) {
    rows = rows.slice(1)
  }

  return normalizeAttendanceSessions(
    rows.slice(0, 6),
    activeCycle
  )
}