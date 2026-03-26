import { supabaseServer } from "@/src/lib/supabase/server"

export async function getUserMatches(userId: string) {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      home_team,
      away_team,
      league,
      division,
      location,
      field,
      kickoff_at,
      report_status,
      center_referee_id,
      assistant_referee_1_id,
      assistant_referee_2_id
    `)
    .or(`center_referee_id.eq.${userId},assistant_referee_1_id.eq.${userId},assistant_referee_2_id.eq.${userId}`)
    .order("kickoff_at", { ascending: true })

  if (error) {
    console.error("getUserMatches error:", error)
    throw error
  }

  const matches = (data ?? []).map((m) => {

    let role = "AR"

    if (m.center_referee_id === userId) {
      role = "CR"
    }

    if (m.assistant_referee_1_id === userId) {
      role = "AR1"
    }

    if (m.assistant_referee_2_id === userId) {
      role = "AR2"
    }

    return {
      ...m,
      role
    }
  })

  return matches
}