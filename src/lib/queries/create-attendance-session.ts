import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type AttendanceSessionType =
  | "class"
  | "training"
  | "meeting"
  | "special"
  | "other"

type CreateSessionInput = {
  title: string
  sessionType: AttendanceSessionType
  scheduledAt: string
  location?: string | null
  countsForScore: boolean
  createdBy: string
}

export async function createAttendanceSession(
  input: CreateSessionInput
) {
  const supabaseAdmin =
    getSupabaseAdmin()

  const {
    data: activeCycle,
    error: cycleError,
  } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select(`
      id,
      name,
      start_date,
      end_date
    `)
    .eq("status", "active")
    .maybeSingle()

  if (cycleError) {
    console.error(
      "[ATTENDANCE] Active cycle query failed:",
      cycleError
    )

    throw new Error(
      "Unable to load the active development cycle."
    )
  }

  if (!activeCycle) {
    throw new Error(
      "There is no active development cycle."
    )
  }

  const scheduledDate = new Date(
    input.scheduledAt
  )

  if (
    Number.isNaN(
      scheduledDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid session date."
    )
  }

  if (
    scheduledDate.getTime() <=
    Date.now()
  ) {
    throw new Error(
      "Attendance sessions must be scheduled in the future."
    )
  }

  /*
   * Comprueba que la fecha local de la sesión esté
   * dentro del periodo oficial del ciclo.
   */
  const localSessionDate =
    new Intl.DateTimeFormat("en-CA", {
      timeZone:
        "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(scheduledDate)

  if (
    localSessionDate <
      activeCycle.start_date ||
    localSessionDate >
      activeCycle.end_date
  ) {
    throw new Error(
      `The session must be scheduled within ${activeCycle.name}.`
    )
  }

  const { data, error } =
    await supabaseAdmin
      .schema("development")
      .from("attendance_sessions")
      .insert({
        cycle_id: activeCycle.id,
        title: input.title.trim(),
        session_type:
          input.sessionType,
        scheduled_at:
          input.scheduledAt,
        location:
          input.location?.trim() ||
          null,
        status: "scheduled",
        counts_for_score:
          input.countsForScore,
        created_by:
          input.createdBy,
      })
      .select(`
        id,
        cycle_id,
        title,
        session_type,
        scheduled_at,
        location,
        status,
        counts_for_score,
        created_by,
        created_at
      `)
      .single()

  if (error) {
    console.error(
      "[ATTENDANCE] Create session failed:",
      error
    )

    throw new Error(
      "Unable to create attendance session."
    )
  }

  return data
}