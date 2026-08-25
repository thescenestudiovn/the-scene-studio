import { getDB } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };
type UpdateStoryBody = {
  title?: string; slug?: string; location?: string | null; date?: string | null;
  category?: string | null; category_ids?: string[]; location_ids?: string[];
  description?: string | null; seo_title?: string | null; seo_description?: string | null;
  destination_id?: string | null; cover_media_id?: string | null; published?: boolean;
  tags?: string | null; featured?: boolean; hide_from_search?: boolean;
  social_media_id?: string | null;
};

const storySelect = `
  SELECT s.*,
    d.name AS destination_name,
    d.country AS destination_country,
    cm.path AS cover_path,
    cm.filename AS cover_filename,
    sm.path AS social_path,
    sm.filename AS social_filename,
    COALESCE(
      (SELECT GROUP_CONCAT(c.name, ', ')
       FROM story_category_relations scr
       JOIN story_categories c ON c.id=scr.category_id
       WHERE scr.story_id=s.id), s.category
    ) AS categories,
    COALESCE(
      (SELECT GROUP_CONCAT(l.name, ', ')
       FROM story_location_relations slr
       JOIN locations l ON l.id=slr.location_id
       WHERE slr.story_id=s.id), s.location
    ) AS locations
  FROM stories s
  LEFT JOIN destinations d ON d.id=s.destination_id
  LEFT JOIN media cm ON cm.id=s.cover_media_id
  LEFT JOIN media sm ON sm.id=s.social_media_id
`;

function normalizeStory(story: Record<string, unknown> | null) {
  if (!story) return story;
  const categories = typeof story.categories === "string" ? story.categories : null;
  const locations = typeof story.locations === "string" ? story.locations : null;
  return {
    ...story,
    // Keep the legacy fields useful to older editors while the relation fields
    // remain the canonical source of truth for multi-value data.
    category: categories || (typeof story.category === "string" ? story.category : null),
    location: locations || (typeof story.location === "string" ? story.location : null),
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const db = getDB();
    const rawStory = await db.prepare(`${storySelect} WHERE s.id=? LIMIT 1`).bind(id).first();
    if (!rawStory) return Response.json({ success: false, error: "Story not found" }, { status: 404 });
    const story = normalizeStory(rawStory as Record<string, unknown>);

    const blocks = await db.prepare(`SELECT * FROM story_blocks WHERE story_id=? ORDER BY sort_order ASC`).bind(id).all();
    const blocksWithMedia = await Promise.all((blocks.results ?? []).map(async block => {
      const media = await db.prepare(`SELECT m.id,m.collection_id,m.type,m.path,m.filename,m.alt,m.width,m.height,sbm.sort_order FROM story_block_media sbm INNER JOIN media m ON m.id=sbm.media_id WHERE sbm.block_id=? ORDER BY sbm.sort_order ASC`).bind(block.id).all();
      return { ...block, media: media.results ?? [] };
    }));
    const galleryCta = await db.prepare(`SELECT * FROM story_gallery_cta WHERE story_id=? LIMIT 1`).bind(id).first();
    return Response.json({ success: true, story, blocks: blocksWithMedia, gallery_cta: galleryCta ?? null });
  } catch (error) {
    console.error("GET /api/admin/stories/[id] error:", error);
    return Response.json({ success: false, error: "Failed to fetch story" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateStoryBody;
    const db = getDB();
    const existing = await db.prepare(`SELECT id,published,published_at FROM stories WHERE id=? LIMIT 1`).bind(id).first<{ id: string; published: number; published_at: string | null }>();
    if (!existing) return Response.json({ success: false, error: "Story not found" }, { status: 404 });

    if (body.slug !== undefined) {
      const slug = body.slug.trim();
      if (!slug) return Response.json({ success: false, error: "Slug is required.", field: "slug", code: "SLUG_INVALID" }, { status: 400 });
      const duplicate = await db.prepare(`SELECT id FROM stories WHERE lower(slug)=lower(?) AND id<>? LIMIT 1`).bind(slug, id).first<{ id: string }>();
      if (duplicate) return Response.json({ success: false, error: "This slug is already in use.", field: "slug", code: "SLUG_EXISTS" }, { status: 409 });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    const add = (field: string, value: unknown) => { fields.push(`${field}=?`); values.push(value); };
    if (body.title !== undefined) add("title", body.title);
    if (body.slug !== undefined) add("slug", body.slug.trim());
    if (body.location !== undefined) add("location", body.location);
    if (body.date !== undefined) add("date", body.date);
    if (body.category !== undefined && body.category_ids === undefined) add("category", body.category);
    if (body.description !== undefined) add("description", body.description);
    if (body.seo_title !== undefined) add("seo_title", body.seo_title);
    if (body.seo_description !== undefined) add("seo_description", body.seo_description);
    if (body.destination_id !== undefined) add("destination_id", body.destination_id);
    if (body.cover_media_id !== undefined) add("cover_media_id", body.cover_media_id);
    if (body.tags !== undefined) add("tags", body.tags);
    if (body.featured !== undefined) add("featured", body.featured ? 1 : 0);
    if (body.hide_from_search !== undefined) add("hide_from_search", body.hide_from_search ? 1 : 0);
    if (body.social_media_id !== undefined) add("social_media_id", body.social_media_id);
    if (body.published !== undefined) {
      add("published", body.published ? 1 : 0);
      if (body.published && !existing.published_at) add("published_at", new Date().toISOString());
      if (!body.published) add("published_at", null);
    }

    if (fields.length) {
      fields.push("updated_at=CURRENT_TIMESTAMP");
      values.push(id);
      await db.prepare(`UPDATE stories SET ${fields.join(",")} WHERE id=?`).bind(...values).run();
    }

    if (body.category_ids !== undefined) {
      const categoryIds = Array.from(new Set(body.category_ids)).filter(Boolean);
      await db.prepare(`DELETE FROM story_category_relations WHERE story_id=?`).bind(id).run();
      for (const categoryId of categoryIds) {
        await db.prepare(`INSERT OR IGNORE INTO story_category_relations (story_id, category_id) VALUES (?,?)`).bind(id, categoryId).run();
      }
      const first = categoryIds[0]
        ? await db.prepare(`SELECT name FROM story_categories WHERE id=? LIMIT 1`).bind(categoryIds[0]).first<{ name: string }>()
        : null;
      await db.prepare(`UPDATE stories SET category=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(first?.name ?? null, id).run();
    }

    if (body.location_ids !== undefined) {
      const locationIds = Array.from(new Set(body.location_ids)).filter(Boolean);
      await db.prepare(`DELETE FROM story_location_relations WHERE story_id=?`).bind(id).run();
      for (const locationId of locationIds) {
        await db.prepare(`INSERT OR IGNORE INTO story_location_relations (story_id, location_id) VALUES (?,?)`).bind(id, locationId).run();
      }
      const first = locationIds[0]
        ? await db.prepare(`SELECT name FROM locations WHERE id=? LIMIT 1`).bind(locationIds[0]).first<{ name: string }>()
        : null;
      await db.prepare(`UPDATE stories SET location=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(first?.name ?? null, id).run();
    }

    const rawStory = await db.prepare(`${storySelect} WHERE s.id=? LIMIT 1`).bind(id).first();
    const story = normalizeStory(rawStory as Record<string, unknown> | null);
    return Response.json({ success: true, story });
  } catch (error) {
    console.error("PATCH /api/admin/stories/[id] error:", error);
    return Response.json({ success: false, error: "Failed to update story" }, { status: 500 });
  }
}