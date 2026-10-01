import { getDBAsync } from "./db";

export type SiteSettings = {
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  pinterest: string;
  address: string;
  logo: string;
  logo_white: string;
  favicon: string;
  site_description: string;
  seo_title: string;
  seo_description: string;
  og_image: string;
  footer_text: string;
};

const EMPTY: SiteSettings = {
  phone: "", email: "", whatsapp: "", instagram: "", facebook: "",
  tiktok: "", pinterest: "", address: "", logo: "", logo_white: "",
  favicon: "", site_description: "", seo_title: "", seo_description: "",
  og_image: "", footer_text: "",
};

export async function ensureSiteSettingsTable(): Promise<void> {
  const db = await getDBAsync();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      phone TEXT, email TEXT, instagram TEXT, facebook TEXT,
      whatsapp TEXT, tiktok TEXT, pinterest TEXT, address TEXT,
      logo TEXT, logo_white TEXT, favicon TEXT, site_description TEXT,
      seo_title TEXT, seo_description TEXT, og_image TEXT, footer_text TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // The production D1 may still have the original 0007 schema.
  // CREATE TABLE IF NOT EXISTS does not add columns to an existing table,
  // so add any expanded settings columns that are missing.
  const columns = await db.prepare("PRAGMA table_info(site_settings)").all<{ name: string }>();
  const existing = new Set(columns.results.map(column => column.name));
  const missingColumns = [
    ["whatsapp", "TEXT"],
    ["tiktok", "TEXT"],
    ["pinterest", "TEXT"],
    ["address", "TEXT"],
    ["logo", "TEXT"],
    ["logo_white", "TEXT"],
    ["favicon", "TEXT"],
    ["site_description", "TEXT"],
    ["seo_title", "TEXT"],
    ["seo_description", "TEXT"],
    ["og_image", "TEXT"],
    ["footer_text", "TEXT"],
  ] as const;

  for (const [name, definition] of missingColumns) {
    if (!existing.has(name)) {
      await db.prepare(`ALTER TABLE site_settings ADD COLUMN ${name} ${definition}`).run();
    }
  }

  await db.prepare(`
    INSERT OR IGNORE INTO site_settings (id, phone, email, instagram, facebook)
    VALUES ('global', '', '', '', '')
  `).run();
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = await getDBAsync();
  const settings = await db.prepare(`
    SELECT phone,email,whatsapp,instagram,facebook,tiktok,pinterest,address,
           logo,logo_white,favicon,site_description,seo_title,seo_description,
           og_image,footer_text
    FROM site_settings WHERE id='global' LIMIT 1
  `).first<SiteSettings>();
  return { ...EMPTY, ...(settings ?? {}) };
}
