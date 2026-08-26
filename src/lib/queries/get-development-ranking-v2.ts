import "server-only"

import { getUser } from "@/src/lib/auth/get-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type EvidenceStatus =
  | "not_eligible"
  | "needs_attendance"
  | "needs_quiz"
  | "needs_report"
  | "needs_evaluation"
  | "insufficient_performance_data"
  | "limited_evidence"
  | "developing_evidence"
  | "strong_evidence"
  | "mature_evidence"

type NullableNumeric = number | string | null

type CurrentSnapshotRow = {
  cycle_id: string
  cycle_member_id: string
  member_id: string
  snapshot_date: string
  development_score: NullableNumeric
  evidence_percentage: NullableNumeric
  evidence_factor_percentage: NullableNumeric
  ranking_score: NullableNumeric
  ranking_position: NullableNumeric
  ranking_percentile: NullableNumeric
  eligible_referees: NullableNumeric
  ranking_eligible: boolean
  evidence_status: EvidenceStatus
}

type MonthlySnapshotRow = {
  cycle_id: string
  cycle_member_id: string
  member_id: string
  month_start: string
  snapshot_date: string
  development_score: NullableNumeric
  evidence_percentage: NullableNumeric
  evidence_factor_percentage: NullableNumeric
  ranking_score: NullableNumeric
  ranking_position: NullableNumeric
  ranking_percentile: NullableNumeric
  eligible_referees: NullableNumeric
  ranking_eligible: boolean
  evidence_status: EvidenceStatus
}

export type CurrentDevelopmentRanking = {
  cycle_id: string
  cycle_member_id: string
  member_id: string
  full_name: string
  snapshot_date: string
  development_score: number | null
  evidence_percentage: number | null
  evidence_factor_percentage: number | null
  ranking_score: number | null
  ranking_position: number | null
  ranking_percentile: number | null
  eligible_referees: number | null
  ranking_eligible: boolean
  evidence_status: EvidenceStatus
}

export type MonthlyDevelopmentRanking = {
  cycle_id: string
  cycle_member_id: string
  member_id: string
  month_start: string
  snapshot_date: string
  monthly_development_score: number | null
  monthly_evidence_percentage: number | null
  monthly_evidence_factor_percentage: number | null
  monthly_ranking_score: number | null
  ranking_position: number | null
  ranking_percentile: number | null
  eligible_referees: number | null
  monthly_ranking_eligible: boolean
  monthly_evidence_status: EvidenceStatus
}

export type DevelopmentPageRankingData = {
  current: CurrentDevelopmentRanking | null
  history: MonthlyDevelopmentRanking[]
}

function toNullableNumber(value: NullableNumeric): number | null {
  return value === null ? null : Number(value)
}

function normalizeCurrentRow(
  row: CurrentSnapshotRow,
  fullName: string
): CurrentDevelopmentRanking {
  return {
    ...row,
    full_name: fullName,
    development_score: toNullableNumber(row.development_score),
    evidence_percentage: toNullableNumber(row.evidence_percentage),
    evidence_factor_percentage: toNullableNumber(row.evidence_factor_percentage),
    ranking_score: toNullableNumber(row.ranking_score),
    ranking_position: toNullableNumber(row.ranking_position),
    ranking_percentile: toNullableNumber(row.ranking_percentile),
    eligible_referees: toNullableNumber(row.eligible_referees),
  }
}

function normalizeMonthlyRow(
  row: MonthlySnapshotRow
): MonthlyDevelopmentRanking {
  return {
    cycle_id: row.cycle_id,
    cycle_member_id: row.cycle_member_id,
    member_id: row.member_id,
    month_start: row.month_start,
    snapshot_date: row.snapshot_date,
    monthly_development_score: toNullableNumber(row.development_score),
    monthly_evidence_percentage: toNullableNumber(row.evidence_percentage),
    monthly_evidence_factor_percentage: toNullableNumber(
      row.evidence_factor_percentage
    ),
    monthly_ranking_score: toNullableNumber(row.ranking_score),
    ranking_position: toNullableNumber(row.ranking_position),
    ranking_percentile: toNullableNumber(row.ranking_percentile),
    eligible_referees: toNullableNumber(row.eligible_referees),
    monthly_ranking_eligible: row.ranking_eligible,
    monthly_evidence_status: row.evidence_status,
  }
}

