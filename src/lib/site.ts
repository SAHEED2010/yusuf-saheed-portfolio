import { readSiteSettings } from "@/content/database";

export function getSiteSettings() {
  return readSiteSettings();
}
