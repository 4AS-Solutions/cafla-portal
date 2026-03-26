import { supabaseServer } from "@/src/lib/supabase/server"

export async function getMemberDashboard(member_id: string) {

  const supabase = await supabaseServer()

  const [
    development,
    attendance,
    quiz,
    reports,
    matches,
    activity
  ] = await Promise.all([

    supabase
      .from("dashboard_referee_development_score")
      .select("*")
      .eq("member_id", member_id)
      .single(),

    supabase
      .from("dashboard_referee_attendance")
      .select("*")
      .eq("member_id", member_id)
      .single(),

    supabase
      .from("dashboard_quiz_scores")
      .select("*")
      .eq("member_id", member_id)
      .single(),

    supabase
      .from("dashboard_referee_report_score")
      .select("*")
      .eq("member_id", member_id)
      .single(),

    supabase
      .from("dashboard_referee_matches")
      .select("*")
      .eq("id", member_id)
      .single(),

    supabase
      .from("dashboard_referee_activity")
      .select("*")
      .eq("member_id", member_id)
      .single(),
  ])

  return {
    development: development.data,
    attendance: attendance.data,
    quiz: quiz.data,
    reports: reports.data,
    matches: matches.data,
    activity: activity.data,
  }
}