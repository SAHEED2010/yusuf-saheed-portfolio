import { redirect } from "next/navigation";
import { isAdminSession } from "@/admin/auth";
import { getRuntimeConfig } from "@/lib/runtime-config";
import { AdminManagerPanel } from "@/components/admin-manager-panel";

export const dynamic = "force-dynamic";

export default async function AdminAssistantPage() { if (!(await isAdminSession())) redirect("/admin/login"); const runtime = getRuntimeConfig(); return <section className="admin-panel"><p className="eyebrow">Admin / Assistant</p><h1>Manage the portfolio with your configured model.</h1><p className="lede">The manager accepts structured instructions, validates every content change, and can publish directly when the resulting record has evidence.</p><AdminManagerPanel provider={runtime.ai.provider} model={runtime.ai.model} ready={runtime.ai.ready && runtime.ai.provider !== "none"} /></section>; }
