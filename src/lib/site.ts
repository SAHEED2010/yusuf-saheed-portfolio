import { readSiteSettings } from "@/content/database";

export async function getSiteSettings() {
  return await readSiteSettings();
}
