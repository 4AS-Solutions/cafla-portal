import { createClient } from "@/src/lib/supabase/server"

export async function getUserAttendance(userId: string) {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("attendance_records")
    .select(`
      status,
      attendance_sessions (
        id,
        title,
        session_type,
        session_date,
        location
      )
    `)
    .eq("member_id", userId)

  if (error) {
    console.error("attendance error", error)
    throw error
  }

  // ordenar manualmente en JS
  const sorted = (data ?? []).sort((a: any, b: any) => {

    const dateA = new Date(a.attendance_sessions.session_date).getTime()
    const dateB = new Date(b.attendance_sessions.session_date).getTime()

    return dateB - dateA

  })

  return sorted
}