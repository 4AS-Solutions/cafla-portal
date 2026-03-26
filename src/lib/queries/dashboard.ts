import { supabaseServer } from "../supabase/server"

export async function getUpcomingMatches() {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("dashboard_upcoming_matches")
    .select("*")
    .limit(5)

  if (error) throw error

  return data
}

export async function getPendingReports() {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("dashboard_pending_reports")
    .select("*")
    .limit(5)

  if (error) throw error

  return data
}

export async function getRefereeRanking() {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("dashboard_referee_ranking")
    .select("*")
    .order("ranking_position", { ascending: true })
    .limit(5)

  if (error) throw error

  return data
}

export async function getPendingEvaluations() {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("dashboard_pending_evaluations")
    .select("*")
    .limit(5)

  if (error) throw error

  return data
}

export async function getMyDevelopment(memberId: string) {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("dashboard_referee_ranking")
    .select("*")
    .eq("member_id", memberId)
    .single()

  if (error) throw error

  return data
}
