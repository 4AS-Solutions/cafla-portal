import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { resolve } from "node:path"

const migration = readFileSync(
  resolve("supabase/migrations/20260921000000_add_whsc_8v8_arbiter_fee_rule.sql"),
  "utf8",
)

test("adds Bill-To as an immutable historical snapshot field", () => {
  assert.match(migration, /add column bill_to text/i)
  assert.match(migration, /new\.bill_to is distinct from old\.bill_to/i)
  assert.doesNotMatch(migration, /add column bill_to text[^;]*default/i)
})

test("keeps 7 V 7 precedence and derives the WHSC 8 V 8 rate in the posting RPC", () => {
  const rateOrder = /when role='center' and upper\(btrim\(coalesce\(division,''\)\)\) like '7 V 7%' then 7000[\s\S]*when role='center' and upper\(btrim\(coalesce\(bill_to,''\)\)\)='WHSC SOCCER' and upper\(btrim\(coalesce\(division,''\)\)\) like '8 V 8%' then 6000[\s\S]*when role='center' then 8000[\s\S]*else 6000/
  assert.match(migration, rateOrder)
  assert.match(migration, /'bill_to',bill_to/)
})

test("rejects legacy Center 8 V 8 previews whose Bill-To was not captured", () => {
  assert.match(migration, /i\.role='center'[\s\S]*like '8 V 8%'[\s\S]*i\.bill_to is null[\s\S]*predates Bill-To fee validation/)
})

test("preserves assignment idempotency by canonical key and role", () => {
  assert.match(migration, /p\.canonical_assignment_key=c\.canonical_assignment_key/)
  assert.match(migration, /p\.correction_sequence=c\.correction_sequence/)
})
