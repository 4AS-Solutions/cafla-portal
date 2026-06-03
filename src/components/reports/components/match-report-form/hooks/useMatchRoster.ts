import { useEffect, useState } from "react"

import { supabase } from "@/src/lib/supabase/client"

type MatchRosterPlayer = {
  id: string
  match_id: string
  checked_in: boolean

  player_id: string
  first_name: string
  last_name: string
  photo_url: string | null

  team_id: string
  team_name: string
}

export function useMatchRoster(matchId?: string) {

  const [players, setPlayers] = useState<MatchRosterPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return

    async function loadRoster() {
      setLoading(true)

      const { data, error } = await supabase
        .schema("tournaments")
        .from("match_roster_view")
        .select("*")
        .eq("match_id", matchId)

      if (error) {
        console.error(error)
        setPlayers([])
        setLoading(false)
        return
      }

      setPlayers(data || [])
      setLoading(false)
    }

    loadRoster()
  }, [matchId])

  return {
    players,
    loading,
  }
}