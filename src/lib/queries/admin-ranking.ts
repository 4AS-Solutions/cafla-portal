import { createClient } from "../supabase/server"

export async function getAdminRanking() {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("dashboard_referee_ranking")
    .select("*")
    .order("ranking_position", { ascending: true })

  if (error) throw error

  return data
}