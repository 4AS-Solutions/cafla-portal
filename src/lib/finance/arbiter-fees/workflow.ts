import type { ArbiterFeeMemberCandidate, ArbiterFeeParsedAssignment, ArbiterMemberMatch, ArbiterRefereeAlias } from "./types"
import { matchArbiterRefereeName, normalizeArbiterName } from "./matching"

export type ArbiterFeePreparedItem = ArbiterFeeParsedAssignment & ArbiterMemberMatch & {
  id: string
  itemStatus: "new" | "already_imported" | "duplicate_in_file"
  duplicateOfItemId: string | null
}

export function prepareArbiterFeeItems(params: {
  assignments: ArbiterFeeParsedAssignment[]
  members: ArbiterFeeMemberCandidate[]
  aliases: ArbiterRefereeAlias[]
  postedKeys: Set<string>
  createId?: () => string
}) {
  const createId = params.createId ?? (() => crypto.randomUUID())
  const firstByKey = new Map<string, string>()
  return params.assignments.map((assignment): ArbiterFeePreparedItem => {
    const id = createId()
    const firstId = firstByKey.get(assignment.canonicalAssignmentKey)
    const itemStatus = firstId ? "duplicate_in_file" : params.postedKeys.has(assignment.canonicalAssignmentKey) ? "already_imported" : "new"
    if (!firstId) firstByKey.set(assignment.canonicalAssignmentKey, id)
    return {
      ...assignment,
      ...matchArbiterRefereeName({ arbiterName: assignment.arbiterRefereeName, members: params.members, aliases: params.aliases }),
      id,
      itemStatus,
      duplicateOfItemId: firstId ?? null,
    }
  })
}

export function isArbiterFeeBatchPostable(items: Array<{ itemStatus: string; resolutionConfirmed: boolean; memberId: string | null; unregisteredRefereeId?: string | null }>) {
  return items.some((item) => item.itemStatus === "new") && !items.some((item) => item.itemStatus === "new" && (!item.resolutionConfirmed || Number(Boolean(item.memberId)) + Number(Boolean(item.unregisteredRefereeId)) !== 1))
}

export function findPendingUnregisteredAlias(name:string,aliases:Array<{normalizedArbiterName:string;unregisteredRefereeId:string}>,linkedIds:Set<string>){const normalized=normalizeArbiterName(name);return aliases.find(alias=>alias.normalizedArbiterName===normalized&&!linkedIds.has(alias.unregisteredRefereeId))?.unregisteredRefereeId??null}

export function normalizedRefereeName(value: string) {
  return normalizeArbiterName(value)
}
