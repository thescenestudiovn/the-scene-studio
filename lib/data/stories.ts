import { getDB } from "../db";

export type Story = {
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
  published: number;
  created_at: string;
  updated_at: string;
};

export type StoryBlock = {
  id: string;
  story_id: string;
  type: string;
  sort_order: number;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  media_id: string | null;
  gallery_title: string | null;
  created_at: string;
  updated_at: string;
};

export type StoryBlockMedia = {
  block_id: string;
  media_id: string;
  sort_order: number;
};

export type StoryGalleryCTA = {
  story_id: string;
  enabled: number;
  label: string;
  collection_id: string | null;
  custom_url: string | null;
};

export async function getStories(): Promise<Story[]> {
  const db = getDB();

  const result = await db
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
      WHERE published = 1
      ORDER BY created_at DESC
      `
    )
    .all<Story>();

  return result.results;
}

export async function getStoryBySlug(
  slug: string
): Promise<Story | null> {
  const db = getDB();

  const result = await db
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

  return result ?? null;
}

export async function getStoryBlocks(
  storyId: string
): Promise<StoryBlock[]> {
  const db = getDB();

  const result = await db
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
        gallery_title,
        created_at,
        updated_at
      FROM story_blocks
      WHERE story_id = ?
      ORDER BY sort_order ASC
      `
    )
    .bind(storyId)
    .all<StoryBlock>();

  return result.results;
}

export async function getStoryBlockMedia(
  blockId: string
): Promise<StoryBlockMedia[]> {
  const db = getDB();

  const result = await db
    .prepare(
      `
      SELECT
        block_id,
        media_id,
        sort_order
      FROM story_block_media
      WHERE block_id = ?
      ORDER BY sort_order ASC
      `
    )
    .bind(blockId)
    .all<StoryBlockMedia>();

  return result.results;
}

export async function getStoryGalleryCTA(
  storyId: string
): Promise<StoryGalleryCTA | null> {
  const db = getDB();

  const result = await db
    .prepare(
      `
      SELECT
        story_id,
        enabled,
        label,
        collection_id,
        custom_url
      FROM story_gallery_cta
      WHERE story_id = ?
      LIMIT 1
      `
    )
    .bind(storyId)
    .first<StoryGalleryCTA>();

  return result ?? null;
}
