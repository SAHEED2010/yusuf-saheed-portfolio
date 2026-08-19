import { siBuymeacoffee, siGithub, siGmail, siInstagram, siWhatsapp, siX } from "simple-icons";
import type { SocialIcon } from "@/content/settings";

const linkedinPath = "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67h-3.56V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM3.56 20.45h3.57V8.99H3.56v11.46zM22.22 0H1.78C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.78 24h20.44c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z";

const icons = { github: siGithub, x: siX, instagram: siInstagram, email: siGmail, whatsapp: siWhatsapp, buymeacoffee: siBuymeacoffee } as const;

export function BrandIcon({ icon, size = 21 }: { icon: SocialIcon; size?: number }) {
  const path = icon === "linkedin" ? linkedinPath : icon === "location" ? "M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" : icons[icon]?.path;
  if (!path) return null;
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" focusable="false"><path d={path} /></svg>;
}
