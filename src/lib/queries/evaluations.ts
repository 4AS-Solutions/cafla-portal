import { createClient } from "../supabase/server"

export async function getPendingEvaluations(memberId: string) {

  const supabase = await createClient()

  const { data: matches, error } = await supabase
    .from("matches")
    .select(`
      id,
      home_team,
      away_team,
      kickoff_at,
      center_referee_id,
      assistant_referee_1_id,
      assistant_referee_2_id
    `)
    .or(`center_referee_id.eq.${memberId},assistant_referee_1_id.eq.${memberId},assistant_referee_2_id.eq.${memberId}`)
    .lt("kickoff_at", new Date().toISOString())

  if (error) throw error

  const { data: members } = await supabase
    .from("members")
    .select("id, full_name")

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("match_id, evaluated_id")
    .eq("evaluator_id", memberId)

  const evaluatedSet = new Set(
    evaluations?.map(e => `${e.match_id}-${e.evaluated_id}`)
  )

  const pending: any[] = []

  matches?.forEach(match => {

    const crew = [
      match.center_referee_id,
      match.assistant_referee_1_id,
      match.assistant_referee_2_id
    ]

    const uniqueCrew = [...new Set(crew)]

    uniqueCrew.forEach(refId => {

      if (!refId || refId === memberId) return

      const key = `${match.id}-${refId}`

      if (evaluatedSet.has(key)) return

      const referee = members?.find(m => m.id === refId)

      pending.push({
        match_id: match.id,
        home_team: match.home_team,
        away_team: match.away_team,
        referee_id: refId,
        referee_name: referee?.full_name
      })

    })

  })

  return pending
}