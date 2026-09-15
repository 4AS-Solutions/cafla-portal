import type {
  ArbiterFeeMemberCandidate,
  ArbiterMemberMatch,
  ArbiterRefereeAlias,
} from "./types"

function normalizeWhitespaceAndCase(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ")
}

export function normalizeArbiterName(value: string): string {
  return normalizeWhitespaceAndCase(value)
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function uniqueMembers(members: ArbiterFeeMemberCandidate[]) {
  return [...new Map(members.map((member) => [member.id, member])).values()]
}

function firstAndLast(value: string): { first: string; last: string; tokenCount: number } | null {
  const tokens = normalizeArbiterName(value).split(" ").filter(Boolean)
  if (tokens.length < 2) return null
  return { first: tokens[0], last: tokens[tokens.length - 1], tokenCount: tokens.length }
}

export function matchArbiterRefereeName(params: {
  arbiterName: string
  members: ArbiterFeeMemberCandidate[]
  aliases?: ArbiterRefereeAlias[]
}): ArbiterMemberMatch {
  const { arbiterName, members, aliases = [] } = params
  const strictInput = normalizeWhitespaceAndCase(arbiterName)
  const normalizedInput = normalizeArbiterName(arbiterName)

  const trustedAliasMemberIds = new Set(
    aliases
      .filter((alias) => alias.memberId && alias.financeVerifiedAt && normalizeArbiterName(alias.arbiterName) === normalizedInput)
      .map((alias) => alias.memberId as string)
  )
  const trustedAliasCandidates = uniqueMembers(members.filter((member) => trustedAliasMemberIds.has(member.id)))
  if (trustedAliasCandidates.length === 1) {
    return { state: "exact", reason: "trusted_alias", member: trustedAliasCandidates[0], candidates: trustedAliasCandidates, requiresBoardConfirmation: false }
  }
  if (trustedAliasCandidates.length > 1) {
    return { state: "ambiguous", reason: "multiple_candidates", member: null, candidates: trustedAliasCandidates, requiresBoardConfirmation: true }
  }

  const strictCandidates = uniqueMembers(
    members.filter((member) => normalizeWhitespaceAndCase(member.fullName) === strictInput)
  )
  if (strictCandidates.length === 1) {
    return { state: "exact", reason: "exact_full_name", member: strictCandidates[0], candidates: strictCandidates, requiresBoardConfirmation: false }
  }
  if (strictCandidates.length > 1) {
    return { state: "ambiguous", reason: "multiple_candidates", member: null, candidates: strictCandidates, requiresBoardConfirmation: true }
  }

  const untrustedAliasMemberIds = new Set(
    aliases
      .filter((alias) => alias.memberId && !alias.financeVerifiedAt && normalizeArbiterName(alias.arbiterName) === normalizedInput)
      .map((alias) => alias.memberId as string)
  )
  const untrustedAliasCandidates = uniqueMembers(members.filter((member) => untrustedAliasMemberIds.has(member.id)))
  if (untrustedAliasCandidates.length === 1) {
    return { state: "suggested", reason: "unverified_existing_alias", member: untrustedAliasCandidates[0], candidates: untrustedAliasCandidates, requiresBoardConfirmation: true }
  }
  if (untrustedAliasCandidates.length > 1) {
    return { state: "ambiguous", reason: "multiple_candidates", member: null, candidates: untrustedAliasCandidates, requiresBoardConfirmation: true }
  }

  const normalizedCandidates = uniqueMembers(
    members.filter((member) => normalizeArbiterName(member.fullName) === normalizedInput)
  )
  if (normalizedCandidates.length === 1) {
    return { state: "suggested", reason: "punctuation_or_diacritic_difference", member: normalizedCandidates[0], candidates: normalizedCandidates, requiresBoardConfirmation: true }
  }
  if (normalizedCandidates.length > 1) {
    return { state: "ambiguous", reason: "multiple_candidates", member: null, candidates: normalizedCandidates, requiresBoardConfirmation: true }
  }

  const inputEdges = firstAndLast(arbiterName)
  const middleNameCandidates = inputEdges
    ? uniqueMembers(members.filter((member) => {
        const memberEdges = firstAndLast(member.fullName)
        return memberEdges && memberEdges.first === inputEdges.first && memberEdges.last === inputEdges.last && memberEdges.tokenCount !== inputEdges.tokenCount
      }))
    : []

  if (middleNameCandidates.length === 1) {
    return { state: "suggested", reason: "middle_name_difference", member: middleNameCandidates[0], candidates: middleNameCandidates, requiresBoardConfirmation: true }
  }
  if (middleNameCandidates.length > 1) {
    return { state: "ambiguous", reason: "multiple_candidates", member: null, candidates: middleNameCandidates, requiresBoardConfirmation: true }
  }

  return { state: "unmatched", reason: "no_candidate", member: null, candidates: [], requiresBoardConfirmation: true }
}
