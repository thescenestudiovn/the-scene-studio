import { getDB } from "../../../../lib/db";

export async function GET() {
  try {
    const db = getDB();
    const pages = await db.prepare(`SELECT * FROM pages ORDER BY page_type ASC`).all();
    return Response.json({ success: true, pages: pages.results });
  } catch (error) {
    console.error("GET /api/admin/pages error:", error);
    return Response.json({ success: false, error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { id?: string; title?: string; seo_title?: string | null; seo_description?: string | null; blocks?: Array<{ id?: string; type: string; data?: Record<string, unknown>; sort_order?: number }> };
    if (!body.id) return Response.json({ success: false, error: "id is required" }, { status: 400 });
    const db = getDB();
    await db.prepare(`UPDATE pages SET title = COALESCE(?, title), seo_title = ?, seo_description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(body.title ?? null, body.seo_title ?? null, body.seo_description ?? null, body.id).run();
    if (body.blocks) {
      await db.prepare(`DELETE FROM page_blocks WHERE page_id = ?`).bind(body.id).run();
      for (let i = 0; i < body.blocks.length; i++) {
        const block = body.blocks[i];
        await db.prepare(`INSERT INTO page_blocks (id, page_id, type, sort_order, data) VALUES (?, ?, ?, ?, ?)`).bind(block.id ?? crypto.randomUUID(), body.id, block.type, block.sort_order ?? i, JSON.stringify(block.data ?? {})).run();
      }
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin/pages error:", error);
    return Response.json({ success: false, error: "Failed to save page" }, { status: 500 });
  }
}
