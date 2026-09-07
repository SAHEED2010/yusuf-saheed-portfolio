import { NextResponse } from "next/server";
import { isAdminSession, isSameOrigin } from "@/admin/auth";
import { readSiteSettings, writeSiteSettings } from "@/content/database";
import { validateSiteSettings } from "@/content/validation";

export const runtime = "nodejs";

function redirect(request: Request, path: string) { return NextResponse.redirect(new URL(path, request.url), 303); }

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Cross-site request rejected" }, { status: 403 });
  if (!(await isAdminSession())) return redirect(request, "/admin/login?error=session");
  const form = await request.formData();
  const current = await readSiteSettings();
  const socialLinks = current.socialLinks.map((link) => ({ ...link, url: String(form.get(`url_${link.id}`) ?? link.url).trim(), logoUrl: String(form.get(`logoUrl_${link.id}`) ?? link.logoUrl ?? "").trim() || undefined, enabled: form.get(`enabled_${link.id}`) === "on" }));
  const navigation = current.navigation.map((link) => ({ ...link, label: String(form.get(`navLabel_${link.id}`) ?? link.label).trim(), href: String(form.get(`navHref_${link.id}`) ?? link.href).trim(), enabled: form.get(`navEnabled_${link.id}`) === "on" }));
  const next = { ...current, name: String(form.get("name") ?? current.name).trim(), identity: String(form.get("identity") ?? current.identity).trim(), heroTitle: String(form.get("heroTitle") ?? current.heroTitle).trim(), heroAccent: String(form.get("heroAccent") ?? current.heroAccent).trim(), heroSummary: String(form.get("heroSummary") ?? current.heroSummary).trim(), heroImageUrl: String(form.get("heroImageUrl") ?? current.heroImageUrl).trim(), heroImageAlt: String(form.get("heroImageAlt") ?? current.heroImageAlt).trim(), opportunityNote: String(form.get("opportunityNote") ?? current.opportunityNote).trim(), connectHeading: String(form.get("connectHeading") ?? current.connectHeading).trim(), connectSummary: String(form.get("connectSummary") ?? current.connectSummary).trim(), email: String(form.get("email") ?? current.email).trim(), phone: String(form.get("phone") ?? current.phone).trim(), whatsappMessage: String(form.get("whatsappMessage") ?? current.whatsappMessage).trim(), locationLabel: String(form.get("locationLabel") ?? current.locationLabel).trim(), locationUrl: String(form.get("locationUrl") ?? current.locationUrl).trim(), supportUrl: String(form.get("supportUrl") ?? current.supportUrl).trim(), footerNote: String(form.get("footerNote") ?? current.footerNote).trim(), navigation, socialLinks };
  if (!next.identity || !next.heroTitle || !next.heroAccent || !next.email || !next.supportUrl) return redirect(request, "/admin/settings?error=Identity%2C%20hero%2C%20email%2C%20and%20support%20values%20are%20required");
  const errors = validateSiteSettings(next);
  if (errors.length > 0) return redirect(request, `/admin/settings?error=${encodeURIComponent(errors[0])}`);
  await writeSiteSettings(next, "Updated public profile, hero, and social links");
  return redirect(request, "/admin/settings?saved=1");
}
