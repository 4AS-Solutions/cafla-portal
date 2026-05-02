import { supabaseServer } from "../supabase/server"

export type AdminReportRow = {
  match_id: string
  status: string
  submitted_at: string | null
  home_score: number | null
  away_score: number | null
  referee_id: string
  matches: {
    home_team: string
    away_team: string
    kickoff_at: string
  }
}

export async function getReportsAdmin(): Promise<AdminReportRow[]> {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      home_team,
      away_team,
      kickoff_at,
      center_referee_id,
      match_reports (
        status,
        home_score,
        away_score,
        submitted_at
      )
    `)
    .lt("kickoff_at", new Date().toISOString())
    .order("kickoff_at", { ascending: false })

  if (error) {
    console.error("getReportsAdmin error:", error)
    throw error
  }

  return (data ?? []).map((match: any) => {
    const report = Array.isArray(match.match_reports)
      ? match.match_reports[0]
      : match.match_reports

    return {
      match_id: match.id,
      referee_id: match.center_referee_id, // 🔥 CLAVE PARA ADMIN

      status: report?.status ?? "pending",
      submitted_at: report?.submitted_at ?? null,
      home_score: report?.home_score ?? null,
      away_score: report?.away_score ?? null,

      matches: {
        home_team: match.home_team,
        away_team: match.away_team,
        kickoff_at: match.kickoff_at,
      },
    }
  })
}