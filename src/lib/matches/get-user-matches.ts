import { createClient } from "@/src/lib/supabase/server"

export async function getUserMatches(userId: string) {

  const supabase = await createClient()

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
      report_status
    `)
    .or(`center_referee_id.eq.${userId},assistant_referee_1_id.eq.${userId},assistant_referee_2_id.eq.${userId}`)
    .order("kickoff_at", { ascending: true })

  if (error) {
    console.error("getUserMatches error:", error)
    throw error
  }

  return data ?? []
}