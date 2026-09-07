export type SocialIcon = "github" | "linkedin" | "x" | "instagram" | "email" | "whatsapp" | "location" | "buymeacoffee";

export type SocialLink = {
  id: string;
  label: string;
  url: string;
  logoUrl?: string;
  icon: SocialIcon;
  enabled: boolean;
};

export type SiteSettings = {
  name: string;
  identity: string;
  heroTitle: string;
  heroAccent: string;
  heroSummary: string;
  heroImageUrl: string;
  heroImageAlt: string;
  opportunityNote: string;
  connectHeading: string;
  connectSummary: string;
  email: string;
  phone: string;
  supportUrl: string;
  locationLabel: string;
  locationUrl: string;
  whatsappMessage: string;
  footerNote: string;
  navigation: { id: string; label: string; href: string; enabled: boolean }[];
  socialLinks: SocialLink[];
  updatedAt: string;
};

export const defaultSiteSettings: SiteSettings = {
  name: "Yusuf Saheed",
  identity: "Engineering, Science & AI",
  heroTitle: "Software that works where the",
  heroAccent: "infrastructure doesn't.",
  heroSummary:
    "Cofounder and CTO at Codedevs, building production web and AI products from Lagos — escrow-backed payments, WhatsApp commerce, and AI agents that show their reasoning before they act. Four hackathon podiums, including first place at the Africa's Talking BuildWithAI Pan-African finals.",
  heroImageUrl: "/yusuf-portrait.jpeg",
  heroImageAlt: "Portrait of Yusuf Saheed",
  opportunityNote:
    "Open to internships, junior engineering roles and freelance contracts — and to founders who need a technical partner.",
  connectHeading: "Find the work. Reach the person.",
  connectSummary: "Every route opens a real profile or contact channel.",
  email: "yusufsaheed2012@gmail.com",
  phone: "+2348106249995",
  supportUrl: "https://buymeacoffee.com/yusufsaheed",
  locationLabel: "Lagos, Nigeria",
  locationUrl: "https://www.google.com/maps/search/?api=1&query=Lagos%2C%20Nigeria",
  whatsappMessage: "Hello Yusuf, I found your portfolio and would like to discuss a technology project or opportunity with you.",
  footerNote: "Built in Lagos for a global audience.",
  navigation: [
    { id: "work", label: "Work", href: "/work", enabled: true },
    { id: "library", label: "Library", href: "/library", enabled: true },
    { id: "achievements", label: "Achievements", href: "/achievements", enabled: true },
    { id: "about", label: "About", href: "/about", enabled: true },
    { id: "contact", label: "Work with me", href: "/contact", enabled: true },
  ],
  socialLinks: [
    { id: "github", label: "GitHub", url: "https://github.com/SAHEED2010", icon: "github", enabled: true },
    { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/yusuf-saheed123/", icon: "linkedin", enabled: true },
    { id: "x", label: "X", url: "https://x.com/yusufsaheed01", icon: "x", enabled: true },
    { id: "instagram", label: "Instagram", url: "", icon: "instagram", enabled: false },
    { id: "email", label: "Email", url: "mailto:yusufsaheed2012@gmail.com", icon: "email", enabled: true },
    { id: "whatsapp", label: "WhatsApp", url: "", icon: "whatsapp", enabled: true },
    { id: "location", label: "Lagos, Nigeria", url: "https://www.google.com/maps/search/?api=1&query=Lagos%2C%20Nigeria", icon: "location", enabled: true },
    { id: "buymeacoffee", label: "Buy me a coffee", url: "https://buymeacoffee.com/yusufsaheed", icon: "buymeacoffee", enabled: true },
  ],
  updatedAt: "2026-08-18T00:00:00.000Z",
};
