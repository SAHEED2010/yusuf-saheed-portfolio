import type { Metadata } from "next";
import { unsubscribe } from "@/newsletter/store";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Stop future release notifications from Yusuf Saheed's portfolio.",
};

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ email?: string; token?: string }> }) {
  const { email, token } = await searchParams;
  const removed = email && token ? await unsubscribe(email, token) : false;
  return (
    <section className="detail">
      <p className="eyebrow">Newsletter preferences</p>
      <h1>{removed ? "Notifications stopped." : "Stop future notifications."}</h1>
      <p className="lede">
        {removed
          ? "This address will not receive future release notifications."
          : "Use the signed unsubscribe link from a notification email to stop future release notifications."}
      </p>
    </section>
  );
}
