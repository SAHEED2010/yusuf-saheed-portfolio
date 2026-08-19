import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const scratch = mkdtempSync(path.join(tmpdir(), "portfolio-smoke-"));
process.env.PORTFOLIO_DATABASE_PATH = path.join(scratch, "portfolio.sqlite");

try {
  const database = await import("../src/content/database.ts");
  const validation = await import("../src/content/validation.ts");
  const { projects } = await import("../src/content/seed.ts");
  assert.equal(database.readAllRecords().length >= 5, true, "seed records should initialize");
  assert.deepEqual(validation.validateProject(projects[0]), [], "seed project should validate");
  assert.equal(database.consumeRateLimit("smoke", 2, 60_000).allowed, true);
  assert.equal(database.consumeRateLimit("smoke", 2, 60_000).allowed, true);
  assert.equal(database.consumeRateLimit("smoke", 2, 60_000).allowed, false);
  console.log("backend smoke passed");
} finally {
  globalThis.__portfolioDatabase?.close();
  globalThis.__portfolioDatabase = undefined;
  rmSync(scratch, { recursive: true, force: true });
}
