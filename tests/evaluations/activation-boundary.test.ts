import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

const repositoryRoot = process.cwd();
const historicalPath = join(
  repositoryRoot,
  "supabase",
  "migrations",
  "20260831185011_remote_schema.sql",
);
const migrationPath = join(
  repositoryRoot,
  "supabase",
  "migrations",
  "20260919000000_postpone_evaluations_v2_activation.sql",
);
const exceptionMatchId = "cb5cb563-d55d-4c74-a91f-e28b9e486e55";

function evaluationDetailDefinition(sql: string): string {
  const match = sql.match(
    /CREATE OR REPLACE VIEW "development"\."referee_evaluation_detail" AS[\s\S]*?;(?=\s*(?:ALTER VIEW|$))/,
  );
  assert.ok(
    match,
    "Expected the complete referee_evaluation_detail definition",
  );
  return match[0].replaceAll("\r\n", "\n");
}

test("postpones only the Evaluations V2 activation boundary", () => {
  const historical = evaluationDetailDefinition(
    readFileSync(historicalPath, "utf8"),
  );
  const migration = evaluationDetailDefinition(
    readFileSync(migrationPath, "utf8"),
  );

  assert.match(historical, /'2026-09-18'::"date"/);
  assert.doesNotMatch(migration, /2026-09-18/);
  assert.match(migration, /'2026-09-25'::"date"/);
  assert.match(migration, new RegExp(exceptionMatchId));
  assert.equal(
    migration.replace("'2026-09-25'::\"date\"", "'2026-09-18'::\"date\""),
    historical,
  );
});
