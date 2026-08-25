import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type AttendanceRankingRow = {
  member_id: string
  full_name: string

  enrollment_type:
    | "existing_member"
    | "new_member"

  effective_from: string

  sessions_total: number
  sessions_present: number
  sessions_late: number
  sessions_excused: number
  sessions_absent: number

  attendance_points: number
  attendance_percentage: number
}

const EXCLUDED_MEMBERS = new Set([
  "CAFLA Administrator",
  "Alfredo Sandoval",
])

export async function getAttendanceRanking(): Promise<
  AttendanceRankingRow[]
> {
  const supabaseAdmin =
    getSupabaseAdmin()

  const {
    data,
    error,
  } = await supabaseAdmin
    .schema("development")
    .from("referee_attendance")
    .select(`
      member_id,
      full_name,
      enrollment_type,
      effective_from,
      sessions_total,
      sessions_present,
      sessions_late,
      sessions_excused,
      sessions_absent,
      attendance_points,
      attendance_percentage
    `)
    .eq(
      "cycle_status",
      "active"
    )
    .eq(
      "cycle_member_status",
      "active"
    )
    .order(
      "attendance_percentage",
      {
        ascending: false,
      }
    )
    .order(
      "sessions_total",
      {
        ascending: false,
      }
    )
    .order(
      "full_name",
      {
        ascending: true,
      }
    )

  if (error) {
    console.error(
      "[ATTENDANCE] Unable to load attendance ranking:",
      error
    )

    throw new Error(
      "Unable to load attendance ranking."
    )
  }

  return (data ?? [])
    .filter(
      (row) =>
        !EXCLUDED_MEMBERS.has(
          row.full_name.trim()
        )
    )
    .map((row) => ({
      member_id:
        row.member_id,

      full_name:
        row.full_name,

      enrollment_type:
        row.enrollment_type,

      effective_from:
        row.effective_from,

      sessions_total:
        Number(
          row.sessions_total ?? 0
        ),

      sessions_present:
        Number(
          row.sessions_present ?? 0
        ),

      sessions_late:
        Number(
          row.sessions_late ?? 0
        ),

      sessions_excused:
        Number(
          row.sessions_excused ?? 0
        ),

      sessions_absent:
        Number(
          row.sessions_absent ?? 0
        ),

      attendance_points:
        Number(
          row.attendance_points ?? 0
        ),

      attendance_percentage:
        Number(
          row.attendance_percentage ?? 0
        ),
    }))
}