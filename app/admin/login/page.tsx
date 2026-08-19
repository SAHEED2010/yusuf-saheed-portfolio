import Link from "next/link";
import { adminConfigurationReady } from "@/admin/auth";

export const dynamic = "force-dynamic";

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <AdminLoginContent searchParams={searchParams} />;
}

async function AdminLoginContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = adminConfigurationReady();
  return <section className="admin-panel"><p className="eyebrow">Private area</p><h1>Admin sign in</h1><p className="lede">This workspace is restricted to the configured Yusuf account. No credentials are stored in the repository.</p>{!configured && <p className="provenance">Admin access is not configured yet. Add the private environment values from <code>.env.example</code> before signing in.</p>}{error === "rate-limit" ? <p className="form-status">Too many attempts. Wait 15 minutes before trying again.</p> : error && <p className="form-status">The email or password was not accepted.</p>}<form className="admin-form" action="/api/admin/login" method="post"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required /><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /><button type="submit" disabled={!configured}>Sign in</button></form><Link className="text-link" href="/">Return to portfolio</Link></section>;
}
