import { ensureSiteSettingsTable, getSiteSettings, type SiteSettings } from "../../../../lib/site-settings";
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
    const body = (await request.json()) as Partial<SiteSettings>;
    const db = await ensureSiteSettingsTable();
    await db.prepare(`
      UPDATE site_settings
      SET
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        whatsapp = COALESCE(?, whatsapp),
        instagram = COALESCE(?, instagram),
        facebook = COALESCE(?, facebook),
        logo_url = COALESCE(?, logo_url),
        header_studio_name = COALESCE(?, header_studio_name),
        footer_bio = COALESCE(?, footer_bio),
        footer_copyright = COALESCE(?, footer_copyright),
        default_meta_title = COALESCE(?, default_meta_title),
        default_meta_description = COALESCE(?, default_meta_description),
        default_og_image = COALESCE(?, default_og_image),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 'global'
    `).bind(
      body.phone !== undefined ? body.phone.trim() : null,
      body.email !== undefined ? body.email.trim() : null,
      body.whatsapp !== undefined ? body.whatsapp.trim() : null,
      body.instagram !== undefined ? body.instagram.trim() : null,
      body.facebook !== undefined ? body.facebook.trim() : null,
      body.logo_url !== undefined ? body.logo_url.trim() : null,
      body.header_studio_name !== undefined ? body.header_studio_name.trim() : null,
      body.footer_bio !== undefined ? body.footer_bio.trim() : null,
      body.footer_copyright !== undefined ? body.footer_copyright.trim() : null,
      body.default_meta_title !== undefined ? body.default_meta_title.trim() : null,
      body.default_meta_description !== undefined ? body.default_meta_description.trim() : null,
      body.default_og_image !== undefined ? body.default_og_image.trim() : null,
    ).run();

    return Response.json({ success: true, settings: await getSiteSettings() });
  } catch (error) {
    console.error("PATCH /api/admin/site-settings error:", error);
    return Response.json({ success: false, error: "Failed to save site settings" }, { status: 500 });
  }
}
