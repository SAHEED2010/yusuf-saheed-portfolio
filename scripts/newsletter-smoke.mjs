import assert from "node:assert/strict";

process.env.DATABASE_PROVIDER = "sqlite";
process.env.PORTFOLIO_DATABASE_PATH = "file::memory:";
process.env.PORTFOLIO_SESSION_SECRET = "smoke-session-secret";
process.env.RESEND_API_KEY = "smoke-fake-key";
process.env.RESEND_FROM = "smoke@example.com";
process.env.NEXT_PUBLIC_SITE_URL = "https://smoke.example.com";

// No real network call is ever made: fetch is replaced before any module
// that calls it is exercised, and only Resend's endpoint is accepted.
const sentEmails = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  if (String(url) !== "https://api.resend.com/emails") throw new Error(`unexpected fetch to ${url}`);
  sentEmails.push(JSON.parse(init.body));
  return new Response(JSON.stringify({ id: "smoke" }), { status: 200 });
};

const database = await import("../src/content/database.ts");
const newsletter = await import("../src/newsletter/store.ts");
const release = await import("../src/newsletter/release.ts");
const { projects } = await import("../src/content/seed.ts");

try {
  // 1. Subscribe, verify, and confirm the unsubscribe link now actually
  // works after verification -- this was completely broken before: the only
  // token that ever existed was destroyed by verifySubscription itself.
  const subscription = await newsletter.createSubscription("smoke-subscriber@example.com");
  assert.equal(subscription.status, "pending");
  assert.ok(subscription.token, "a verification token should be issued");
  assert.equal(await newsletter.verifySubscription(subscription.token), true);

  const validToken = newsletter.unsubscribeToken("smoke-subscriber@example.com");
  assert.equal(await newsletter.unsubscribe("smoke-subscriber@example.com", "not-the-real-token"), false, "an incorrect token must be rejected");
  assert.equal(await newsletter.unsubscribe("smoke-subscriber@example.com", validToken), true, "the correct stateless token must succeed after verification");
  assert.equal(await newsletter.unsubscribe("smoke-subscriber@example.com", validToken), true, "unsubscribing twice must stay idempotent, not error");

  // 2. Two more subscribers, both active, to exercise the actual release send.
  for (const email of ["reader-one@example.com", "reader-two@example.com"]) {
    const result = await newsletter.createSubscription(email);
    await newsletter.verifySubscription(result.token);
  }
  const active = await newsletter.getActiveSubscribers();
  assert.deepEqual(active.sort(), ["reader-one@example.com", "reader-two@example.com"]);

  // 3. A draft is never release-eligible.
  const draft = { ...projects[0], id: "smoke-release-draft", slug: "smoke-release-draft", lifecycle: "draft", visibility: "private" };
  await database.writeRecord(draft, "create", "smoke draft");
  const draftPreview = await release.previewRelease("smoke-release-draft");
  assert.equal(draftPreview.eligible, false, "a draft must not be release-eligible");

  // 4. A published, public entry is eligible and previews the real
  // recipient count without sending anything.
  const published = { ...projects[0], id: "smoke-release-published", slug: "smoke-release-published", lifecycle: "published", visibility: "public" };
  await database.writeRecord(published, "create", "smoke published");
  const preview = await release.previewRelease("smoke-release-published");
  assert.equal(preview.eligible, true);
  assert.equal(preview.recipientCount, 2);
  assert.equal(sentEmails.length, 0, "previewing must never send an email");

  // 5. Sending actually delivers to every active subscriber, with a
  // correctly signed, per-recipient unsubscribe link -- not the same broken
  // token, and not the same link for every recipient.
  const sendResult = await release.sendRelease("smoke-release-published");
  assert.equal(sendResult.ok, true);
  assert.equal(sendResult.sent, 2);
  assert.equal(sendResult.failed, 0);
  assert.equal(sentEmails.length, 2);

  const toAddresses = sentEmails.map((email) => email.to[0]).sort();
  assert.deepEqual(toAddresses, ["reader-one@example.com", "reader-two@example.com"]);

  const emailForReaderOne = sentEmails.find((email) => email.to[0] === "reader-one@example.com");
  const expectedToken = newsletter.unsubscribeToken("reader-one@example.com");
  assert.match(emailForReaderOne.html, new RegExp(`email=reader-one%40example\\.com`), "the unsubscribe link must be addressed to this exact recipient");
  assert.match(emailForReaderOne.html, new RegExp(expectedToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "the embedded token must match this recipient's own signed token");

  console.log("newsletter smoke passed");
} finally {
  globalThis.fetch = realFetch;
  database.closeDatabase();
  delete process.env.DATABASE_PROVIDER;
  delete process.env.PORTFOLIO_DATABASE_PATH;
  delete process.env.PORTFOLIO_SESSION_SECRET;
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM;
  delete process.env.NEXT_PUBLIC_SITE_URL;
}
