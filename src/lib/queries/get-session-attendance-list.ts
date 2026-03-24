import { supabaseServer } from "@/src/lib/supabase/server"

export async function getSessionAttendanceList(sessionId: string) {

  const supabase = await supabaseServer()

  const { data: members } = await supabase
    .from("members")
    .select("id, full_name")
    .order("full_name")

  const { data: records } = await supabase
    .from("attendance_records")
    .select("member_id, status")
    .eq("session_id", sessionId)

  const map: Record<string, string> = {}

  records?.forEach((r) => {
    map[r.member_id] = r.status
  })

  const result = members?.map((m) => ({
    name: m.full_name,
    status: map[m.id] || "absent"
  }))

  return result ?? []
}