import { supabaseServer } from "../supabase/server"

export async function getMyQuizStats(memberId: string) {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("dashboard_quiz_scores")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle()

  if (error) throw error

  return data
}


export async function getMyAttendanceStats(memberId: string) {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("dashboard_referee_attendance")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle()

  if (error) throw error

  return data
}


export async function getMyPeerFeedback(memberId: string) {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("dashboard_peer_feedback_score")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle()

  if (error) throw error

  return data
}


export async function getMyReportScore(memberId: string) {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("dashboard_referee_report_score")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle()

  if (error) throw error

  return data
}