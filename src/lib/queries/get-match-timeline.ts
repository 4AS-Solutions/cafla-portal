import { createClient } from "@/src/lib/supabase/server"

export async function getMatchTimeline(matchId: string) {
  const supabase = await createClient()

  const { data: report } = await supabase
    .from("match_reports")
    .select("id")
    .eq("match_id", matchId)
    .maybeSingle()

  if (!report) return []

  const { data: goals } = await supabase
    .from("report_goals")
    .select("*")
    .eq("report_id", report.id)

  const { data: cards } = await supabase
    .from("report_cards")
    .select("*")
    .eq("report_id", report.id)

  const goalEvents =
    goals?.map((g) => ({
      minute: g.minute,
      type: "goal" as const,
      player: g.player_name,
      number: g.player_number,
      team: g.team,
    })) ?? []

  const cardEvents =
    cards?.map((c) => ({
      minute: c.minute,
      type: "card" as const,
      card_type: c.card_type,
      player: c.player_name,
      number: c.player_number,
      team: c.team,
    })) ?? []

  const events = [...goalEvents, ...cardEvents]

  events.sort((a, b) => a.minute - b.minute)

  return events
}