import { SupabaseClient } from "@supabase/supabase-js"

export async function createMatchRosterSnapshot(
  supabase: SupabaseClient,
  matchId: string,
  homeTeam: string,
  awayTeam: string
) {

  // ---------------------------------------------------
  // FIND TEAMS
  // ---------------------------------------------------

  const { data: teams, error: teamsError } = await supabase
    .schema("tournaments")
    .from("teams")
    .select("id, name")
    .in("name", [homeTeam, awayTeam])

  if (teamsError || !teams || teams.length === 0) {
    console.error("Teams not found:", teamsError)
    return
  }

  const teamIds = teams.map((team) => team.id)

  // ---------------------------------------------------
  // FIND PLAYERS
  // ---------------------------------------------------

  const { data: players, error: playersError } = await supabase
    .schema("tournaments")
    .from("players")
    .select("id, team_id")
    .in("team_id", teamIds)

  if (playersError || !players || players.length === 0) {
    console.error("Players not found:", playersError)
    return
  }

  // ---------------------------------------------------
  // CREATE SNAPSHOT
  // ---------------------------------------------------

  const rosterRows = players.map((player) => ({
    match_id: matchId,
    player_id: player.id,
    team_id: player.team_id,
    checked_in: false,
  }))

  const { error: rosterError } = await supabase
    .schema("tournaments")
    .from("match_rosters")
    .insert(rosterRows)

  if (rosterError) {
    console.error("Roster snapshot error:", rosterError)
  }

  // console.log(
  //   `Roster snapshot created for match ${matchId}`
  // )
  console.log(
    `Roster snapshot created for match`
  )
}