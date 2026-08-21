import { getDB } from "./db";

export async function getStoryBySlug(slug: string) {
  const db = getDB();

  const story = await db
    .prepare(`
      SELECT
        s.*,
        d.slug AS destination_slug,
        d.country AS destination_country,
        d.name AS destination_name
      FROM stories s
      LEFT JOIN destinations d
        ON d.id = s.destination_id
      WHERE s.slug = ?
        AND s.published = 1
      LIMIT 1
    `)
    .bind(slug)
    .first();

  if (!story) {
    return null;
  }

  const blocks = await db
    .prepare(`
      SELECT
        id,
        type,
        sort_order,
        eyebrow,
        title,
        body,
        media_id,
        gallery_title
      FROM story_blocks
      WHERE story_id = ?
      ORDER BY sort_order ASC
    `)
    .bind(story.id)
    .all();

  const blockRows = blocks.results ?? [];

  const blocksWithMedia = await Promise.all(
    blockRows.map(async (block) => {
      const media = await db
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
          INNER JOIN media m
            ON m.id = sbm.media_id
          WHERE sbm.block_id = ?
          ORDER BY sbm.sort_order ASC
        `)
        .bind(block.id)
        .all();

      return {
        ...block,
        media: media.results ?? [],
      };
    })
  );

  const galleryCta = await db
    .prepare(`
      SELECT
        enabled,
        label,
        collection_id,
        custom_url
      FROM story_gallery_cta
      WHERE story_id = ?
      LIMIT 1
    `)
    .bind(story.id)
    .first();

  return {
    ...story,
    blocks: blocksWithMedia,
    galleryCta: galleryCta ?? null,
  };
}
