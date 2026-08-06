import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

import {
  type AdminAttendanceSession,
  type AttendanceSessionRow,
  getActiveDevelopmentCycle,
  normalizeAttendanceSessions,
} from "./attendance-session-helpers"

export type AttendanceSession = AdminAttendanceSession

export async function getNextAttendanceSessions(): Promise<AttendanceSession | null> {
  const supabaseAdmin = getSupabaseAdmin()

  const activeCycle =
    await getActiveDevelopmentCycle()

  if (!activeCycle) {
    return null
  }

  /*
   * Una sesión abierta tiene prioridad porque el Board
   * todavía debe terminar de capturar o cerrar la lista.
   */
  const {
    data: openSessionData,
    error: openSessionError,
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
    .eq("status", "open")
    .order("scheduled_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle()

  if (openSessionError) {
    console.error(
      "[ATTENDANCE] Unable to load open attendance session:",
      openSessionError
    )

    throw new Error(
      "Unable to load the open attendance session."
    )
  }

  if (openSessionData) {
    const normalized =
      await normalizeAttendanceSessions(
        [openSessionData as AttendanceSessionRow],
        activeCycle
      )

    return normalized[0] ?? null
  }

  /*
   * Si no hay una sesión abierta, mostramos la próxima
   * sesión programada. Incluimos sesiones scheduled cuya
   * fecha haya pasado, porque pueden estar pendientes de
   * abrirse y requieren atención del Board.
   */
  const {
    data: scheduledSessionData,
    error: scheduledSessionError,
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
    .order("scheduled_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle()

  if (scheduledSessionError) {
    console.error(
      "[ATTENDANCE] Unable to load next attendance session:",
      scheduledSessionError
    )

    throw new Error(
      "Unable to load the next attendance session."
    )
  }

  if (!scheduledSessionData) {
    return null
  }

  const normalized =
    await normalizeAttendanceSessions(
      [scheduledSessionData as AttendanceSessionRow],
      activeCycle
    )

  return normalized[0] ?? null
}