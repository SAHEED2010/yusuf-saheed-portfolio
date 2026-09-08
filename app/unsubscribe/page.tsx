import { unsubscribe } from "@/newsletter/store";

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token } = await searchParams; const removed = token ? await unsubscribe(token) : false; return <section className="detail"><p className="eyebrow">Newsletter preferences</p><h1>{removed ? "Notifications stopped." : "Stop future notifications."}</h1><p className="lede">{removed ? "This address will not receive future release notifications." : "Use the signed unsubscribe link from a notification email."}</p></section>; }
