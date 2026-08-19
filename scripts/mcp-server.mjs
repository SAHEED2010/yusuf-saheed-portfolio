import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPortfolioMcpServer, mcpTokenConfigured } from "../src/mcp/server.ts";

if (!mcpTokenConfigured()) {
  console.error("MCP_SERVER_TOKEN must be set before starting the portfolio MCP server.");
  process.exit(1);
}

const server = createPortfolioMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
