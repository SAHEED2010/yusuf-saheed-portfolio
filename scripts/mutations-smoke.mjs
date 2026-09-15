import assert from "node:assert/strict";

process.env.DATABASE_PROVIDER = "sqlite";
process.env.PORTFOLIO_DATABASE_PATH = "file::memory:";

const { createContentRecord, updateContentRecord, describeChange } = await import("../src/content/mutations.ts");
const { validateContent } = await import("../src/content/validation.ts");
const database = await import("../src/content/database.ts");

try {
  // A Library entry (non-project) can now be created through the same
  // mutation layer the admin assistant uses -- this was the actual gap.
  const tutorial = createContentRecord(
    { slug: "learn-scrypt", title: "Learn scrypt", summary: "Why scrypt beats a fast hash for passwords.", contentType: "tutorial", tags: ["security"] },
    false,
  );
  assert.equal(tutorial.contentType, "tutorial", "non-project content type must be preserved");
  assert.equal(tutorial.lifecycle, "draft", "unpublished create must be a draft");
  assert.deepEqual(validateContent(tutorial), [], "a well-formed tutorial draft should validate with no errors");
  await database.writeRecord(tutorial, "create", "smoke: created tutorial");
  assert.equal((await database.readRecord("learn-scrypt"))?.title, "Learn scrypt");

  // Multi-link and multi-evidence replace: the old code could only ever
  // touch a single "primary" link/evidence slot. Now the full list can be
  // set at once.
  const withTwoLinks = updateContentRecord(tutorial, {
    links: [{ label: "Guide", url: "https://example.com/guide" }, { label: "Reference", url: "https://example.com/ref" }],
    evidence: [
      { label: "Benchmark", url: "https://example.com/bench", level: "verified" },
      { label: "RFC", url: "https://example.com/rfc", level: "verified" },
    ],
  });
  assert.equal(withTwoLinks.links.length, 2, "update_content must support more than one link");
  assert.equal(withTwoLinks.evidence.length, 2, "update_content must support more than one evidence item");

  const summary = describeChange(tutorial, withTwoLinks);
  assert.match(summary, /links changed from 0 to 2/, "the change summary should describe the link count change");
  assert.match(summary, /evidence items changed from 0 to 2/, "the change summary should describe the evidence count change");

  const createSummary = describeChange(undefined, tutorial);
  assert.match(createSummary, /^Create "Learn scrypt"/, "a create should be described distinctly from an update");

  // A project still gets its templateData default when none is supplied.
  const project = createContentRecord(
    { slug: "smoke-project", title: "Smoke project", summary: "A project created via the shared mutation layer.", contentType: "project" },
    false,
  );
  assert.equal(project.contentType, "project");
  assert.equal(project.templateData.template, "product-system", "a project without explicit templateData should default to product-system");

  // describeChange() previously never looked at templateData at all, so
  // switching a project's template -- a significant edit -- produced no
  // mention of it in the summary shown before publishing.
  const switched = updateContentRecord(project, { templateData: { template: "tool-utility", repeatedPain: "x", interface: "y", usage: "z", implementation: "a", verification: "b" } });
  const switchSummary = describeChange(project, switched);
  assert.match(switchSummary, /template switches from product-system to tool-utility/, "switching a project's template must be named in the change summary");

  const sameTemplateEdit = updateContentRecord(project, { templateData: { problem: "A new problem statement" } });
  const editSummary = describeChange(project, sameTemplateEdit);
  assert.match(editSummary, /product-system fields updated/, "editing fields within the same template must still be described, distinctly from a template switch");

  database.closeDatabase();
  console.log("mutations smoke passed");
} finally {
  database.closeDatabase();
  delete process.env.DATABASE_PROVIDER;
  delete process.env.PORTFOLIO_DATABASE_PATH;
}
