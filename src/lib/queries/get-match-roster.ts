import { createClient } from "@/src/lib/supabase/server"

export async function getMatchRoster(matchId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("match_rosters")
    .select(`
      id,
      checked_in,
      player:players (
        id,
        first_name,
        last_name,
        photo_url
      ),
      team:teams (
        id,
        name
      )
    `)
    .eq("match_id", matchId)

  if (error) {
    console.error(error)
    return []
  }

  return data || []
}