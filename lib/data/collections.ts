import { getDB } from "../db";

export type Collection = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  destination_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CollectionMedia = {
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

export async function getCollections(): Promise<Collection[]> {
  const db = getDB();

  const result = await db
    .prepare(
      `
      SELECT
        id,
        title,
        slug,
        description,
        destination_id,
        created_at,
        updated_at
      FROM collections
      ORDER BY created_at DESC
      `
    )
    .all<Collection>();

  return result.results;
}

export async function getCollectionBySlug(
  slug: string
): Promise<Collection | null> {
  const db = getDB();

  const result = await db
    .prepare(
      `
      SELECT
        id,
        title,
        slug,
        description,
        destination_id,
        created_at,
        updated_at
      FROM collections
      WHERE slug = ?
      LIMIT 1
      `
    )
    .bind(slug)
    .first<Collection>();

  return result ?? null;
}

export async function getCollectionMedia(
  collectionId: string
): Promise<CollectionMedia[]> {
  const db = getDB();

  const result = await db
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
      WHERE collection_id = ?
      ORDER BY sort_order ASC, created_at ASC
      `
    )
    .bind(collectionId)
    .all<CollectionMedia>();

  return result.results;
}
