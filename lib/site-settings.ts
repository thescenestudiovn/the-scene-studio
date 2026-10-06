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
  menu_config: string;
};

const EMPTY: SiteSettings = {
  phone: "", email: "", whatsapp: "", instagram: "", facebook: "",
  tiktok: "", pinterest: "", address: "", logo: "", logo_white: "",
  favicon: "", site_description: "", seo_title: "", seo_description: "",
  og_image: "", footer_text: "", menu_config: "",
};

export async function ensureSiteSettingsTable(): Promise<void> {
  const db = await getDBAsync();

  const table = await db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='site_settings' LIMIT 1")
    .first<{ name: string }>();

  if (!table) {
    await db.prepare(`
      CREATE TABLE site_settings (
        id TEXT PRIMARY KEY,
        phone TEXT, email TEXT, instagram TEXT, facebook TEXT,
        whatsapp TEXT, tiktok TEXT, pinterest TEXT, address TEXT,
        logo TEXT, logo_white TEXT, favicon TEXT, site_description TEXT,
        seo_title TEXT, seo_description TEXT, og_image TEXT, footer_text TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      INSERT INTO site_settings (id, phone, email, instagram, facebook)
      VALUES ('global', '', '', '', '')
    `).run();
    return;
  }

  // Existing production databases may still have the original 0007 schema.
  // CREATE TABLE IF NOT EXISTS does not add columns to an existing table.
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
    ["menu_config", "TEXT"],
  ] as const;

  for (const [name, definition] of missingColumns) {
    if (!existing.has(name)) {
      await db.prepare(`ALTER TABLE site_settings ADD COLUMN ${name} ${definition}`).run();
    }
  }

  const globalRow = await db
    .prepare("SELECT id FROM site_settings WHERE id='global' LIMIT 1")
    .first<{ id: string }>();

  if (!globalRow) {
    await db.prepare(`
      INSERT INTO site_settings (id, phone, email, instagram, facebook)
      VALUES ('global', '', '', '', '')
    `).run();
  }
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
