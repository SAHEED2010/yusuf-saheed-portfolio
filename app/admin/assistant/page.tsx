import { redirect } from "next/navigation";
import { isAdminSession } from "@/admin/auth";
import { getRuntimeConfig } from "@/lib/runtime-config";
import { AdminManagerPanel } from "@/components/admin-manager-panel";

export const dynamic = "force-dynamic";

export default async function AdminAssistantPage() { if (!(await isAdminSession())) redirect("/admin/login"); const runtime = getRuntimeConfig(); return <section className="admin-panel"><p className="eyebrow">Admin / Assistant</p><h1>Manage the portfolio with your configured model.</h1><p className="lede">The manager prepares validated drafts and change summaries. Publication stays behind an explicit dashboard confirmation unless direct publishing is deliberately enabled on the server.</p><AdminManagerPanel provider={runtime.ai.provider} model={runtime.ai.model} ready={runtime.ai.ready && runtime.ai.provider !== "none"} /></section>; }
