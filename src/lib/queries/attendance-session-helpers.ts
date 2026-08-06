import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type AttendanceSessionStatus =
  | "scheduled"
  | "open"
  | "completed"
  | "cancelled"

export type AttendanceSessionType =
  | "class"
  | "training"
  | "meeting"
  | "special"
  | "other"

export type AdminAttendanceSession = {
  id: string
  cycle_id: string
  cycle_name: string

  title: string
  session_type: AttendanceSessionType

  /*
   * Conservamos session_date en la respuesta para no
   * romper todavía los componentes existentes.
   * En PostgreSQL la columna real es scheduled_at.
   */
  session_date: string

  location: string | null
  status: AttendanceSessionStatus
  counts_for_score: boolean

  created_by: string | null
  created_by_user: {
    full_name: string
  } | null
}

type ActiveCycleRow = {
  id: string
  name: string
}

type AttendanceSessionRow = {
  id: string
  cycle_id: string
  title: string
  session_type: AttendanceSessionType
  scheduled_at: string
  location: string | null
  status: AttendanceSessionStatus
  counts_for_score: boolean
  created_by: string | null
}

export async function getActiveDevelopmentCycle(): Promise<ActiveCycleRow | null> {
  const supabaseAdmin = getSupabaseAdmin()

  const { data, error } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select("id, name")
    .eq("status", "active")
    .maybeSingle()

  if (error) {
    console.error(
      "[ATTENDANCE] Unable to load active development cycle:",
      error
    )

    throw new Error(
      "Unable to load the active development cycle."
    )
  }

  return data as ActiveCycleRow | null
}

export async function normalizeAttendanceSessions(
  rows: AttendanceSessionRow[],
  cycle: ActiveCycleRow
): Promise<AdminAttendanceSession[]> {
  const supabaseAdmin = getSupabaseAdmin()

  const creatorIds = [
    ...new Set(
      rows
        .map((row) => row.created_by)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  const creatorsById = new Map<string, string>()

  if (creatorIds.length > 0) {
    const { data: creators, error } = await supabaseAdmin
      .from("members")
      .select("id, full_name")
      .in("id", creatorIds)

    if (error) {
      console.error(
        "[ATTENDANCE] Unable to load session creators:",
        error
      )

      throw new Error(
        "Unable to load attendance session creators."
      )
    }

    for (const creator of creators ?? []) {
      creatorsById.set(creator.id, creator.full_name)
    }
  }

  return rows.map((row) => {
    const creatorName = row.created_by
      ? creatorsById.get(row.created_by)
      : null

    return {
      id: row.id,
      cycle_id: row.cycle_id,
      cycle_name: cycle.name,

      title: row.title,
      session_type: row.session_type,
      session_date: row.scheduled_at,
      location: row.location,

      status: row.status,
      counts_for_score: row.counts_for_score,

      created_by: row.created_by,
      created_by_user: creatorName
        ? { full_name: creatorName }
        : null,
    }
  })
}

export type { AttendanceSessionRow }