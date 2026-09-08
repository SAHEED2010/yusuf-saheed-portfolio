import Link from "next/link";
import { LagosClock } from "./lagos-clock";
import { getSiteSettings } from "@/lib/site";

export async function SiteFooter() {
  const site = await getSiteSettings();
  return <footer className="site-footer site-shell"><div className="footer-brand"><strong>YS / {site.identity}</strong><span>{site.locationLabel} / West Africa Time</span><LagosClock /></div><nav className="footer-nav" aria-label="Footer navigation">{site.navigation.filter((link) => link.enabled).map((link) => <Link href={link.href} key={link.id}>{link.label}</Link>)}</nav><div className="footer-actions"><a href={`mailto:${site.email}`}>Email Yusuf</a><a href={site.supportUrl}>Support my work</a></div><small className="footer-meta">© {new Date().getFullYear()} {site.name}. {site.footerNote}</small></footer>;
}
