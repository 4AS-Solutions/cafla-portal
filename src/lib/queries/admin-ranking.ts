import { supabaseServer } from "@/src/lib/supabase/server"

export async function getAdminRanking() {
  const supabase = await supabaseServer()

  // 🔥 ranking actual
  const { data: current, error } = await supabase
    .from("dashboard_referee_ranking_v2")
    .select("*")
    .order("ranking_position", { ascending: true })

  if (error) throw error

  // 🔥 historial (últimos 2 meses)
  const { data: history } = await supabase
    .from("ranking_history")
    .select("*")
    .order("snapshot_date", { ascending: false })

  // 🧠 agrupar por referee
  const historyMap: Record<string, any[]> = {}

  for (const row of history || []) {
    if (!historyMap[row.member_id]) {
      historyMap[row.member_id] = []
    }
    historyMap[row.member_id].push(row)
  }

  // 🔥 merge + calcular trend
  const enriched = (current || []).map((ref: any) => {
    const historyRows = historyMap[ref.id] || []

    const currentSnapshot = historyRows[0]
    const prevSnapshot = historyRows[1]

    let trend = null
    let trendDiff = 0

    if (currentSnapshot && prevSnapshot) {
      trendDiff =
        Number(currentSnapshot.development_score) -
        Number(prevSnapshot.development_score)

      if (trendDiff > 0) trend = "up"
      else if (trendDiff < 0) trend = "down"
      else trend = "same"
    } else if (currentSnapshot) {
      trend = "new"
    }

    return {
      ...ref,
      trend,
      trendDiff,
    }
  })

  return enriched
}