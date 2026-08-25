import "server-only"

import { getUser } from "@/src/lib/auth/get-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type EvaluationObligationStatus =
  | "pending"
  | "completed_on_time"
  | "completed_late"
  | "missed"

export type UserEvaluationObligation = {
  cycle_id: string
  cycle_name: string
  match_id: string
  home_team: string
  away_team: string
  league: string | null
  division: string | null
  location: string | null
  field: string | null
  kickoff_at: string
  match_date_la: string
  evaluation_deadline: string
  evaluator_id: string
  evaluator_name: string
  evaluator_role: string
  evaluated_id: string
  evaluated_name: string
  evaluated_role: string
  evaluation_id: string | null
  created_at: string | null
  created_at_la: string | null
  arrival_score: number | null
  fitness_score: number | null
  communication_score: number | null
  teamwork_score: number | null
  professionalism_score: number | null
  comments: string | null
  quality_percentage: number | null
  obligation_status: EvaluationObligationStatus
  compliance_point: number
}

type EvaluationObligationRow = Omit<
  UserEvaluationObligation,
  | "arrival_score"
  | "fitness_score"
  | "communication_score"
  | "teamwork_score"
  | "professionalism_score"
  | "quality_percentage"
  | "compliance_point"
> & {
  arrival_score: number | string | null
  fitness_score: number | string | null
  communication_score: number | string | null
  teamwork_score: number | string | null
  professionalism_score: number | string | null
  quality_percentage: number | string | null
  compliance_point: number | string | null
}

function toNullableNumber(
  value: number | string | null
): number | null {
  return value === null
    ? null
    : Number(value)
}

export async function getUserEvaluationObligations(): Promise<
  UserEvaluationObligation[]
> {
  const user = await getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const supabaseAdmin = getSupabaseAdmin()

  const {
    data: activeCycle,
    error: activeCycleError,
  } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select("id")
    .eq("status", "active")
    .maybeSingle()

  if (activeCycleError) {
    console.error(
      "[EVALUATIONS V2] Unable to load the active development cycle:",
      activeCycleError
    )

    throw new Error(
      "Unable to load the active development cycle."
    )
  }

  if (!activeCycle) {
    return []
  }

  const { data, error } = await supabaseAdmin
    .schema("development")
    .from("referee_evaluation_detail")
    .select(`
      cycle_id,
      cycle_name,
      match_id,
      home_team,
      away_team,
      league,
      division,
      location,
      field,
      kickoff_at,
      match_date_la,
      evaluation_deadline,
      evaluator_id,
      evaluator_name,
      evaluator_role,
      evaluated_id,
      evaluated_name,
      evaluated_role,
      evaluation_id,
      created_at,
      created_at_la,
      arrival_score,
      fitness_score,
      communication_score,
      teamwork_score,
      professionalism_score,
      comments,
      quality_percentage,
      obligation_status,
      compliance_point
    `)
    .eq("cycle_id", activeCycle.id)
    .eq("evaluator_id", user.id)
    .order("kickoff_at", {
      ascending: false,
    })

  if (error) {
    console.error(
      "[EVALUATIONS V2] Unable to load evaluation obligations:",
      error
    )

    throw new Error(
      "Unable to load evaluation obligations."
    )
  }

  const rows = (data ?? []) as EvaluationObligationRow[]

  return rows.map((row) => ({
    ...row,
    arrival_score: toNullableNumber(row.arrival_score),
    fitness_score: toNullableNumber(row.fitness_score),
    communication_score: toNullableNumber(
      row.communication_score
    ),
    teamwork_score: toNullableNumber(row.teamwork_score),
    professionalism_score: toNullableNumber(
      row.professionalism_score
    ),
    quality_percentage: toNullableNumber(
      row.quality_percentage
    ),
    compliance_point: Number(row.compliance_point ?? 0),
  }))
}
