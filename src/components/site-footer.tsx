import Link from "next/link";
import { LagosClock } from "./lagos-clock";
import { getSiteSettings } from "@/lib/site";

export function SiteFooter() {
  const site = getSiteSettings();
  return <footer className="site-footer site-shell"><div className="footer-brand"><strong>YS / {site.identity}</strong><span>{site.locationLabel} / West Africa Time</span><LagosClock /></div><nav className="footer-nav" aria-label="Footer navigation"><Link href="/work">Work</Link><Link href="/library">Library</Link><Link href="/achievements">Achievements</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav><div className="footer-actions"><a href={`mailto:${site.email}`}>Email Yusuf</a><a href={site.supportUrl}>Support my work</a></div><small className="footer-meta">© {new Date().getFullYear()} {site.name}. Built in Lagos for a global audience.</small></footer>;
}