function getMonthStart(snapshotDate: string): string {
  const match = snapshotDate.match(/^(\d{4})-(\d{2})/)
  return match ? `${match[1]}-${match[2]}-01` : snapshotDate
}

function currentToMonthly(
  current: CurrentDevelopmentRanking
): MonthlyDevelopmentRanking {
  return {
    cycle_id: current.cycle_id,
    cycle_member_id: current.cycle_member_id,
    member_id: current.member_id,
    month_start: getMonthStart(current.snapshot_date),
    snapshot_date: current.snapshot_date,
    monthly_development_score: current.development_score,
    monthly_evidence_percentage: current.evidence_percentage,
    monthly_evidence_factor_percentage: current.evidence_factor_percentage,
    monthly_ranking_score: current.ranking_score,
    ranking_position: current.ranking_position,
    ranking_percentile: current.ranking_percentile,
    eligible_referees: current.eligible_referees,
    monthly_ranking_eligible: current.ranking_eligible,
    monthly_evidence_status: current.evidence_status,
  }
}

async function getContext() {
  const user = await getUser()

  if (!user) throw new Error("Unauthorized")

  const supabaseAdmin = getSupabaseAdmin()
  const { data: activeCycle, error } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select("id")
    .eq("status", "active")
    .maybeSingle()

  if (error) {
    console.error("[DEVELOPMENT V2] Unable to load the active cycle:", error)
    throw new Error("Unable to load the active development cycle.")
  }

  return { userId: user.id, cycleId: activeCycle?.id ?? null, supabaseAdmin }
}

const currentFields = `
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
  evidence_status
`

const monthlyFields = `
  cycle_id,
  cycle_member_id,
  member_id,
  month_start,
  snapshot_date,
  development_score,
  evidence_percentage,
  evidence_factor_percentage,
  ranking_score,
  ranking_position,
  ranking_percentile,
  eligible_referees,
  ranking_eligible,
  evidence_status
`

export async function getUserCurrentDevelopmentRanking(): Promise<
  CurrentDevelopmentRanking | null
> {
  const { userId, cycleId, supabaseAdmin } = await getContext()

  if (!cycleId) return null

  const { data, error } = await supabaseAdmin
    .schema("development")
    .from("current_ranking_snapshot")
    .select(currentFields)
    .eq("cycle_id", cycleId)
    .eq("member_id", userId)
    .maybeSingle()

  if (error) {
    console.error("[DEVELOPMENT V2] Unable to load current member snapshot:", error)
    throw new Error("Unable to load current development snapshot.")
  }

  if (!data) return null

  return normalizeCurrentRow(data as CurrentSnapshotRow, "Member")
}

export async function getDevelopmentPageRankingData(): Promise<
  DevelopmentPageRankingData
> {
  const { userId, cycleId, supabaseAdmin } = await getContext()

  if (!cycleId) return { current: null, history: [] }

  const [currentResult, historyResult] = await Promise.all([
    supabaseAdmin
      .schema("development")
      .from("current_ranking_snapshot")
      .select(currentFields)
      .eq("cycle_id", cycleId)
      .eq("member_id", userId)
      .maybeSingle(),
    supabaseAdmin
      .schema("development")
      .from("monthly_ranking_snapshots")
      .select(monthlyFields)
      .eq("cycle_id", cycleId)
      .eq("member_id", userId)
      .order("month_start", { ascending: true }),
  ])

  if (currentResult.error || historyResult.error) {
    console.error("[DEVELOPMENT V2] Unable to load ranking snapshots:", {
      current: currentResult.error,
      history: historyResult.error,
    })
    throw new Error("Unable to load development ranking snapshots.")
  }

  const current = currentResult.data
    ? normalizeCurrentRow(currentResult.data as CurrentSnapshotRow, "Member")
    : null
  const historyByMonth = new Map<string, MonthlyDevelopmentRanking>(
    ((historyResult.data ?? []) as MonthlySnapshotRow[]).map((row) => {
      const normalized = normalizeMonthlyRow(row)
      return [normalized.month_start, normalized] as const
    })
  )

  if (current) {
    const liveMonth = currentToMonthly(current)

    if (!historyByMonth.has(liveMonth.month_start)) {
      historyByMonth.set(liveMonth.month_start, liveMonth)
    }
  }

  return {
    current,
    history: Array.from(historyByMonth.values()).sort((a, b) =>
      a.month_start.localeCompare(b.month_start)
    ),
  }
}
