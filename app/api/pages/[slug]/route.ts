import { getDB } from "../../../../lib/db";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const db = getDB();
    const page = await db.prepare(`SELECT id, slug, title, page_type, seo_title, seo_description FROM pages WHERE slug = ? AND published = 1`).bind(slug).first();
    if (!page) return Response.json({ success: false, error: "Page not found" }, { status: 404 });
    const blocks = await db.prepare(`SELECT id, type, sort_order, data FROM page_blocks WHERE page_id = ? ORDER BY sort_order ASC`).bind(page.id).all<{ id: string; type: string; sort_order: number; data: string }>();
    const media = await db.prepare(`SELECT id, path, filename, alt, width, height FROM media`).all();
    const mediaById = new Map((media.results ?? []).map(item => [String(item.id), item]));
    const hydratedBlocks = (blocks.results ?? []).map(block => {
      let data: Record<string, unknown> = {};
      try {
        const parsed = JSON.parse(block.data);
        if (parsed && typeof parsed === "object") data = parsed as Record<string, unknown>;
      } catch { }
      const ids = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
      return { ...block, media: ids.map(id => mediaById.get(id)).filter(Boolean) };
    });
    return Response.json({ success: true, page, blocks: hydratedBlocks });
  } catch (error) {
    console.error("GET /api/pages/[slug] error:", error);
    return Response.json({ success: false, error: "Failed to fetch page" }, { status: 500 });
  }
}
