import { getDB } from "./db";

export type SiteSettings = {
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
};

const EMPTY: SiteSettings = {
  phone: "",
  email: "",
  instagram: "",
  facebook: "",
};

export async function ensureSiteSettingsTable(): Promise<void> {
  const db = getDB();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      phone TEXT,
      email TEXT,
      instagram TEXT,
      facebook TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await db.prepare(`
    INSERT OR IGNORE INTO site_settings (id, phone, email, instagram, facebook)
    VALUES ('global', '', '', '', '')
  `).run();
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getDB();
  await ensureSiteSettingsTable();

  const settings = await db
    .prepare(`SELECT phone,email,instagram,facebook FROM site_settings WHERE id='global' LIMIT 1`)
    .first<SiteSettings>();

  return settings ?? EMPTY;
}
