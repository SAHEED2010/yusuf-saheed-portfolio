import { NextResponse } from "next/server";
import { verifySubscription } from "@/newsletter/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token || !(await verifySubscription(token))) return NextResponse.json({ ok: false, error: "This verification link is invalid or expired." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
