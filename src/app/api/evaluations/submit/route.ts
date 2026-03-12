import { createClient } from "@/src/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

  const supabase = await createClient()

  const body = await req.json()

  const {
    matchId,
    evaluatedId,
    arrival,
    fitness,
    communication,
    teamwork,
    professionalism,
    comments
  } = body

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" })

  const { error } = await supabase
    .from("evaluations")
    .insert({
      match_id: matchId,
      evaluator_id: user.id,
      evaluated_id: evaluatedId,
      arrival_score: arrival,
      fitness_score: fitness,
      communication_score: communication,
      teamwork_score: teamwork,
      professionalism_score: professionalism,
      comments
    })

  if (error) throw error

  return NextResponse.json({ success: true })
}