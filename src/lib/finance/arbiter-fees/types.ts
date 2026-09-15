export const ARBITER_FEE_ROLES = ["center", "ar1", "ar2"] as const

export type ArbiterFeeRole = (typeof ARBITER_FEE_ROLES)[number]

export type ArbiterFeeParsedMatch = {
  sourceRowNumber: number
  gameId: string
  matchDate: string | null
  matchDateRaw: string
  kickoffTime: string | null
  kickoffTimeRaw: string
  sport: string
  division: string
  league: string
  site: string
  homeTeam: string
  awayTeam: string
  comments: string
}

export type ArbiterFeeParsedAssignment = ArbiterFeeParsedMatch & {
  role: ArbiterFeeRole
  arbiterRefereeName: string
  canonicalAssignmentKey: string
  grossEarningsCents: number
  feeCents: number
}

export type ArbiterFeeParseIssue = {
  sourceRowNumber: number
  code: "formula_not_allowed" | "missing_game_id" | "invalid_match_date" | "invalid_kickoff_time"
  message: string
}

export type ArbiterFeeParseResult = {
  originalFilename: string
  sha256: string
  matches: ArbiterFeeParsedMatch[]
  assignments: ArbiterFeeParsedAssignment[]
  issues: ArbiterFeeParseIssue[]
}

export type ArbiterFeeMemberCandidate = {
  id: string
  fullName: string
  email?: string
  status?: string
}

export type ArbiterRefereeAlias = {
  id: string
  arbiterName: string
  memberId: string | null
  financeVerifiedAt: string | null
}

export type ArbiterMemberMatchState = "exact" | "suggested" | "ambiguous" | "unmatched"

export type ArbiterMemberMatchReason =
  | "trusted_alias"
  | "exact_full_name"
  | "unverified_existing_alias"
  | "punctuation_or_diacritic_difference"
  | "middle_name_difference"
  | "multiple_candidates"
  | "no_candidate"

export type ArbiterMemberMatch = {
  state: ArbiterMemberMatchState
  reason: ArbiterMemberMatchReason
  member: ArbiterFeeMemberCandidate | null
  candidates: ArbiterFeeMemberCandidate[]
  requiresBoardConfirmation: boolean
}
