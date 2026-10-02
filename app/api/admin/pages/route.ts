import { getDB } from "../../../../lib/db";

export async function GET() {
  try {
    const db = getDB();

    // Keep the admin Page Builder usable even when the initial page seed
    // has not been applied to an existing D1 database yet.
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        page_type TEXT NOT NULL,
        seo_title TEXT,
        seo_description TEXT,
        published INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS page_blocks (
        id TEXT PRIMARY KEY,
        page_id TEXT NOT NULL,
        type TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        data TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.batch([
      db.prepare(`INSERT OR IGNORE INTO pages (id,slug,title,page_type,published) VALUES ('page-home','home','Home','home',1)`),
      db.prepare(`INSERT OR IGNORE INTO pages (id,slug,title,page_type,published) VALUES ('page-about','about','About','about',1)`),
      db.prepare(`INSERT OR IGNORE INTO pages (id,slug,title,page_type,seo_title,seo_description,published) VALUES ('page-contact','contact','Contact','contact','Contact — The Scene Studio','Contact The Scene Studio for destination wedding photography and films in Vietnam and beyond.',1)`),
    ]);

    const pages = await db.prepare(`SELECT * FROM pages ORDER BY page_type ASC`).all();
    return Response.json({ success: true, pages: pages.results });
  } catch (error) {
    console.error("GET /api/admin/pages error:", error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch pages",
    }, { status: 500 });
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
