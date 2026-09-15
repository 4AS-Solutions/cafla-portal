import assert from "node:assert/strict"
import test from "node:test"
import * as XLSX from "xlsx"

import { matchArbiterRefereeName, normalizeArbiterName } from "../../src/lib/finance/arbiter-fees/matching"
import { parseArbiterFeeFile } from "../../src/lib/finance/arbiter-fees/parser"
import { buildArbiterFeeAssignmentKey, getArbiterFeeAmounts, summarizeArbiterFees } from "../../src/lib/finance/arbiter-fees/rules"
import { findPendingUnregisteredAlias, isArbiterFeeBatchPostable, prepareArbiterFeeItems } from "../../src/lib/finance/arbiter-fees/workflow"

function workbookBuffer(bookType: "xls" | "xlsx", rows: unknown[][]) {
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Schedule")
  return XLSX.write(workbook, { type: "array", bookType }) as ArrayBuffer
}

test("uses integer-cent fee rules and canonical keys", () => {
  assert.deepEqual(getArbiterFeeAmounts("center", "Metro AM"), { grossEarningsCents: 8000, feeCents: 800 })
  assert.deepEqual(getArbiterFeeAmounts("ar1"), { grossEarningsCents: 6000, feeCents: 600 })
  assert.equal(buildArbiterFeeAssignmentKey(" 31707 ", "ar2"), "arbiter-match-fee:31707:ar2")
})

test("applies the approved 7 V 7 Center rate from normalized division", () => {
  assert.deepEqual(getArbiterFeeAmounts("center", "7 V 7 Premier"), { grossEarningsCents: 7000, feeCents: 700 })
  assert.deepEqual(getArbiterFeeAmounts("center", " 7 V 7 Premier "), { grossEarningsCents: 7000, feeCents: 700 })
  assert.deepEqual(getArbiterFeeAmounts("center", "7 v 7 Premier"), { grossEarningsCents: 7000, feeCents: 700 })
  assert.deepEqual(getArbiterFeeAmounts("center", "Metro AM"), { grossEarningsCents: 8000, feeCents: 800 })
  assert.deepEqual(getArbiterFeeAmounts("ar1", "7 V 7 Premier"), { grossEarningsCents: 6000, feeCents: 600 })
  assert.deepEqual(getArbiterFeeAmounts("ar2", "7 V 7 Premier"), { grossEarningsCents: 6000, feeCents: 600 })
})

test("derives the 7 V 7 Center rate while parsing column F", () => {
  const rows = [["Game", "Date", "Day", "Time", "Sport", "Division", "", "League", "Site", "Home", "Away", "Comments", "Center", "AR1", "AR2"], ["77", "03/09/2026", "", "17:00", "Soccer", "7 V 7 First AM", "", "CAFLA", "Park", "Home", "Away", "", "Ref One", "", ""]]
  const result = parseArbiterFeeFile(workbookBuffer("xlsx", rows), "fees.xlsx")
  assert.equal(result.assignments[0].grossEarningsCents, 7000)
  assert.equal(result.assignments[0].feeCents, 700)
})

test("aggregates mixed normal Center, 7 V 7 Center and AR rates", () => {
  const make = (role: "center"|"ar1", division: string, gameId: string) => ({ sourceRowNumber:2, gameId, matchDate:"2026-09-01", matchDateRaw:"01/09/2026", kickoffTime:"17:00", kickoffTimeRaw:"17:00", sport:"Soccer", division, league:"CAFLA", site:"Park", homeTeam:"Home", awayTeam:"Away", comments:"", role, arbiterRefereeName:"Ref One", canonicalAssignmentKey:buildArbiterFeeAssignmentKey(gameId,role), ...getArbiterFeeAmounts(role,division) })
  const summary = summarizeArbiterFees([make("center","Metro AM","1"),make("center","7 V 7 Premier","2"),make("ar1","7 V 7 Premier","3")])
  assert.equal(summary.grossEarningsCents, 21_000)
  assert.equal(summary.feeCents, 2_100)
})

test("accepts both .xls and .xlsx workbooks", () => {
  const rows = [["Game", "Date", "Day", "Time", "Sport", "Division", "", "League", "Site", "Home", "Away", "Comments", "Center", "AR1", "AR2"], ["1", "03/09/2026", "", "17:00", "Soccer", "A", "", "CAFLA", "Park", "Home", "Away", "", "Ref One", "", ""]]
  assert.equal(parseArbiterFeeFile(workbookBuffer("xls", rows), "fees.xls").assignments.length, 1)
  assert.equal(parseArbiterFeeFile(workbookBuffer("xlsx", rows), "fees.xlsx").assignments.length, 1)
})

test("rejects invalid, oversized and formula-bearing files", () => {
  assert.throws(() => parseArbiterFeeFile(new ArrayBuffer(1), "fees.csv"), /Only .xls and .xlsx/)
  assert.throws(() => parseArbiterFeeFile(new ArrayBuffer(10 * 1024 * 1024 + 1), "fees.xlsx"), /10 MB or smaller/)
  const sheet = XLSX.utils.aoa_to_sheet([["Game", "Date"], ["1", "03/09/2026"]])
  sheet.M2 = { t: "s", v: "Ref One", f: 'CONCAT("Ref"," One")' }
  sheet["!ref"] = "A1:O2"
  const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, sheet, "Schedule")
  const parsed = parseArbiterFeeFile(XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer, "fees.xlsx")
  assert.equal(parsed.assignments.length, 0)
  assert.equal(parsed.issues[0]?.code, "formula_not_allowed")
})

