import { getDB } from "../db";

export type Film = {
  id: string;
  title: string;
  location: string | null;
  youtube_url: string;
  story_id: string | null;
  destination_id: string | null;
  published: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export async function getFilms(): Promise<Film[]> {
  const db = getDB();

  const result = await db
    .prepare(
      `
      SELECT
        id,
        title,
        location,
        youtube_url,
        story_id,
        destination_id,
        published,
        sort_order,
        created_at,
        updated_at
      FROM films
      WHERE published = 1
      ORDER BY sort_order ASC, created_at DESC
      `
    )
    .all<Film>();

  return result.results;
}

export async function getFilmById(
  id: string
): Promise<Film | null> {
  const db = getDB();

  const result = await db
    .prepare(
      `
      SELECT
        id,
        title,
        location,
        youtube_url,
        story_id,
        destination_id,
        published,
        sort_order,
        created_at,
        updated_at
      FROM films
      WHERE id = ? AND published = 1
      LIMIT 1
      `
    )
    .bind(id)
    .first<Film>();

  return result ?? null;
}
