import { getDB } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateStoryBody = {
  title?: string;
  slug?: string;
  location?: string | null;
  date?: string | null;
  category?: string | null;
  description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  destination_id?: string | null;
  cover_media_id?: string | null;
  published?: boolean;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const db = getDB();

    const story = await db
      .prepare(`
        SELECT
          s.*,
          d.name AS destination_name,
          d.country AS destination_country
        FROM stories s
        LEFT JOIN destinations d ON d.id = s.destination_id
        WHERE s.id = ?
        LIMIT 1
      `)
      .bind(id)
      .first();

    if (!story) {
      return Response.json({ success: false, error: "Story not found" }, { status: 404 });
    }

    const blocks = await db
      .prepare(`
        SELECT *
        FROM story_blocks
        WHERE story_id = ?
        ORDER BY sort_order ASC
      `)
      .bind(id)
      .all();

    const blockRows = blocks.results ?? [];

    const blocksWithMedia = await Promise.all(
      blockRows.map(async (block) => {
        const junctionMedia = await db
          .prepare(`
            SELECT
              m.id,
              m.collection_id,
              m.type,
              m.path,
              m.filename,
              m.alt,
              m.width,
              m.height,
              sbm.sort_order
            FROM story_block_media sbm
            INNER JOIN media m ON m.id = sbm.media_id
            WHERE sbm.block_id = ?
            ORDER BY sbm.sort_order ASC
          `)
          .bind(block.id)
          .all();

        let media = junctionMedia.results ?? [];

        // Image blocks use the direct media_id relationship. Gallery blocks use
        // story_block_media so one block can contain an ordered collection.
        if (media.length === 0 && block.type === "image" && block.media_id) {
          const directMedia = await db
            .prepare(`
              SELECT
                id,
                collection_id,
                type,
                path,
                filename,
                alt,
                width,
                height,
                0 AS sort_order
              FROM media
              WHERE id = ?
              LIMIT 1
            `)
            .bind(block.media_id)
            .first();

          if (directMedia) media = [directMedia];
        }

        return { ...block, media };
      })
    );

    const galleryCta = await db
      .prepare(`
        SELECT *
        FROM story_gallery_cta
        WHERE story_id = ?
        LIMIT 1
      `)
      .bind(id)
      .first();

    return Response.json({
      success: true,
      story,
      blocks: blocksWithMedia,
      gallery_cta: galleryCta ?? null,
    });
  } catch (error) {
    console.error("GET /api/admin/stories/[id] error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateStoryBody;
    const db = getDB();

    const existing = await db
      .prepare(`SELECT id FROM stories WHERE id = ? LIMIT 1`)
      .bind(id)
      .first();

    if (!existing) {
      return Response.json({ success: false, error: "Story not found" }, { status: 404 });
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.title !== undefined) {
      fields.push("title = ?");
      values.push(body.title);
    }
    if (body.slug !== undefined) {
      fields.push("slug = ?");
      values.push(body.slug);
    }
    if (body.location !== undefined) {
      fields.push("location = ?");
      values.push(body.location);
    }
    if (body.date !== undefined) {
      fields.push("date = ?");
      values.push(body.date);
    }
    if (body.category !== undefined) {
      fields.push("category = ?");
      values.push(body.category);
    }
    if (body.description !== undefined) {
      fields.push("description = ?");
      values.push(body.description);
    }
    if (body.seo_title !== undefined) {
      fields.push("seo_title = ?");
      values.push(body.seo_title);
    }
    if (body.seo_description !== undefined) {
      fields.push("seo_description = ?");
      values.push(body.seo_description);
    }
    if (body.destination_id !== undefined) {
      fields.push("destination_id = ?");
      values.push(body.destination_id);
    }
    if (body.cover_media_id !== undefined) {
      fields.push("cover_media_id = ?");
      values.push(body.cover_media_id);
    }
    if (body.published !== undefined) {
      fields.push("published = ?");
      values.push(body.published ? 1 : 0);
    }

    if (fields.length === 0) {
      return Response.json({ success: true, message: "Nothing to update" });
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    await db
      .prepare(`UPDATE stories SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    const story = await db
      .prepare(`SELECT * FROM stories WHERE id = ? LIMIT 1`)
      .bind(id)
      .first();

    return Response.json({ success: true, story });
  } catch (error) {
    console.error("PATCH /api/admin/stories/[id] error:", error);
    return Response.json(
      { success: false, error: "Failed to update story" },
      { status: 500 }
    );
  }
}
