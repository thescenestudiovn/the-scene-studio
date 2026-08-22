import { getDB } from "../../../../lib/db";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const db = getDB();
    const page = await db.prepare(`SELECT id, slug, title, page_type, seo_title, seo_description FROM pages WHERE slug = ? AND published = 1`).bind(slug).first();
    if (!page) return Response.json({ success: false, error: "Page not found" }, { status: 404 });
    const blocks = await db.prepare(`SELECT id, type, sort_order, data FROM page_blocks WHERE page_id = ? ORDER BY sort_order ASC`).bind(page.id).all();
    return Response.json({ success: true, page, blocks: blocks.results });
  } catch (error) {
    console.error("GET /api/pages/[slug] error:", error);
    return Response.json({ success: false, error: "Failed to fetch page" }, { status: 500 });
  }
}
