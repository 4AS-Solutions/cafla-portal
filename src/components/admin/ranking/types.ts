import type { EvidenceStatus } from "@/src/lib/queries/get-development-ranking-v2"

export type AdminRankingReferee = {
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
  attendance_evidence_count: number | null
  quiz_assessments_counted: number | null
  reports_required: number | null
  evaluations_due: number | null
  evaluations_received: number | null
  refreshed_at: string
}
