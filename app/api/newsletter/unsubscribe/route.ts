import { NextResponse } from "next/server";
import { unsubscribe } from "@/newsletter/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") ?? "";
  const token = url.searchParams.get("token") ?? "";
  if (!email || !token || !(await unsubscribe(email, token))) return NextResponse.json({ ok: false, error: "This unsubscribe link is invalid." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
