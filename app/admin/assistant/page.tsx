import { redirect } from "next/navigation";
import { isAdminSession } from "@/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminAssistantPage() { if (!(await isAdminSession())) redirect("/admin/login"); return <section className="admin-panel"><p className="eyebrow">Admin / Assistant</p><h1>Draft first. Publish only after confirmation.</h1><p className="lede">The private assistant will prepare structured edits, show a change summary and preview, and wait for Yusuf's explicit confirmation before publishing.</p></section>; }
