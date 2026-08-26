import "server-only"

import type { AdminRankingReferee } from "@/src/components/admin/ranking/types"
import type { EvidenceStatus } from "@/src/lib/queries/get-development-ranking-v2"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type NullableNumeric = number | string | null

type SnapshotRow = Omit<
  AdminRankingReferee,
  | "full_name"
  | "development_score"
  | "evidence_percentage"
  | "evidence_factor_percentage"
  | "ranking_score"
  | "ranking_position"
  | "ranking_percentile"
  | "eligible_referees"
  | "attendance_evidence_count"
  | "quiz_assessments_counted"
  | "reports_required"
  | "evaluations_due"
  | "evaluations_received"
> & {
  evidence_status: EvidenceStatus
  development_score: NullableNumeric
  evidence_percentage: NullableNumeric
  evidence_factor_percentage: NullableNumeric
  ranking_score: NullableNumeric
  ranking_position: NullableNumeric
  ranking_percentile: NullableNumeric
  eligible_referees: NullableNumeric
  attendance_evidence_count: NullableNumeric
  quiz_assessments_counted: NullableNumeric
  reports_required: NullableNumeric
  evaluations_due: NullableNumeric
  evaluations_received: NullableNumeric
}

type MemberRow = { id: string; full_name: string }

function toNullableNumber(value: NullableNumeric): number | null {
  return value === null ? null : Number(value)
}

export async function getAdminRanking(): Promise<AdminRankingReferee[]> {
  const supabaseAdmin = getSupabaseAdmin()
  const { data: activeCycle, error: activeCycleError } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select("id")
    .eq("status", "active")
    .maybeSingle()

  if (activeCycleError) {
    console.error("[ADMIN RANKING V2] Unable to load active cycle:", activeCycleError)
    throw new Error("Unable to load the active development cycle.")
  }

  if (!activeCycle) return []

  const { data, error } = await supabaseAdmin
    .schema("development")
    .from("current_ranking_snapshot")
    .select(`
      cycle_id,
      cycle_member_id,
      member_id,
      snapshot_date,
      development_score,
      evidence_percentage,
      evidence_factor_percentage,
      ranking_score,
      ranking_position,
      ranking_percentile,
      eligible_referees,
      ranking_eligible,
      evidence_status,
      attendance_evidence_count,
      quiz_assessments_counted,
      reports_required,
      evaluations_due,
      evaluations_received,
      refreshed_at
    `)
    .eq("cycle_id", activeCycle.id)
    .order("ranking_position", { ascending: true, nullsFirst: false })

  if (error) {
    console.error("[ADMIN RANKING V2] Unable to load current snapshot:", error)
    throw new Error("Unable to load the current ranking snapshot.")
  }

  const rows = (data ?? []) as SnapshotRow[]
  const memberIds = rows.map((row) => row.member_id)
  const { data: members, error: membersError } = memberIds.length > 0
    ? await supabaseAdmin
        .from("members")
        .select("id, full_name")
        .in("id", memberIds)
    : { data: [], error: null }

  if (membersError) {
    console.error("[ADMIN RANKING V2] Unable to load member names:", membersError)
    throw new Error("Unable to load ranking members.")
  }

  const names = new Map<string, string>(
    ((members ?? []) as MemberRow[]).map((member) => [
      member.id,
      member.full_name,
    ] as const)
  )

  return rows.map((row) => ({
    ...row,
    full_name: names.get(row.member_id) ?? "Member",
    development_score: toNullableNumber(row.development_score),
    evidence_percentage: toNullableNumber(row.evidence_percentage),
    evidence_factor_percentage: toNullableNumber(row.evidence_factor_percentage),
    ranking_score: toNullableNumber(row.ranking_score),
    ranking_position: toNullableNumber(row.ranking_position),
    ranking_percentile: toNullableNumber(row.ranking_percentile),
    eligible_referees: toNullableNumber(row.eligible_referees),
    attendance_evidence_count: toNullableNumber(row.attendance_evidence_count),
    quiz_assessments_counted: toNullableNumber(row.quiz_assessments_counted),
    reports_required: toNullableNumber(row.reports_required),
    evaluations_due: toNullableNumber(row.evaluations_due),
    evaluations_received: toNullableNumber(row.evaluations_received),
  }))
}
