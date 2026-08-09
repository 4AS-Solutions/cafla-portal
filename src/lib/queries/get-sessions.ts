import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export async function getSessions() {
  const supabaseAdmin =
    getSupabaseAdmin()

  // =========================================
  // ACTIVE DEVELOPMENT CYCLE
  // =========================================

  const {
    data: activeCycle,
    error: cycleError,
  } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select("id")
    .eq("status", "active")
    .maybeSingle()

  if (cycleError) {
    console.error(
      "[CALENDAR] Unable to load active development cycle:",
      cycleError
    )

    return []
  }

  if (!activeCycle) {
    return []
  }

  // =========================================
  // ATTENDANCE V2 SESSIONS
  // =========================================

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
      counts_for_score
    `)
    .eq(
      "cycle_id",
      activeCycle.id
    )
    .in("status", [
      "scheduled",
      "open",
    ])
    .order(
      "scheduled_at",
      {
        ascending: true,
      }
    )

  if (error) {
    console.error(
      "[CALENDAR] Unable to load attendance sessions:",
      error
    )

    return []
  }

  // =========================================
  // LEGACY CALENDAR COMPATIBILITY
  // =========================================
  //
  // Calendar.tsx and session-utils.ts
  // currently expect "session_date".
  //
  // Attendance V2 uses "scheduled_at".
  // We normalize it here so the public
  // Calendar does not need to be rewritten.
  // =========================================

  return (data ?? []).map(
    (session) => ({
      ...session,

      session_date:
        session.scheduled_at,
    })
  )
}