import { ensureSiteSettingsTable, getSiteSettings } from "../../../../lib/site-settings";
import { getDB } from "../../../../lib/db";

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
    const body = await request.json() as Record<string, unknown>;
    const db = getDB();
    await ensureSiteSettingsTable();

    const fields = [
      "phone","email","whatsapp","instagram","facebook","tiktok","pinterest",
      "address","logo","logo_white","favicon","site_description","seo_title",
      "seo_description","og_image","footer_text"
    ] as const;

    const values = fields.map(field => typeof body[field] === "string" ? body[field].trim() : "");
    const setClause = fields.map(field => `${field}=?`).join(", ");

    await db.prepare(`UPDATE site_settings SET ${setClause}, updated_at=CURRENT_TIMESTAMP WHERE id='global'`)
      .bind(...values).run();

    return Response.json({ success: true, settings: await getSiteSettings() });
  } catch (error) {
    console.error("PATCH /api/admin/site-settings error:", error);
    return Response.json({ success: false, error: "Failed to save site settings" }, { status: 500 });
  }
}
