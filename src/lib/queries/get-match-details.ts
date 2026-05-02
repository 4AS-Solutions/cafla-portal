import { supabaseServer } from "@/src/lib/supabase/server"

export async function getMatchDetails(matchId: string) {

  const supabase = await supabaseServer()

  // 1️⃣ Get match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single()

  if (matchError) {
    console.error("Match query error:", matchError);
    throw matchError
  }

  // 2️⃣ Get referees separately (no join)
  let center = null
  let ar1 = null
  let ar2 = null

  if (match.center_referee_id) {
    const { data } = await supabase
      .from("members")
      .select("full_name")
      .eq("id", match.center_referee_id)
      .single()

    center = data
  }

  if (match.assistant_referee_1_id) {
    const { data } = await supabase
      .from("members")
      .select("full_name")
      .eq("id", match.assistant_referee_1_id)
      .single()

    ar1 = data
  }

  if (match.assistant_referee_2_id) {
    const { data } = await supabase
      .from("members")
      .select("full_name")
      .eq("id", match.assistant_referee_2_id)
      .single()

    ar2 = data
  }

  // 3️⃣ Get report
  const { data: report } = await supabase
    .from("match_reports")
    .select("*")
    .eq("match_id", matchId)
    .maybeSingle()

  let goals = []
  let cards = []
  let assets = []

  if (report) {

    const { data: g } = await supabase
      .from("report_goals")
      .select("*")
      .eq("report_id", report.id)

    const { data: c } = await supabase
      .from("report_cards")
      .select("*")
      .eq("report_id", report.id)

    const { data: a } = await supabase
      .from("report_assets")
      .select("*")
      .eq("report_id", report.id)

    goals = g ?? []
    cards = c ?? []
    assets = a ?? []

  }

  return {
    match,
    center,
    ar1,
    ar2,
    report,
    goals,
    cards,
    assets,
    comments: report?.comments ?? "",
  }
}