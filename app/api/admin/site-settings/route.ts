import { getDB } from "../../../../lib/db";

type SiteSettings = {
  id: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
};

const EMPTY: SiteSettings = {
  id: "global",
  phone: "",
  email: "",
  instagram: "",
  facebook: "",
};

async function ensureSettings(): Promise<SiteSettings> {
  const db = getDB();
  await db.prepare(`INSERT OR IGNORE INTO site_settings (id,phone,email,instagram,facebook) VALUES ('global','','','','')`).run();
  return (await db.prepare(`SELECT id,phone,email,instagram,facebook FROM site_settings WHERE id='global' LIMIT 1`).first<SiteSettings>()) ?? EMPTY;
}

export async function GET() {
  try {
    return Response.json({ success: true, settings: await ensureSettings() });
  } catch (error) {
    console.error("GET /api/admin/site-settings error:", error);
    return Response.json({ success: false, error: "Failed to load site settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Partial<SiteSettings>;
    const db = getDB();

    await ensureSettings();
    await db.prepare(`UPDATE site_settings SET phone=?,email=?,instagram=?,facebook=?,updated_at=CURRENT_TIMESTAMP WHERE id='global'`)
      .bind(
        body.phone?.trim() ?? "",
        body.email?.trim() ?? "",
        body.instagram?.trim() ?? "",
        body.facebook?.trim() ?? "",
      )
      .run();

    return Response.json({ success: true, settings: await ensureSettings() });
  } catch (error) {
    console.error("PATCH /api/admin/site-settings error:", error);
    return Response.json({ success: false, error: "Failed to save site settings" }, { status: 500 });
  }
}
