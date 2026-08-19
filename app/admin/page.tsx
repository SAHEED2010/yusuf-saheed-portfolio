import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() { if (!(await isAdminSession())) redirect("/admin/login"); return <section className="admin-panel"><p className="eyebrow">Private area</p><h1>Admin dashboard</h1><p className="lede">Manage structured portfolio records, prepare drafts, and publish only after reviewing the resulting public state.</p><div className="actions"><Link className="button" href="/admin/content">Content workspace</Link><Link className="text-link" href="/admin/settings">Profile and links</Link><Link className="text-link" href="/admin/integrations">Integrations</Link><form action="/api/admin/logout" method="post"><button className="text-link" type="submit">Sign out</button></form></div><p className="provenance">All edits are stored in the local database adapter and recorded in an audit trail.</p></section>; }
