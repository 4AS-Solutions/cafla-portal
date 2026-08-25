import "server-only"

import { getUser } from "@/src/lib/auth/get-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type EvaluationScoreStatus =
  | "insufficient_feedback"
  | "compliance_pending"
  | "scored"

export type UserEvaluationScore = {
  cycle_id: string
  cycle_name: string
  member_id: string
  evaluations_required_total: number
  evaluations_pending: number
  evaluations_completed_on_time: number
  evaluations_completed_late: number
  evaluations_missed: number
  compliance_percentage: number | null
  evaluations_received: number
  quality_percentage: number | null
  avg_arrival: number | null
  avg_fitness: number | null
  avg_communication: number | null
  avg_teamwork: number | null
  avg_professionalism: number | null
  evaluation_score: number | null
  evaluation_status: EvaluationScoreStatus
}

type NullableNumericField = number | string | null

type EvaluationScoreRow = Omit<
  UserEvaluationScore,
  | "evaluations_required_total"
  | "evaluations_pending"
  | "evaluations_completed_on_time"
  | "evaluations_completed_late"
  | "evaluations_missed"
  | "compliance_percentage"
  | "evaluations_received"
  | "quality_percentage"
  | "avg_arrival"
  | "avg_fitness"
  | "avg_communication"
  | "avg_teamwork"
  | "avg_professionalism"
  | "evaluation_score"
> & {
  evaluations_required_total: NullableNumericField
  evaluations_pending: NullableNumericField
  evaluations_completed_on_time: NullableNumericField
  evaluations_completed_late: NullableNumericField
  evaluations_missed: NullableNumericField
  compliance_percentage: NullableNumericField
  evaluations_received: NullableNumericField
  quality_percentage: NullableNumericField
  avg_arrival: NullableNumericField
  avg_fitness: NullableNumericField
  avg_communication: NullableNumericField
  avg_teamwork: NullableNumericField
  avg_professionalism: NullableNumericField
  evaluation_score: NullableNumericField
}

function toNullableNumber(value: NullableNumericField): number | null {
  return value === null ? null : Number(value)
}

export async function getUserEvaluationScore(): Promise<UserEvaluationScore | null> {
  const user = await getUser()

  if (!user) throw new Error("Unauthorized")

  const supabaseAdmin = getSupabaseAdmin()
  const { data: activeCycle, error: activeCycleError } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select("id")
    .eq("status", "active")
    .maybeSingle()

  if (activeCycleError) {
    console.error("[EVALUATIONS V2] Unable to load the active development cycle:", activeCycleError)
    throw new Error("Unable to load the active development cycle.")
  }

  if (!activeCycle) return null

  const { data, error } = await supabaseAdmin
    .schema("development")
    .from("referee_evaluation_score")
    .select(`
      cycle_id,
      cycle_name,
      member_id,
      evaluations_required_total,
      evaluations_pending,
      evaluations_completed_on_time,
      evaluations_completed_late,
      evaluations_missed,
      compliance_percentage,
      evaluations_received,
      quality_percentage,
      avg_arrival,
      avg_fitness,
      avg_communication,
      avg_teamwork,
      avg_professionalism,
      evaluation_score,
      evaluation_status
    `)
    .eq("cycle_id", activeCycle.id)
    .eq("member_id", user.id)
    .maybeSingle()

  if (error) {
    console.error("[EVALUATIONS V2] Unable to load the referee evaluation score:", error)
    throw new Error("Unable to load the referee evaluation score.")
  }

  if (!data) return null

  const row = data as EvaluationScoreRow

  return {
    cycle_id: row.cycle_id,
    cycle_name: row.cycle_name,
    member_id: row.member_id,
    evaluations_required_total: Number(row.evaluations_required_total ?? 0),
    evaluations_pending: Number(row.evaluations_pending ?? 0),
    evaluations_completed_on_time: Number(row.evaluations_completed_on_time ?? 0),
    evaluations_completed_late: Number(row.evaluations_completed_late ?? 0),
    evaluations_missed: Number(row.evaluations_missed ?? 0),
    compliance_percentage: toNullableNumber(row.compliance_percentage),
    evaluations_received: Number(row.evaluations_received ?? 0),
    quality_percentage: toNullableNumber(row.quality_percentage),
    avg_arrival: toNullableNumber(row.avg_arrival),
    avg_fitness: toNullableNumber(row.avg_fitness),
    avg_communication: toNullableNumber(row.avg_communication),
    avg_teamwork: toNullableNumber(row.avg_teamwork),
    avg_professionalism: toNullableNumber(row.avg_professionalism),
    evaluation_score: toNullableNumber(row.evaluation_score),
    evaluation_status: row.evaluation_status,
  }
}
