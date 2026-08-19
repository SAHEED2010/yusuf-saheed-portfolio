import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createPortfolioMcpServer } from "../src/mcp/server.ts";

process.env.DATABASE_PROVIDER = "sqlite";
process.env.PORTFOLIO_DATABASE_PATH = "file::memory:";
process.env.MCP_PUBLISH_CONFIRMATION = "confirm-publish";
process.env.MCP_SERVER_TOKEN = "mcp-smoke-token";

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
const server = createPortfolioMcpServer();
const client = new Client({ name: "portfolio-mcp-smoke", version: "1.0.0" });
await server.connect(serverTransport);
await client.connect(clientTransport);

try {
  const tools = await client.listTools();
  assert.deepEqual(tools.tools.map((tool) => tool.name), ["portfolio_public_context", "portfolio_list_content", "portfolio_create_project_draft", "portfolio_request_publish", "portfolio_publish_draft"]);
  const created = await client.callTool({ name: "portfolio_create_project_draft", arguments: { slug: "mcp-smoke", title: "MCP smoke", summary: "A test draft", role: "Builder", body: [], tags: ["test"], evidenceLabel: "Smoke evidence", evidenceUrl: "https://example.com", templateData: { template: "product-system", problem: "Test", audience: "Testers", contribution: "Tested", decisions: [], status: "Draft", nextImprovement: "Remove" } } });
  const createdText = JSON.parse(created.content[0].text);
  assert.equal(createdText.ok, true);
  const requested = await client.callTool({ name: "portfolio_request_publish", arguments: { slug: "mcp-smoke" } });
  const challenge = JSON.parse(requested.content[0].text).challenge;
  assert.equal(typeof challenge, "string");
  const published = await client.callTool({ name: "portfolio_publish_draft", arguments: { slug: "mcp-smoke", challenge, confirmation: "confirm-publish" } });
  assert.equal(JSON.parse(published.content[0].text).ok, true);
  console.log("mcp smoke passed");
} finally {
  await client.close();
  await server.close();
  delete process.env.DATABASE_PROVIDER;
  delete process.env.PORTFOLIO_DATABASE_PATH;
  delete process.env.MCP_PUBLISH_CONFIRMATION;
  delete process.env.MCP_SERVER_TOKEN;
}
