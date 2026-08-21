import { getDB } from "../db";
import type { Story } from "./stories";

export type StoryPageMedia = {
  id: string;
  collection_id: string | null;
  type: string;
  path: string;
  filename: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
};

export type StoryPageDestination = {
  id: string;
  country: string;
  country_name: string;
  slug: string;
  name: string;
  region: string | null;
};

export type StoryPageBlock = {
  id: string;
  story_id: string;
  type: string;
  sort_order: number;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  media_id: string | null;
  gallery_title: string | null;
  media: StoryPageMedia[];
};

export type StoryPageGalleryCTA = {
  enabled: number;
  label: string;
  collection_id: string | null;
  custom_url: string | null;
};

export type StoryPageData = {
  story: Story;
  destination: StoryPageDestination | null;
  cover: StoryPageMedia | null;
  blocks: StoryPageBlock[];
  galleryCta: StoryPageGalleryCTA | null;
};

export async function getStoryPageData(
  slug: string
): Promise<StoryPageData | null> {
  const db = getDB();

  // --------------------------------------------------
  // STORY
  // --------------------------------------------------

  const story = await db
    .prepare(
      `
      SELECT
        id,
        slug,
        title,
        location,
        date,
        category,
        seo_title,
        seo_description,
        description,
        cover_media_id,
        destination_id,
        published,
        created_at,
        updated_at
      FROM stories
      WHERE slug = ? AND published = 1
      LIMIT 1
      `
    )
    .bind(slug)
    .first<Story>();

  if (!story) {
    return null;
  }

  // --------------------------------------------------
  // DESTINATION
  // --------------------------------------------------

  let destination: StoryPageDestination | null = null;

  if (story.destination_id) {
    destination =
      await db
        .prepare(
          `
          SELECT
            id,
            country,
            country_name,
            slug,
            name,
            region
          FROM destinations
          WHERE id = ?
          LIMIT 1
          `
        )
        .bind(story.destination_id)
        .first<StoryPageDestination>() ?? null;
  }

  // --------------------------------------------------
  // COVER
  // --------------------------------------------------

  let cover: StoryPageMedia | null = null;

  if (story.cover_media_id) {
    cover =
      await db
        .prepare(
          `
          SELECT
            id,
            collection_id,
            type,
            path,
            filename,
            alt,
            width,
            height,
            sort_order
          FROM media
          WHERE id = ?
          LIMIT 1
          `
        )
        .bind(story.cover_media_id)
        .first<StoryPageMedia>() ?? null;
  }

  // --------------------------------------------------
  // BLOCKS
  // --------------------------------------------------

  const blockResult = await db
    .prepare(
      `
      SELECT
        id,
        story_id,
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
      `
    )
    .bind(story.id)
    .all<Omit<StoryPageBlock, "media">>();

  const blocks = await Promise.all(
    blockResult.results.map(async (block) => {
      const mediaResult = await db
        .prepare(
          `
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
          `
        )
        .bind(block.id)
        .all<StoryPageMedia>();

      return {
        ...block,
        media: mediaResult.results,
      };
    })
  );

  // --------------------------------------------------
  // GALLERY CTA
  // --------------------------------------------------

  const galleryCta =
    await db
      .prepare(
        `
        SELECT
          enabled,
          label,
          collection_id,
          custom_url
        FROM story_gallery_cta
        WHERE story_id = ?
        LIMIT 1
        `
      )
      .bind(story.id)
      .first<StoryPageGalleryCTA>() ?? null;

  // --------------------------------------------------
  // FINAL OBJECT
  // --------------------------------------------------

  return {
    story,
    destination,
    cover,
    blocks,
    galleryCta,
  };
}
