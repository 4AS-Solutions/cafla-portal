import type { ArbiterFeeRole, ArbiterFeeParsedAssignment } from "./types"

const ROLE_AMOUNTS = {
  center: { grossEarningsCents: 8_000, feeCents: 800 },
  ar1: { grossEarningsCents: 6_000, feeCents: 600 },
  ar2: { grossEarningsCents: 6_000, feeCents: 600 },
} as const satisfies Record<ArbiterFeeRole, { grossEarningsCents: number; feeCents: number }>

export function isSevenVSevenDivision(division: string) {
  return division.trim().toLocaleUpperCase("en-US").startsWith("7 V 7")
}

export function isWhscEightVEightCenter(role: ArbiterFeeRole, division: string, billTo: string) {
  return (
    role === "center" &&
    billTo.trim().toLocaleUpperCase("en-US") === "WHSC SOCCER" &&
    division.trim().toLocaleUpperCase("en-US").startsWith("8 V 8")
  )
}

export function getArbiterFeeAmounts(role: ArbiterFeeRole, division = "", billTo = "") {
  if (role === "center" && isSevenVSevenDivision(division)) {
    return { grossEarningsCents: 7_000, feeCents: 700 } as const
  }
  if (isWhscEightVEightCenter(role, division, billTo)) {
    return { grossEarningsCents: 6_000, feeCents: 600 } as const
  }
  return ROLE_AMOUNTS[role]
}

export function buildArbiterFeeAssignmentKey(gameId: string, role: ArbiterFeeRole): string {
  const normalizedGameId = gameId.trim()
  if (!normalizedGameId) throw new Error("Arbiter game ID is required.")
  return `arbiter-match-fee:${normalizedGameId}:${role}`
}

export function summarizeArbiterFees(assignments: ArbiterFeeParsedAssignment[]) {
  return assignments.reduce(
    (summary, assignment) => {
      summary.assignmentCount += 1
      summary.grossEarningsCents += assignment.grossEarningsCents
      summary.feeCents += assignment.feeCents
      if (assignment.role === "center") summary.centerCount += 1
      else summary.arCount += 1
      return summary
    },
    { assignmentCount: 0, centerCount: 0, arCount: 0, grossEarningsCents: 0, feeCents: 0 }
  )
}
