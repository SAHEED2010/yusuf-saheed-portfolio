import { NextResponse } from "next/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createPortfolioMcpServer, mcpTokenConfigured, mcpTokenMatches } from "@/mcp/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  if (!mcpTokenConfigured()) return NextResponse.json({ error: "MCP is not configured" }, { status: 503 });
  if (!mcpTokenMatches(request.headers.get("authorization"))) return NextResponse.json({ error: "MCP bearer token required" }, { status: 401 });
  const origin = request.headers.get("origin");
  const allowedOrigin = process.env.MCP_ALLOWED_ORIGIN?.trim() || "*";
  if (origin && allowedOrigin !== "*" && origin !== allowedOrigin) return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  const server = createPortfolioMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  const response = await transport.handleRequest(request);
  response.headers.set("Access-Control-Allow-Origin", allowedOrigin === "*" ? "*" : origin || allowedOrigin);
  response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  return response;
}

export async function POST(request: Request) { return handle(request); }
export async function GET(request: Request) { return handle(request); }
export async function DELETE(request: Request) { return handle(request); }
export async function OPTIONS(request: Request) {
  const allowedOrigin = process.env.MCP_ALLOWED_ORIGIN?.trim() || "*";
  const origin = request.headers.get("origin");
  if (origin && allowedOrigin !== "*" && origin !== allowedOrigin) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: { "Access-Control-Allow-Origin": allowedOrigin === "*" ? "*" : origin || allowedOrigin, "Access-Control-Allow-Headers": "Authorization, Content-Type, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS" } });
}
