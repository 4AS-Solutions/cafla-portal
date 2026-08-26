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
