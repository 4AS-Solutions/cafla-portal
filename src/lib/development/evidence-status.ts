import type { EvidenceStatus } from "@/src/lib/queries/get-development-ranking-v2"

const evidenceStatusLabels: Record<EvidenceStatus, string> = {
  not_eligible: "Not Eligible",
  needs_attendance: "Needs Attendance",
  needs_quiz: "Needs Quiz",
  needs_report: "Needs Report",
  needs_evaluation: "Needs Evaluation",
  insufficient_performance_data: "Insufficient Data",
  limited_evidence: "Limited Evidence",
  developing_evidence: "Developing Evidence",
  strong_evidence: "Strong Evidence",
  mature_evidence: "Mature Evidence",
}

export function getEvidenceStatusLabel(status: EvidenceStatus): string {
  return evidenceStatusLabels[status]
}