test("parses M/N/O positionally and ignores blank official cells", () => {
  const rows = [
    ["Game", "Date", "Day", "Time", "Sport", "Division", "Unused", "League", "Site", "Home", "Away", "Comments", "Officials", "", ""],
    ["31707", "03/09/2026", "Thu", "17:15", "Soccer", "First AM", "", "CAFLA", "Park, Field 1", "Team A", "Team B", "", "Luis Referee", "", "Cesar Referee"],
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Schedule")
  const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer
  const result = parseArbiterFeeFile(buffer, "Schedule.xlsx")

  assert.equal(result.matches.length, 1)
  assert.equal(result.matches[0].matchDate, "2026-09-03")
  assert.deepEqual(result.assignments.map((item) => item.role), ["center", "ar2"])
  assert.deepEqual(summarizeArbiterFees(result.assignments), {
    assignmentCount: 2,
    centerCount: 1,
    arCount: 1,
    grossEarningsCents: 14000,
    feeCents: 1400,
  })
})

test("distinguishes exact, suggested, ambiguous and unmatched", () => {
  const members = [
    { id: "1", fullName: "Luis Salvador" },
    { id: "2", fullName: "Cristian E Flores" },
    { id: "3", fullName: "Ana Maria Lopez" },
    { id: "4", fullName: "Ana Sofia Lopez" },
  ]
  assert.equal(matchArbiterRefereeName({ arbiterName: "Luis Salvador", members }).state, "exact")
  assert.equal(matchArbiterRefereeName({ arbiterName: "Cristian Flores", members }).state, "suggested")
  assert.equal(matchArbiterRefereeName({ arbiterName: "Ana Lopez", members }).state, "ambiguous")
  assert.equal(matchArbiterRefereeName({ arbiterName: "Nobody Known", members }).state, "unmatched")
  assert.equal(normalizeArbiterName("  José  Pérez. "), "jose perez")
})

test("does not trust a historical alias until Board verification", () => {
  const members = [{ id: "1", fullName: "Cristian E Flores" }]
  const alias = { id: "a", arbiterName: "Cristian Flores", memberId: "1", financeVerifiedAt: null }
  const unverified = matchArbiterRefereeName({ arbiterName: "Cristian Flores", members, aliases: [alias] })
  assert.equal(unverified.state, "suggested")
  assert.equal(unverified.reason, "unverified_existing_alias")

  const verified = matchArbiterRefereeName({
    arbiterName: "Cristian Flores",
    members,
    aliases: [{ ...alias, financeVerifiedAt: "2026-09-14T12:00:00Z" }],
  })
  assert.equal(verified.state, "exact")
  assert.equal(verified.requiresBoardConfirmation, false)
})

test("classifies in-file and previously posted assignments authoritatively", () => {
  const base = { sourceRowNumber: 2, gameId: "100", matchDate: "2026-09-01", matchDateRaw: "01/09/2026", kickoffTime: "17:00", kickoffTimeRaw: "17:00", sport: "Soccer", division: "A", league: "CAFLA", site: "Park", homeTeam: "Home", awayTeam: "Away", comments: "", role: "center" as const, arbiterRefereeName: "Ref One", canonicalAssignmentKey: "arbiter-match-fee:100:center", grossEarningsCents: 8000, feeCents: 800 }
  let id = 0
  const duplicate = prepareArbiterFeeItems({ assignments: [base, { ...base, sourceRowNumber: 3 }], members: [{id:"1",fullName:"Ref One"}], aliases: [], postedKeys: new Set(), createId:()=>`id-${++id}` })
  assert.deepEqual(duplicate.map((item)=>item.itemStatus), ["new", "duplicate_in_file"])
  assert.equal(duplicate[1].duplicateOfItemId, duplicate[0].id)
  const posted = prepareArbiterFeeItems({ assignments:[base], members:[], aliases:[], postedKeys:new Set([base.canonicalAssignmentKey]), createId:()=>"posted" })
  assert.equal(posted[0].itemStatus, "already_imported")
})

test("blocks posting until every new assignment is resolved", () => {
  assert.equal(isArbiterFeeBatchPostable([{itemStatus:"new",resolutionConfirmed:false,memberId:null}]), false)
  assert.equal(isArbiterFeeBatchPostable([{itemStatus:"new",resolutionConfirmed:false,memberId:"suggested-member"}]), false)
  assert.equal(isArbiterFeeBatchPostable([{itemStatus:"new",resolutionConfirmed:true,memberId:"member"},{itemStatus:"duplicate_in_file",resolutionConfirmed:false,memberId:null}]), true)
  assert.equal(isArbiterFeeBatchPostable([{itemStatus:"already_imported",resolutionConfirmed:false,memberId:null}]), false)
  assert.equal(isArbiterFeeBatchPostable([{itemStatus:"new",resolutionConfirmed:true,memberId:null,unregisteredRefereeId:"pending"}]), true)
  assert.equal(isArbiterFeeBatchPostable([{itemStatus:"new",resolutionConfirmed:true,memberId:"member",unregisteredRefereeId:"pending"}]), false)
})

test("reuses a confirmed provisional alias but rejects it after linking",()=>{const aliases=[{normalizedArbiterName:"manuel osorio",unregisteredRefereeId:"pending"}];assert.equal(findPendingUnregisteredAlias(" Manuel  Osorio ",aliases,new Set()),"pending");assert.equal(findPendingUnregisteredAlias("Manuel Osorio",aliases,new Set(["pending"])),null)})
