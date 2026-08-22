import { getDB } from "./db";

export type SiteSettings = {
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getDB();
  const settings = await db
    .prepare(`SELECT phone,email,instagram,facebook FROM site_settings WHERE id='global' LIMIT 1`)
    .first<SiteSettings>();

  return {
    phone: settings?.phone ?? "",
    email: settings?.email ?? "",
    instagram: settings?.instagram ?? "",
    facebook: settings?.facebook ?? "",
  };
}
