import { NextResponse } from "next/server";
import { unsubscribe } from "@/newsletter/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token || !(await unsubscribe(token))) return NextResponse.json({ ok: false, error: "This unsubscribe link is invalid or expired." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
