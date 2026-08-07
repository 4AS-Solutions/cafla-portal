import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

import {
  type AdminAttendanceSession,
  type AttendanceSessionRow,
  getActiveDevelopmentCycle,
  normalizeAttendanceSessions,
} from "./attendance-session-helpers"

export async function getPastAttendanceSessions({
  page = 0,
  limit = 6,
}: {
  page?: number
  limit?: number
}): Promise<{
  data: AdminAttendanceSession[]
  count: number
}> {
  const supabaseAdmin = getSupabaseAdmin()

  const activeCycle =
    await getActiveDevelopmentCycle()

  if (!activeCycle) {
    return {
      data: [],
      count: 0,
    }
  }

  const safePage =
    Number.isFinite(page) && page >= 0
      ? Math.floor(page)
      : 0

  const safeLimit =
    Number.isFinite(limit) && limit > 0
      ? Math.floor(limit)
      : 6

  const from = safePage * safeLimit
  const to = from + safeLimit - 1

  const {
    data,
    count,
    error,
  } = await supabaseAdmin
    .schema("development")
    .from("attendance_sessions")
    .select(
      `
        id,
        cycle_id,
        title,
        session_type,
        scheduled_at,
        location,
        status,
        counts_for_score,
        created_by
      `,
      {
        count: "exact",
      }
    )
    .eq("cycle_id", activeCycle.id)
    .in("status", [
      "completed",
      "cancelled",
    ])
    .order("scheduled_at", {
      ascending: false,
    })
    .range(from, to)

  if (error) {
    console.error(
      "[ATTENDANCE] Unable to load past sessions:",
      error
    )

    throw new Error(
      "Unable to load past attendance sessions."
    )
  }

  const normalized =
    await normalizeAttendanceSessions(
      (data ?? []) as AttendanceSessionRow[],
      activeCycle
    )

  return {
    data: normalized,
    count: count ?? 0,
  }
}