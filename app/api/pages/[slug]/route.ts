import { getDB } from "../../../../lib/db";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const db = getDB();
    const page = await db.prepare(`SELECT id, slug, title, page_type, seo_title, seo_description FROM pages WHERE slug = ? AND published = 1`).bind(slug).first();
    if (!page) return Response.json({ success: false, error: "Page not found" }, { status: 404 });

    const blocksResult = await db.prepare(`SELECT id, type, sort_order, data FROM page_blocks WHERE page_id = ? ORDER BY sort_order ASC`).bind(page.id).all();
    const blocks = await Promise.all((blocksResult.results ?? []).map(async (block) => {
      let data: Record<string, unknown> = {};
      try {
        data = typeof block.data === "string" ? JSON.parse(block.data) : (block.data as Record<string, unknown>) ?? {};
      } catch {
        data = {};
      }

      const mediaIds = Array.isArray(data.media_ids)
        ? data.media_ids.filter((id): id is string => typeof id === "string" && id.length > 0)
        : [];

      const media = mediaIds.length
        ? (await db.prepare(`
            SELECT id, collection_id, type, path, filename, alt, width, height, sort_order, created_at
            FROM media
            WHERE id IN (${mediaIds.map(() => "?").join(",")})
          `).bind(...mediaIds).all()).results ?? []
        : [];

      const mediaById = new Map(media.map((item) => [String(item.id), item]));
      const orderedMedia = mediaIds.map((id) => mediaById.get(id)).filter(Boolean);

      return { ...block, media: orderedMedia };
    }));

    return Response.json({ success: true, page, blocks });
  } catch (error) {
    console.error("GET /api/pages/[slug] error:", error);
    return Response.json({ success: false, error: "Failed to fetch page" }, { status: 500 });
  }
}
