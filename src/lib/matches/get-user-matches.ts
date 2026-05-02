import { supabaseServer } from "@/src/lib/supabase/server"

export async function getUserMatches(userId: string) {

  const supabase = await supabaseServer()

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
      center_referee_id,
      assistant_referee_1_id,
      assistant_referee_2_id,
      match_reports (
        status,
        submitted_at
      )
    `)
    .or(`center_referee_id.eq.${userId},assistant_referee_1_id.eq.${userId},assistant_referee_2_id.eq.${userId}`)
    .order("kickoff_at", { ascending: true })

  if (error) {
    console.error("getUserMatches error:", error)
    throw error
  }

  const matches = (data ?? []).map((m: any) => {

    let role = "AR"

    if (m.center_referee_id === userId) role = "CR"
    if (m.assistant_referee_1_id === userId) role = "AR1"
    if (m.assistant_referee_2_id === userId) role = "AR2"

    // 🔥 FIX: tomar el status real
    const report = Array.isArray(m.match_reports)
      ? m.match_reports[0]
      : m.match_reports

    const report_status = report?.status ?? "pending"

    return {
      ...m,
      role,
      report_status, // 🔥 ahora correcto
    }
  })

  return matches
}