import { createClient } from "../supabase/server"

export async function getUpcomingMatches() {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("dashboard_upcoming_matches")
    .select("*")
    .limit(5)

  if (error) throw error

  return data
}

export async function getPendingReports() {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("dashboard_pending_reports")
    .select("*")
    .limit(5)

  if (error) throw error

  return data
}

export async function getRefereeRanking() {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("dashboard_referee_ranking")
    .select("*")
    .limit(5)

  if (error) throw error

  return data
}

export async function getPendingEvaluations() {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("dashboard_pending_evaluations")
    .select("*")
    .limit(5)

  if (error) throw error

  return data
}