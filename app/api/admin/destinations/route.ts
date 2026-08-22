import { getDB } from "../../../../lib/db";

export async function GET() {
  try {
    const db = getDB();
    const result = await db.prepare(`
      SELECT id, country, country_name, slug, name, region, seo_title, seo_description, description,
        created_at, updated_at
      FROM destinations
      ORDER BY name ASC
    `).all();
    return Response.json({ success: true, destinations: result.results });
  } catch (error) {
    console.error("GET /api/admin/destinations error:", error);
    return Response.json({ success: false, error: "Failed to fetch destinations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, string | null | undefined>;
    if (!body.name || !body.slug || !body.country || !body.country_name) {
      return Response.json({ success: false, error: "name, slug, country and country_name are required" }, { status: 400 });
    }
    const db = getDB();
    const id = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO destinations (id, country, country_name, slug, name, region, seo_title, seo_description, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, body.country, body.country_name, body.slug, body.name, body.region ?? null, body.seo_title ?? null, body.seo_description ?? null, body.description ?? null).run();
    return Response.json({ success: true, id });
  } catch (error) {
    console.error("POST /api/admin/destinations error:", error);
    return Response.json({ success: false, error: "Failed to create destination" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as Record<string, string | null | undefined>;
    if (!body.id || !body.name || !body.slug || !body.country || !body.country_name) {
      return Response.json({ success: false, error: "id, name, slug, country and country_name are required" }, { status: 400 });
    }
    const db = getDB();
    const result = await db.prepare(`
      UPDATE destinations SET country = ?, country_name = ?, slug = ?, name = ?, region = ?, seo_title = ?, seo_description = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(body.country, body.country_name, body.slug, body.name, body.region ?? null, body.seo_title ?? null, body.seo_description ?? null, body.description ?? null, body.id).run();
    if (!result.meta.changes) return Response.json({ success: false, error: "Destination not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin/destinations error:", error);
    return Response.json({ success: false, error: "Failed to update destination" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json() as { id?: string };
    if (!id) return Response.json({ success: false, error: "id is required" }, { status: 400 });
    const db = getDB();
    const result = await db.prepare(`DELETE FROM destinations WHERE id = ?`).bind(id).run();
    if (!result.meta.changes) return Response.json({ success: false, error: "Destination not found" }, { status: 404 });
    return Response.json({ success: true, deleted: id });
  } catch (error) {
    console.error("DELETE /api/admin/destinations error:", error);
    return Response.json({ success: false, error: "Failed to delete destination" }, { status: 500 });
  }
}
