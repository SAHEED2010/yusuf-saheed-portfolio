import { getSiteSettings } from "@/lib/site";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const whatsapp = `https://wa.me/${settings.phone.replace(/\D/g, "")}?text=${encodeURIComponent(settings.whatsappMessage)}`;
  return <section className="detail">
    <p className="eyebrow">Contact</p><h1>Bring a hard problem or a useful opportunity.</h1>
    <p className="lede">Yusuf is open to engineering roles, collaborations, research, startup work, and technology solutions for teams and organizations.</p>
    <div className="actions"><a className="button" href={`mailto:${settings.email}`}>Email Yusuf</a><a className="text-link" href={whatsapp}>WhatsApp</a><a className="text-link" href={settings.supportUrl}>Buy me a coffee</a></div>
    <p className="provenance">Public email: {settings.email}<br />{settings.locationLabel} / West Africa Time</p>
  </section>;
}
