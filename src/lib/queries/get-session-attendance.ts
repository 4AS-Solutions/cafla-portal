import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type AttendanceStatus =
  | "present"
  | "late"
  | "excused"

type SessionStatus =
  | "scheduled"
  | "open"
  | "completed"
  | "cancelled"

type SessionType =
  | "class"
  | "training"
  | "meeting"
  | "special"
  | "other"

type SessionRow = {
  id: string
  cycle_id: string
  title: string
  session_type: SessionType
  scheduled_at: string
  location: string | null
  status: SessionStatus
  counts_for_score: boolean
  created_by: string | null
}

type CycleRow = {
  id: string
  name: string
  start_date: string
  end_date: string
  status: "draft" | "active" | "closed" | "archived"
}

type CycleMemberRow = {
  member_id: string
  effective_from: string
  effective_until: string | null
  enrollment_type:
    | "existing_member"
    | "new_member"
  status:
    | "active"
    | "withdrawn"
    | "ineligible"
  eligible_for_ranking: boolean
}

type MemberRow = {
  id: string
  full_name: string
}

type AttendanceRecordRow = {
  member_id: string
  status: AttendanceStatus
}

export async function getSessionAttendance(
  sessionId: string
) {
  const supabaseAdmin = getSupabaseAdmin()

  /*
   * 1. Cargar la sesión.
   */
  const {
    data: sessionData,
    error: sessionError,
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
    .eq("id", sessionId)
    .maybeSingle()

  if (sessionError) {
    console.error(
      "[ATTENDANCE] Unable to load session:",
      sessionError
    )

    throw new Error(
      "Unable to load attendance session."
    )
  }

  if (!sessionData) {
    throw new Error(
      "Attendance session not found."
    )
  }

  const session = sessionData as SessionRow

  /*
   * 2. Cargar el ciclo de la sesión.
   */
  const {
    data: cycleData,
    error: cycleError,
  } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select(`
      id,
      name,
      start_date,
      end_date,
      status
    `)
    .eq("id", session.cycle_id)
    .single()

  if (cycleError) {
    console.error(
      "[ATTENDANCE] Unable to load session cycle:",
      cycleError
    )

    throw new Error(
      "Unable to load the development cycle."
    )
  }

  const cycle = cycleData as CycleRow

  /*
   * Convertimos la fecha de la sesión a la fecha local
   * de Los Ángeles para evaluar effective_from.
   */
  const sessionLocalDate =
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(session.scheduled_at))

  /*
   * 3. Cargar participantes elegibles para esa sesión.
   *
   * No usamos public.members directamente como fuente
   * de participantes. cycle_members define quién pertenece
   * oficialmente al ciclo y desde cuándo.
   */
  const {
    data: cycleMembersData,
    error: cycleMembersError,
  } = await supabaseAdmin
    .schema("development")
    .from("cycle_members")
    .select(`
      member_id,
      effective_from,
      effective_until,
      enrollment_type,
      status,
      eligible_for_ranking
    `)
    .eq(
      "cycle_id",
      session.cycle_id
    )
    .in("status", [
      "active",
      "withdrawn",
    ])

  if (cycleMembersError) {
    console.error(
      "[ATTENDANCE] Unable to load cycle members:",
      cycleMembersError
    )

    throw new Error(
      "Unable to load session participants."
    )
  }

  const eligibleCycleMembers =
    (
      cycleMembersData ?? []
    ) as CycleMemberRow[]

  /*
   * Excluir miembros cuyo effective_until terminó
   * antes de esta sesión.
   */
  const eligibleMembers =
    eligibleCycleMembers.filter(
      (cycleMember) => {

        // EXISTING MEMBER
        // Ya pertenecía a CAFLA durante el ciclo,
        // aunque se haya agregado al sistema después.
        if (
          cycleMember.enrollment_type ===
          "existing_member"
        ) {
          return (
            !cycleMember.effective_until ||
            cycleMember.effective_until >=
              sessionLocalDate
          )
        }

        // NEW MEMBER
        // Solo cuenta desde su fecha real de ingreso.
        return (
          cycleMember.effective_from <=
            sessionLocalDate &&
          (
            !cycleMember.effective_until ||
            cycleMember.effective_until >=
              sessionLocalDate
          )
        )
      }
    )

  const memberIds = eligibleMembers.map(
    (cycleMember) =>
      cycleMember.member_id
  )

  /*
   * 4. Cargar nombres.
   */
  let members: MemberRow[] = []

  if (memberIds.length > 0) {
    const {
      data: memberData,
      error: membersError,
    } = await supabaseAdmin
      .from("members")
      .select("id, full_name")
      .in("id", memberIds)
      .order("full_name", {
        ascending: true,
      })

    if (membersError) {
      console.error(
        "[ATTENDANCE] Unable to load member names:",
        membersError
      )

      throw new Error(
        "Unable to load session participants."
      )
    }

    members =
      (memberData ?? []) as MemberRow[]
  }

  /*
   * 5. Cargar registros guardados.
   */
  const {
    data: recordsData,
    error: recordsError,
  } = await supabaseAdmin
    .schema("development")
    .from("attendance_records")
    .select(`
      member_id,
      status
    `)
    .eq("session_id", session.id)

  if (recordsError) {
    console.error(
      "[ATTENDANCE] Unable to load attendance records:",
      recordsError
    )

    throw new Error(
      "Unable to load attendance records."
    )
  }

  const records =
    (recordsData ?? []) as AttendanceRecordRow[]

  const statusMap: Record<
    string,
    AttendanceStatus
  > = {}

  for (const record of records) {
    statusMap[record.member_id] =
      record.status
  }

  const marked = records.length

  const present = records.filter(
    (record) =>
      record.status === "present"
  ).length

  const late = records.filter(
    (record) =>
      record.status === "late"
  ).length

  const excused = records.filter(
    (record) =>
      record.status === "excused"
  ).length

  return {
    session: {
      id: session.id,
      cycleId: session.cycle_id,
      cycleName: cycle.name,

      title: session.title,
      sessionType: session.session_type,
      scheduledAt: session.scheduled_at,
      location: session.location,

      status: session.status,
      countsForScore:
        session.counts_for_score,
    },

    members,

    statusMap,

    summary: {
      total: members.length,
      marked,
      present,
      late,
      excused,

      /*
       * Durante scheduled/open lo llamaremos unmarked.
       * Al completar, esos mismos miembros serán absent.
       */
      unmarked: Math.max(
        members.length - marked,
        0
      ),

      absent:
        session.status === "completed"
          ? Math.max(
              members.length - marked,
              0
            )
          : 0,
    },
  }
}