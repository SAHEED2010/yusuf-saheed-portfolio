import { redirect } from "next/navigation";
import { isAdminSession } from "@/admin/auth";
import { getSiteSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  if (!(await isAdminSession())) redirect("/admin/login");
  const settings = await getSiteSettings();
  const query = await searchParams;
  return <section className="admin-panel">
    <p className="eyebrow">Admin / Site settings</p>
    <h1>Public profile and links</h1>
    <p className="lede">These values control the public placement. Change a destination, message, image slot, or logo without editing the page source.</p>
    {query.saved && <p className="form-status">Settings saved.</p>}
    {query.error && <p className="form-status">{query.error}</p>}
    <form className="admin-form admin-record" action="/api/admin/settings" method="post">
      <label>Identity<input name="identity" defaultValue={settings.identity} required /></label>
      <label>Hero title<input name="heroTitle" defaultValue={settings.heroTitle} required /></label>
      <label>Hero accent<input name="heroAccent" defaultValue={settings.heroAccent} required /></label>
      <label>Hero summary<textarea name="heroSummary" defaultValue={settings.heroSummary} required /></label>
      <label>Hero image URL<input name="heroImageUrl" type="url" defaultValue={settings.heroImageUrl} placeholder="Optional image URL…" /></label>
      <label>Hero image description<input name="heroImageAlt" defaultValue={settings.heroImageAlt} placeholder="Describe the image…" /></label>
      <label>Opportunity note<input name="opportunityNote" defaultValue={settings.opportunityNote} required /></label>
      <label>Contact section heading<input name="connectHeading" defaultValue={settings.connectHeading} required /></label>
      <label>Contact section summary<input name="connectSummary" defaultValue={settings.connectSummary} required /></label>
      <label>Public email<input name="email" type="email" autoComplete="email" defaultValue={settings.email} required /></label>
      <label>Phone / WhatsApp<input name="phone" type="tel" autoComplete="tel" defaultValue={settings.phone} required /></label>
      <label>WhatsApp message<textarea name="whatsappMessage" defaultValue={settings.whatsappMessage} required /></label>
      <label>Location label<input name="locationLabel" defaultValue={settings.locationLabel} required /></label>
      <label>Location URL<input name="locationUrl" type="url" defaultValue={settings.locationUrl} required /></label>
      <label>Buy Me a Coffee URL<input name="supportUrl" type="url" defaultValue={settings.supportUrl} required /></label>
      <fieldset>
        <legend>Social and contact routes</legend>
        {settings.socialLinks.map((link) => <div className="settings-link-row" key={link.id}>
          <strong>{link.label}</strong>
          <div className="settings-link-fields">
            <input aria-label={`${link.label} destination URL`} name={`url_${link.id}`} type="url" defaultValue={link.url} placeholder={link.id === "instagram" ? "Add the real profile URL…" : undefined} />
            <input aria-label={`${link.label} logo image URL`} name={`logoUrl_${link.id}`} type="url" defaultValue={link.logoUrl ?? ""} placeholder="Optional replacement logo URL…" />
          </div>
          <label className="checkbox-label"><input type="checkbox" name={`enabled_${link.id}`} defaultChecked={link.enabled} /> Visible</label>
        </div>)}
      </fieldset>
      <button type="submit">Save settings</button>
    </form>
  </section>;
}
