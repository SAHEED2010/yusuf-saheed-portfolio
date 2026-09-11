import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createPortfolioMcpServer } from "../src/mcp/server.ts";

process.env.DATABASE_PROVIDER = "sqlite";
process.env.PORTFOLIO_DATABASE_PATH = "file::memory:";
process.env.MCP_SERVER_TOKEN = "mcp-smoke-token";
process.env.MCP_ALLOW_DIRECT_PUBLISH = "true";
process.env.MCP_ALLOW_SETTINGS_MUTATION = "true";

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
const server = createPortfolioMcpServer();
const client = new Client({ name: "portfolio-mcp-smoke", version: "1.0.0" });
await server.connect(serverTransport);
await client.connect(clientTransport);

try {
  const tools = await client.listTools();
  assert.deepEqual(
    tools.tools.map((tool) => tool.name),
    ["portfolio_public_context", "portfolio_list_content", "portfolio_create_content", "portfolio_update_content", "portfolio_publish_content", "portfolio_archive_content", "portfolio_update_site_settings"],
  );

  // A project still works end to end, including its templateData.
  const projectInput = { contentType: "project", slug: "mcp-smoke", title: "MCP smoke", summary: "A test draft", role: "Builder", body: [], tags: ["test"], evidence: [{ label: "Smoke evidence", url: "https://example.com", level: "in-progress" }], templateData: { template: "product-system", problem: "Test", audience: "Testers", contribution: "Tested", decisions: [], status: "Draft", nextImprovement: "Remove" } };
  const created = await client.callTool({ name: "portfolio_create_content", arguments: projectInput });
  const createdBody = JSON.parse(created.content[0].text);
  assert.equal(createdBody.ok, true);

  // A non-project content type -- this is exactly what the old
  // portfolio_create_project/update_project tools could never do, which was
  // the point of this migration.
  const tutorialInput = { contentType: "tutorial", slug: "mcp-smoke-tutorial", title: "MCP smoke tutorial", summary: "A non-project record created through MCP.", links: [{ label: "Guide", url: "https://example.com/guide" }, { label: "Reference", url: "https://example.com/ref" }] };
  const createdTutorial = await client.callTool({ name: "portfolio_create_content", arguments: tutorialInput });
  const createdTutorialBody = JSON.parse(createdTutorial.content[0].text);
  assert.equal(createdTutorialBody.ok, true);
  assert.equal(createdTutorialBody.record.contentType, "tutorial");
  assert.equal(createdTutorialBody.record.links.length, 2, "multi-link create must be supported, not just one primary link");

  // Update with a publish, and confirm the full-array evidence replace works
  // through MCP the same way it does through the admin assistant.
  const updated = await client.callTool({ name: "portfolio_update_content", arguments: { slug: "mcp-smoke", summary: "Updated by MCP", evidence: [{ label: "First", url: "https://example.com/a", level: "verified" }, { label: "Second", url: "https://example.com/b", level: "verified" }], publish: true } });
  const updatedBody = JSON.parse(updated.content[0].text);
  assert.equal(updatedBody.ok, true);
  assert.equal(updatedBody.lifecycle, "published");
  assert.equal(updatedBody.record.evidence.length, 2, "update_content must fully replace the evidence list");
  assert.match(updatedBody.summary, /evidence items changed from 1 to 2/);

  const archived = await client.callTool({ name: "portfolio_archive_content", arguments: { slug: "mcp-smoke-tutorial" } });
  const archivedBody = JSON.parse(archived.content[0].text);
  assert.equal(archivedBody.ok, true);
  assert.equal(archivedBody.lifecycle, "archived");

  const settings = await client.callTool({ name: "portfolio_update_site_settings", arguments: { connectHeading: "Updated by MCP" } });
  assert.equal(JSON.parse(settings.content[0].text).ok, true);

  console.log("mcp smoke passed");
} finally {
  await client.close();
  await server.close();
  delete process.env.DATABASE_PROVIDER;
  delete process.env.PORTFOLIO_DATABASE_PATH;
  delete process.env.MCP_SERVER_TOKEN;
  delete process.env.MCP_ALLOW_DIRECT_PUBLISH;
  delete process.env.MCP_ALLOW_SETTINGS_MUTATION;
}
