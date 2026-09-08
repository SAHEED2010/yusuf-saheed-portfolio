// Single source for the deployed origin.
//
// Vercel exposes VERCEL_PROJECT_PRODUCTION_URL without a scheme, which is the
// safety net if NEXT_PUBLIC_SITE_URL is ever missing: canonical tags, sitemap
// entries and structured data all break silently when they fall back to
// localhost, and that failure is invisible in the deployed page.
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}
