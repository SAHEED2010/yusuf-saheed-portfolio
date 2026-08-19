import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createPortfolioMcpServer } from "../src/mcp/server.ts";

process.env.DATABASE_PROVIDER = "sqlite";
process.env.PORTFOLIO_DATABASE_PATH = "file::memory:";
process.env.MCP_SERVER_TOKEN = "mcp-smoke-token";

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
const server = createPortfolioMcpServer();
const client = new Client({ name: "portfolio-mcp-smoke", version: "1.0.0" });
await server.connect(serverTransport);
await client.connect(clientTransport);

try {
  const tools = await client.listTools();
  assert.deepEqual(tools.tools.map((tool) => tool.name), ["portfolio_public_context", "portfolio_list_content", "portfolio_create_project", "portfolio_update_project", "portfolio_publish_project", "portfolio_update_site_settings"]);
  const input = { slug: "mcp-smoke", title: "MCP smoke", summary: "A test draft", role: "Builder", body: [], tags: ["test"], evidenceLabel: "Smoke evidence", evidenceUrl: "https://example.com", templateData: { template: "product-system", problem: "Test", audience: "Testers", contribution: "Tested", decisions: [], status: "Draft", nextImprovement: "Remove" } };
  const created = await client.callTool({ name: "portfolio_create_project", arguments: input });
  assert.equal(JSON.parse(created.content[0].text).ok, true);
  const updated = await client.callTool({ name: "portfolio_update_project", arguments: { slug: "mcp-smoke", summary: "Updated by MCP", publish: true } });
  const updatedText = JSON.parse(updated.content[0].text);
  assert.equal(updatedText.ok, true);
  assert.equal(updatedText.lifecycle, "published");
  const settings = await client.callTool({ name: "portfolio_update_site_settings", arguments: { connectHeading: "Updated by MCP" } });
  assert.equal(JSON.parse(settings.content[0].text).ok, true);
  console.log("mcp smoke passed");
} finally {
  await client.close();
  await server.close();
  delete process.env.DATABASE_PROVIDER;
  delete process.env.PORTFOLIO_DATABASE_PATH;
  delete process.env.MCP_SERVER_TOKEN;
}
