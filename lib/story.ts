import { getDBAsync } from "./db";

export type DbStory = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  date: string | null;
  category: string | null;
  seo_title: string | null;
  seo_description: string | null;
  description: string | null;
  cover_media_id: string | null;
  destination_id: string | null;
  destination_slug?: string | null;
  destination_country?: string | null;
  destination_name?: string | null;
  cover_image_path?: string | null;
  published: number;
  blocks?: Array<Record<string, unknown>>;
  galleryCta?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export async function getStoryBySlug(slug: string): Promise<DbStory | null> {
  const db = await getDBAsync();

  const story = await db
    .prepare(`
      SELECT
        s.*,
        d.slug AS destination_slug,
        d.country AS destination_country,
        d.name AS destination_name,
        m.path AS cover_image_path
      FROM stories s
      LEFT JOIN destinations d
        ON d.id = s.destination_id
      LEFT JOIN media m
        ON m.id = s.cover_media_id
      WHERE s.slug = ?
        AND s.published = 1
      LIMIT 1
    `)
    .bind(slug)
    .first<DbStory>();

  if (!story) return null;

  const blocks = await db
    .prepare(`
      SELECT
        id,
        type,
        variant,
        sort_order,
        eyebrow,
        title,
        body,
        media_id,
        gallery_title,
        data
      FROM story_blocks
      WHERE story_id = ?
      ORDER BY sort_order ASC
    `)
    .bind(story.id)
    .all();

  const blockRows = (blocks.results ?? []) as Array<Record<string, unknown> & { id: string }>;

  let blocksWithMedia: Array<Record<string, unknown>> = blockRows.map((b) => ({ ...b, media: [] }));

  if (blockRows.length > 0) {
    const placeholders = blockRows.map(() => "?").join(",");
    const blockIds = blockRows.map((b) => b.id);

    const mediaResults = await db
      .prepare(`
        SELECT
          sbm.block_id,
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
        WHERE sbm.block_id IN (${placeholders})
        ORDER BY sbm.block_id, sbm.sort_order ASC
      `)
      .bind(...blockIds)
      .all();

    const mediaByBlock = new Map<string, Array<Record<string, unknown>>>();
    for (const item of (mediaResults.results ?? []) as Array<Record<string, unknown> & { block_id: string }>) {
      const blockId = item.block_id;
      if (!mediaByBlock.has(blockId)) {
        mediaByBlock.set(blockId, []);
      }
      mediaByBlock.get(blockId)!.push(item);
    }

    blocksWithMedia = blockRows.map((b) => ({
      ...b,
      media: mediaByBlock.get(b.id) ?? [],
    }));
  }

  const galleryCta = await db
    .prepare(`
      SELECT enabled, label, collection_id, custom_url
      FROM story_gallery_cta
      WHERE story_id = ?
      LIMIT 1
    `)
    .bind(story.id)
    .first();

  return {
    ...story,
    cover_image_path: (story.cover_image_path as string | null) || null,
    blocks: blocksWithMedia,
    galleryCta: galleryCta ?? null,
  };
}
