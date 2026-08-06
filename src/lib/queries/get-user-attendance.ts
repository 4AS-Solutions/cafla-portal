import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type AttendanceStatus =
  | "present"
  | "late"
  | "excused"
  | "absent"

type AttendanceDetailRow = {
  session_id: string
  session_title: string
  session_type:
    | "class"
    | "training"
    | "meeting"
    | "special"
    | "other"
  scheduled_at: string
  location: string | null
  attendance_status: AttendanceStatus
}

type AttendanceSummaryRow = {
  cycle_id: string
  cycle_name: string
  cycle_status: "draft" | "active" | "closed" | "archived"

  sessions_total: number
  sessions_present: number
  sessions_late: number
  sessions_excused: number
  sessions_absent: number

  attendance_points: number | string
  attendance_percentage: number | string
}

export async function getUserAttendance(
  userId: string
) {
  const supabaseAdmin = getSupabaseAdmin()

  /*
   * Primero obtenemos el resumen del usuario
   * dentro del ciclo activo.
   */
  const {
    data: summaryData,
    error: summaryError,
  } = await supabaseAdmin
    .schema("development")
    .from("referee_attendance")
    .select(`
      cycle_id,
      cycle_name,
      cycle_status,
      sessions_total,
      sessions_present,
      sessions_late,
      sessions_excused,
      sessions_absent,
      attendance_points,
      attendance_percentage
    `)
    .eq("member_id", userId)
    .eq("cycle_status", "active")
    .maybeSingle()

  if (summaryError) {
    console.error(
      "[ATTENDANCE] Unable to load attendance summary:",
      summaryError
    )

    throw new Error(
      "Unable to load attendance summary."
    )
  }

  /*
   * Si el miembro no está inscrito en el ciclo activo,
   * devolvemos una página vacía en lugar de fallar.
   */
  if (!summaryData) {
    return {
      cycle: null,

      sessions: [],

      stats: {
        total: 0,
        present: 0,
        late: 0,
        excused: 0,
        absent: 0,
        points: 0,
        percentage: 0,
      },
    }
  }

  const summary =
    summaryData as AttendanceSummaryRow

  /*
   * Después obtenemos el historial detallado
   * solamente para ese usuario y ese ciclo.
   */
  const {
    data: detailData,
    error: detailError,
  } = await supabaseAdmin
    .schema("development")
    .from("referee_attendance_detail")
    .select(`
      session_id,
      session_title,
      session_type,
      scheduled_at,
      location,
      attendance_status
    `)
    .eq("member_id", userId)
    .eq("cycle_id", summary.cycle_id)
    .order("scheduled_at", {
      ascending: false,
    })

  if (detailError) {
    console.error(
      "[ATTENDANCE] Unable to load attendance history:",
      detailError
    )

    throw new Error(
      "Unable to load attendance history."
    )
  }

  const detailRows =
    (detailData ?? []) as AttendanceDetailRow[]

  /*
   * Conservamos temporalmente la misma estructura
   * que espera AttendanceHistoryTable.
   */
  const sessions = detailRows.map((row) => ({
    id: row.session_id,
    title: row.session_title,
    session_type: row.session_type,
    session_date: row.scheduled_at,
    location: row.location,
    status: row.attendance_status,
  }))

  return {
    cycle: {
      id: summary.cycle_id,
      name: summary.cycle_name,
      status: summary.cycle_status,
    },

    sessions,

    stats: {
      total: Number(summary.sessions_total),
      present: Number(summary.sessions_present),
      late: Number(summary.sessions_late),
      excused: Number(summary.sessions_excused),
      absent: Number(summary.sessions_absent),
      points: Number(summary.attendance_points),
      percentage: Number(
        summary.attendance_percentage
      ),
    },
  }
}