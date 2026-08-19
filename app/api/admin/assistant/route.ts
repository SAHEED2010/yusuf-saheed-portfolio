import { NextResponse } from "next/server";
import { isAdminSession, isSameOrigin } from "@/admin/auth";
import { runAdminManager } from "@/assistant/admin-manager";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Cross-site request rejected" }, { status: 403 });
  if (!(await isAdminSession())) return NextResponse.json({ error: "Admin session required" }, { status: 401 });
  const body = await request.json().catch(() => null) as { instruction?: unknown } | null;
  const instruction = typeof body?.instruction === "string" ? body.instruction.trim().slice(0, 4000) : "";
  if (!instruction) return NextResponse.json({ error: "Instruction is required" }, { status: 400 });
  return NextResponse.json(await runAdminManager(instruction));
}
