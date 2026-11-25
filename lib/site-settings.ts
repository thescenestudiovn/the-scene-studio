import { getDBAsync } from "./db";

export type SiteSettings = {
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  logo_url: string;
  header_studio_name: string;
  footer_bio: string;
  footer_copyright: string;
  default_meta_title: string;
  default_meta_description: string;
  default_og_image: string;
};

const EMPTY: SiteSettings = {
  phone: "",
  email: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  logo_url: "",
  header_studio_name: "The Scene Studio",
  footer_bio: "",
  footer_copyright: "© 2026 The Scene Studio",
  default_meta_title: "Wedding Stories — The Scene Studio",
  default_meta_description: "Editorial and documentary wedding photography and cinematography by The Scene Studio.",
  default_og_image: "",
};

export async function ensureSiteSettingsTable(existingDb?: D1Database): Promise<D1Database> {
  const db = existingDb || (await getDBAsync());

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      whatsapp TEXT DEFAULT '',
      instagram TEXT DEFAULT '',
      facebook TEXT DEFAULT '',
      logo_url TEXT DEFAULT '',
      header_studio_name TEXT DEFAULT 'The Scene Studio',
      footer_bio TEXT DEFAULT '',
      footer_copyright TEXT DEFAULT '© 2026 The Scene Studio',
      default_meta_title TEXT DEFAULT 'Wedding Stories — The Scene Studio',
      default_meta_description TEXT DEFAULT '',
      default_og_image TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const columns = [
    ["whatsapp", "TEXT DEFAULT ''"],
    ["logo_url", "TEXT DEFAULT ''"],
    ["header_studio_name", "TEXT DEFAULT 'The Scene Studio'"],
    ["footer_bio", "TEXT DEFAULT ''"],
    ["footer_copyright", "TEXT DEFAULT '© 2026 The Scene Studio'"],
    ["default_meta_title", "TEXT DEFAULT 'Wedding Stories — The Scene Studio'"],
    ["default_meta_description", "TEXT DEFAULT ''"],
    ["default_og_image", "TEXT DEFAULT ''"],
  ];
  for (const [col, type] of columns) {
    try {
      await db.prepare(`ALTER TABLE site_settings ADD COLUMN ${col} ${type}`).run();
    } catch {
      // Column already exists
    }
  }

  await db.prepare(`
    INSERT OR IGNORE INTO site_settings (id, phone, email, whatsapp, instagram, facebook, logo_url, header_studio_name, footer_bio, footer_copyright, default_meta_title, default_meta_description, default_og_image)
    VALUES ('global', '', '', '', '', '', '', 'The Scene Studio', '', '© 2026 The Scene Studio', 'Wedding Stories — The Scene Studio', '', '')
  `).run();

  return db;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const db = await ensureSiteSettingsTable();

    const settings = await db
      .prepare(`SELECT phone,email,whatsapp,instagram,facebook,logo_url,header_studio_name,footer_bio,footer_copyright,default_meta_title,default_meta_description,default_og_image FROM site_settings WHERE id='global' LIMIT 1`)
      .first<SiteSettings>();

    return settings ? { ...EMPTY, ...settings } : EMPTY;
  } catch (error) {
    console.warn("[getSiteSettings] Failed to fetch settings from database:", error);
    return EMPTY;
  }
}
