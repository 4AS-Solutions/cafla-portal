import "server-only"

import { getSupabaseAdmin } from "@/src/lib/supabase/admin"
import { parseArbiterFeeFile } from "./parser"
import { prepareArbiterFeeItems, normalizedRefereeName } from "./workflow"
import type { ArbiterFeeMemberCandidate, ArbiterRefereeAlias } from "./types"

const PAGE_SIZE = 500

async function allRows<T>(build: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await build(from, from + PAGE_SIZE - 1)
    if (error) throw error
    const page = (data ?? []) as T[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) return rows
  }
}

export async function createArbiterFeeImport(file: File, actorId: string) {
  const parsed = parseArbiterFeeFile(await file.arrayBuffer(), file.name)
  const db = getSupabaseAdmin()
  const [memberRows, aliasRows, postedRows] = await Promise.all([
    allRows<{ id: string; full_name: string; email: string; status: string }>((from, to) => db.from("members").select("id, full_name, email, status").order("id").range(from, to)),
    allRows<{ id: string; arbiter_name: string; member_id: string | null; finance_verified_at: string | null }>((from, to) => db.from("arbiter_referees").select("id, arbiter_name, member_id, finance_verified_at").order("id").range(from, to)),
    allRows<{ canonical_assignment_key: string }>((from, to) => db.schema("finance").from("arbiter_fee_import_items").select("canonical_assignment_key").eq("item_status", "posted").eq("correction_sequence", 0).order("id").range(from, to)),
  ])
  const members: ArbiterFeeMemberCandidate[] = memberRows.map((m) => ({ id: m.id, fullName: m.full_name, email: m.email, status: m.status }))
  const aliases: ArbiterRefereeAlias[] = aliasRows.map((a) => ({ id: a.id, arbiterName: a.arbiter_name, memberId: a.member_id, financeVerifiedAt: a.finance_verified_at }))
  const items = prepareArbiterFeeItems({ assignments: parsed.assignments, members, aliases, postedKeys: new Set(postedRows.map((r) => r.canonical_assignment_key)) })
  const validDates = parsed.assignments.map((a) => a.matchDate).filter((date): date is string => Boolean(date)).sort()
  const summary = buildSummary(parsed.matches.length, parsed.issues.length, items)
  const { data: importRow, error: importError } = await db.schema("finance").from("arbiter_fee_imports").insert({
    original_filename: parsed.originalFilename, file_sha256: parsed.sha256, status: "draft",
    period_start: validDates[0] ?? null, period_end: validDates.at(-1) ?? null,
    summary_metadata: { ...summary, parse_issues: parsed.issues }, uploaded_by: actorId,
  }).select("id").single()
  if (importError) throw importError
  if (items.length) {
    const rows = items.map((item) => ({
      id: item.id, import_id: importRow.id, source_row_number: item.sourceRowNumber,
      arbiter_game_id: item.gameId, role: item.role, arbiter_referee_name: item.arbiterRefereeName,
      normalized_referee_name: normalizedRefereeName(item.arbiterRefereeName), member_id: item.member?.id ?? null,
      match_date: item.matchDate, kickoff_time: item.kickoffTime, sport: item.sport || null,
      division: item.division || null, league: item.league || null, site: item.site || null,
      home_team: item.homeTeam || null, away_team: item.awayTeam || null, arbiter_comments: item.comments || null,
      gross_earnings_cents: item.grossEarningsCents, fee_cents: item.feeCents,
      initial_match_state: item.state, match_reason: item.reason,
      resolution_confirmed: item.itemStatus === "new" && item.state === "exact",
      resolution_method: item.state === "exact" ? (item.reason === "trusted_alias" ? "trusted_alias" : "exact_full_name") : "pending",
      item_status: item.itemStatus, duplicate_of_item_id: item.duplicateOfItemId,
    }))
    const { error } = await db.schema("finance").from("arbiter_fee_import_items").insert(rows)
    if (error) throw error
  }
  const { error: readyError } = await db.schema("finance").from("arbiter_fee_imports").update({ status: "ready" }).eq("id", importRow.id)
  if (readyError) throw readyError
  return getArbiterFeeImport(importRow.id)
}

function buildSummary(matches: number, malformed: number, items: ReturnType<typeof prepareArbiterFeeItems>) {
  const count = (test: (item: (typeof items)[number]) => boolean) => items.filter(test).length
  return { matches, assignments: items.length, malformed, center: count((i) => i.role === "center"), ar: count((i) => i.role !== "center"), gross_cents: items.reduce((n,i)=>n+i.grossEarningsCents,0), fee_cents: items.reduce((n,i)=>n+i.feeCents,0), new: count((i)=>i.itemStatus==="new"), already_imported: count((i)=>i.itemStatus==="already_imported"), duplicate_in_file: count((i)=>i.itemStatus==="duplicate_in_file"), exact: count((i)=>i.state==="exact"), suggested: count((i)=>i.state==="suggested"), ambiguous: count((i)=>i.state==="ambiguous"), unmatched: count((i)=>i.state==="unmatched") }
}

export async function getArbiterFeeImport(importId: string) {
  const db = getSupabaseAdmin()
  const [{ data: batch, error: batchError }, { data: items, error: itemsError }, members] = await Promise.all([
    db.schema("finance").from("arbiter_fee_imports").select("*").eq("id", importId).single(),
    db.schema("finance").from("arbiter_fee_import_items").select("*").eq("import_id", importId).order("source_row_number").order("role"),
    allRows<{ id:string; full_name:string; email:string; status:string }>((from,to)=>db.from("members").select("id, full_name, email, status").order("full_name").range(from,to)),
  ])
  if (batchError) throw batchError
  if (itemsError) throw itemsError
  return { batch, items: items ?? [], members }
}
