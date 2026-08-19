import Link from "next/link";
import { LagosClock } from "./lagos-clock";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return <header className="site-header site-shell"><Link href="/" className="wordmark"><b>YS</b><span>Yusuf Saheed</span></Link><nav className="primary-nav" aria-label="Primary navigation"><Link href="/work">Work</Link><Link href="/library">Library</Link><Link href="/achievements">Achievements</Link><Link href="/about">About</Link><LagosClock /><ThemeToggle /><Link className="header-contact" href="/contact">Work with me</Link></nav></header>;
}
