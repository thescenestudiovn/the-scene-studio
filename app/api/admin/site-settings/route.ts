import { ensureSiteSettingsTable, getSiteSettings } from "../../../../lib/site-settings";
import { getDB } from "../../../../lib/db";

type SiteSettings = {
  id: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
};

async function ensureSettings(): Promise<SiteSettings> {
  const db = getDB();
  await ensureSiteSettingsTable();

  return (await db
    .prepare(`SELECT id,phone,email,instagram,facebook FROM site_settings WHERE id='global' LIMIT 1`)
    .first<SiteSettings>()) ?? {
      id: "global",
      phone: "",
      email: "",
      instagram: "",
      facebook: "",
    };
}

export async function GET() {
  try {
    return Response.json({ success: true, settings: await getSiteSettings() });
  } catch (error) {
    console.error("GET /api/admin/site-settings error:", error);
    return Response.json({ success: false, error: "Failed to load site settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Partial<SiteSettings>;
    const db = getDB();

    await ensureSiteSettingsTable();
    await db.prepare(`
      UPDATE site_settings
      SET phone=?, email=?, instagram=?, facebook=?, updated_at=CURRENT_TIMESTAMP
      WHERE id='global'
    `).bind(
      body.phone?.trim() ?? "",
      body.email?.trim() ?? "",
      body.instagram?.trim() ?? "",
      body.facebook?.trim() ?? "",
    ).run();

    return Response.json({ success: true, settings: await ensureSettings() });
  } catch (error) {
    console.error("PATCH /api/admin/site-settings error:", error);
    return Response.json({ success: false, error: "Failed to save site settings" }, { status: 500 });
  }
}
