import { supabaseServer } from "@/src/lib/supabase/server"

export type ReportRow = {
  match_id: string
  status: string
  submitted_at: string | null
  home_score: number | null
  away_score: number | null
  matches: {
    home_team: string
    away_team: string
    kickoff_at: string
  }
}

export async function getReports(): Promise<ReportRow[]> {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      home_team,
      away_team,
      kickoff_at,
      match_reports (
        status,
        home_score,
        away_score,
        submitted_at
      )
    `)
    .eq("center_referee_id", user.id)
    .lt("kickoff_at", new Date().toISOString())
    .order("kickoff_at", { ascending: false })

  if (error) {
    console.error("getReports error:", error)
    throw error
  }

  return (data ?? []).map((match: any) => {
    const report = Array.isArray(match.match_reports)
      ? match.match_reports[0]
      : match.match_reports

    return {
      match_id: match.id,

      // 🔥 FIX REAL
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