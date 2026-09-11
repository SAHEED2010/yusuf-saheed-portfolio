import { NextResponse } from "next/server";
import { isAdminSession, isSameOrigin } from "@/admin/auth";
import { previewRelease, sendRelease } from "@/newsletter/release";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Cross-site request rejected" }, { status: 403 });
  if (!(await isAdminSession())) return NextResponse.json({ error: "Admin session required" }, { status: 401 });
  const body = await request.json().catch(() => null) as { slug?: unknown; action?: unknown } | null;
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const action = body?.action === "send" ? "send" : "preview";
  if (!slug) return NextResponse.json({ error: "A slug is required." }, { status: 400 });

  if (action === "preview") {
    const preview = await previewRelease(slug);
    if (!preview) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    return NextResponse.json(preview);
  }

  // "send" is only ever reached after the admin has already seen the
  // preview and clicked a second, distinct confirmation control -- there is
  // no single click that both previews and sends.
  return NextResponse.json(await sendRelease(slug));
}
