import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteUrl } from "@/lib/site-url";
import { jsonLd, profilePageSchema } from "@/lib/structured-data";

const description =
  "Yusuf Saheed — software engineer, cofounder and CTO at Codedevs in Lagos. Escrow-backed payments, WhatsApp commerce and AI agents, with the evidence attached.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Yusuf Saheed | Engineering, Science & AI", template: "%s | Yusuf Saheed" },
  description,
  applicationName: "Yusuf Saheed",
  authors: [{ name: "Yusuf Saheed", url: "https://github.com/SAHEED2010" }],
  creator: "Yusuf Saheed",
  keywords: [
    "Yusuf Saheed",
    "software engineer",
    "Lagos",
    "Nigeria",
    "Next.js",
    "NestJS",
    "TypeScript",
    "AI engineer",
    "Codedevs",
    "full stack developer",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Yusuf Saheed | Engineering, Science & AI",
    description,
    type: "website",
    url: "/",
    siteName: "Yusuf Saheed",
    locale: "en_NG",
  },
  twitter: { card: "summary_large_image", title: "Yusuf Saheed | Engineering, Science & AI", description, creator: "@yusufsaheed01" },
  robots: { index: true, follow: true },
  // Google Search Console also accepts a meta tag. Both methods are present so
  // verification survives if the static file is ever moved or the public
  // directory is restructured.
  verification: { google: "google7053849608879c50.html" },
};
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700&family=Syne:wght@500;600;700&display=swap" rel="stylesheet" /></head><body><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(profilePageSchema(description))} /><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><main id="main-content">{children}</main><SiteFooter /></body></html>;
}
