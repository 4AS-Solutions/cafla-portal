import { supabaseServer } from "@/src/lib/supabase/server"

export async function getMatchForReport(matchId: string) {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      match_reports (
        id,
        status,
        home_score,
        away_score,
        comments,
        submitted_at,

        report_goals (*),
        report_cards (*),
        report_injuries (*),
        report_assets (*)
      )
    `)
    .eq("id", matchId)
    .maybeSingle()

  if (error) {
    console.error(error)
    throw error
  }

  const rawReport = data?.match_reports ?? null

  const report = rawReport
    ? {
        ...rawReport,
        goals: rawReport.report_goals ?? [],
        cards: rawReport.report_cards ?? [],
        injuries: rawReport.report_injuries ?? [],
        assets: rawReport.report_assets ?? [],
      }
    : null

  return {
    match: data,
    report,
  }
}