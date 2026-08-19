import assert from "node:assert/strict";

process.env.DATABASE_PROVIDER = "sqlite";
process.env.PORTFOLIO_DATABASE_PATH = "file::memory:";

const database = await import("../src/content/database.ts");
const validation = await import("../src/content/validation.ts");
const { projects } = await import("../src/content/seed.ts");

try {
  const records = await database.readAllRecords();
  assert.equal(records.length >= 5, true, "seed records should initialize");
  assert.deepEqual(validation.validateProject(projects[0]), [], "seed project should validate");

  const draft = { ...projects[0], id: "smoke-project", slug: "smoke-project", title: "Smoke project", lifecycle: "draft", visibility: "private", publishedAt: undefined };
  await database.writeRecord(draft, "create", "Created smoke project");
  assert.equal((await database.readRecord("smoke-project"))?.title, "Smoke project");
  await database.changeLifecycle(draft.id, "published");
  assert.equal((await database.readRecord("smoke-project"))?.lifecycle, "published");

  const settings = await database.readSiteSettings();
  await database.writeSiteSettings({ ...settings, connectHeading: "Smoke heading" }, "Smoke settings update");
  assert.equal((await database.readSiteSettings()).connectHeading, "Smoke heading");

  await database.writeIntegrationSnapshot("smoke", { state: "verified" });
  assert.deepEqual((await database.readIntegrationSnapshot("smoke"))?.value, { state: "verified" });
  assert.equal((await database.consumeRateLimit("smoke", 2, 60_000)).allowed, true);
  assert.equal((await database.consumeRateLimit("smoke", 2, 60_000)).allowed, true);
  assert.equal((await database.consumeRateLimit("smoke", 2, 60_000)).allowed, false);

  database.closeDatabase();
  delete process.env.TURSO_DATABASE_URL;
  delete process.env.TURSO_AUTH_TOKEN;
  process.env.DATABASE_PROVIDER = "turso";
  await assert.rejects(async () => database.getDatabase(), /requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN/);
  console.log("backend smoke passed");
} finally {
  database.closeDatabase();
  delete process.env.DATABASE_PROVIDER;
  delete process.env.PORTFOLIO_DATABASE_PATH;
}
