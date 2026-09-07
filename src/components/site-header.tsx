import Link from "next/link";
import { LagosClock } from "./lagos-clock";
import { ThemeToggle } from "./theme-toggle";
import { getSiteSettings } from "@/lib/site";

export async function SiteHeader() {
  const site = await getSiteSettings();
  const links = site.navigation.filter((link) => link.enabled);
  const contact = links.find((link) => link.id === "contact");
  return <header className="site-header site-shell"><Link href="/" className="wordmark"><span className="wordmark-mark"><img src="/yusuf-mark.svg" alt="" aria-hidden="true" width="36" height="36" /></span><span>{site.name}</span></Link><nav className="primary-nav" aria-label="Primary navigation">{links.filter((link) => link.id !== "contact").map((link) => <Link href={link.href} key={link.id}>{link.label}</Link>)}<LagosClock /><ThemeToggle />{contact ? <Link className="header-contact" href={contact.href}>{contact.label}</Link> : null}</nav></header>;
}
