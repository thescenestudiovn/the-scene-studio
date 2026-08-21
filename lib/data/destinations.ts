import { getDB } from "../db";

export type Destination = {
  id: string;
  country: string;
  country_name: string;
  slug: string;
  name: string;
  region: string | null;
  seo_title: string | null;
  seo_description: string | null;
  description: string | null;
  intro_title: string | null;
  intro_text: string | null;
};

export async function getDestinations(): Promise<Destination[]> {
  const db = getDB();

  const result = await db
    .prepare(
      `
      SELECT
        id,
        country,
        country_name,
        slug,
        name,
        region,
        seo_title,
        seo_description,
        description,
        intro_title,
        intro_text
      FROM destinations
      ORDER BY country, name
      `
    )
    .all<Destination>();

  return result.results;
}

export async function getDestinationBySlug(
  country: string,
  slug: string
): Promise<Destination | null> {
  const db = getDB();

  const result = await db
    .prepare(
      `
      SELECT
        id,
        country,
        country_name,
        slug,
        name,
        region,
        seo_title,
        seo_description,
        description,
        intro_title,
        intro_text
      FROM destinations
      WHERE country = ? AND slug = ?
      LIMIT 1
      `
    )
    .bind(country, slug)
    .first<Destination>();

  return result ?? null;
}
