import { supabaseServer } from "@/src/lib/supabase/server"

export type ReportRow = {
  id: string
  match_id: string
  home_score: number
  away_score: number
  status: string
  submitted_at: string | null
  matches: {
    home_team: string
    away_team: string
    kickoff_at: string
  } | null
}

export async function getReports(): Promise<ReportRow[]> {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("match_reports")
    .select(`
      id,
      match_id,
      home_score,
      away_score,
      status,
      submitted_at,
      matches (
        home_team,
        away_team,
        kickoff_at
      )
    `)
    .order("submitted_at", { ascending: false })

  if (error) {
    console.error("getReports error:", error)
    throw error
  }

  const normalized: ReportRow[] = (data ?? []).map((report: any) => {
    const rawMatch = Array.isArray(report.matches)
      ? report.matches[0] ?? null
      : report.matches ?? null

    return {
      id: report.id,
      match_id: report.match_id,
      home_score: report.home_score,
      away_score: report.away_score,
      status: report.status,
      submitted_at: report.submitted_at,
      matches: rawMatch
        ? {
            home_team: rawMatch.home_team,
            away_team: rawMatch.away_team,
            kickoff_at: rawMatch.kickoff_at,
          }
        : null,
    }
  })

  return normalized
}