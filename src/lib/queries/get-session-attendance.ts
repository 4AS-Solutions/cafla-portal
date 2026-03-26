import { supabaseServer } from "@/src/lib/supabase/server"

export async function getSessionAttendance(sessionId: string) {

  const supabase = await supabaseServer()

  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("id, full_name")
    .order("full_name")

  if (membersError) {
    console.error("members error", membersError)
    throw membersError
  }

  const { data: records, error: recordsError } = await supabase
    .from("attendance_records")
    .select("member_id, status")
    .eq("session_id", sessionId)

  if (recordsError) {
    console.error("records error", recordsError)
    throw recordsError
  }

  const statusMap: Record<string, string> = {}

  records?.forEach((r) => {
    statusMap[r.member_id] = r.status
  })

  return {
    members,
    statusMap
  }
}