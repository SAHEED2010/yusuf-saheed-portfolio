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
  socialLinks: SocialLink[];
  updatedAt: string;
};

export const defaultSiteSettings: SiteSettings = {
  name: "Yusuf Saheed",
  identity: "Engineering, Science & AI",
  heroTitle: "Yusuf Saheed builds systems for the",
  heroAccent: "real world.",
  heroSummary: "Software engineer, AI builder, scientific explorer and CodedDevs co-founder turning difficult ideas into useful products, practical research and knowledge other people can build on.",
  heroImageUrl: "",
  heroImageAlt: "Portrait of Yusuf Saheed",
  opportunityNote: "Open to engineering roles, collaborations, research, startup work and technology problems worth solving.",
  connectHeading: "Find the work. Reach the person.",
  connectSummary: "Every route opens the real profile or contact channel.",
  email: "yusufsaheed2012@gmail.com",
  phone: "+2348106249995",
  supportUrl: "https://buymeacoffee.com/yusufsaheed",
  locationLabel: "Lagos, Nigeria",
  locationUrl: "https://www.google.com/maps/search/?api=1&query=Lagos%2C%20Nigeria",
  whatsappMessage: "Hello Yusuf, I found your portfolio and would like to discuss a technology project or opportunity with you.",
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
