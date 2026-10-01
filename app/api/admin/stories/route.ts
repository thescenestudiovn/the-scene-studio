import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "../../../../lib/db";

type CreateStoryBody = {
  title?: string;
  slug?: string;
  date?: string | null;
  description?: string | null;
  destination?: string | null;
  destination_id?: string | null;
  category_ids?: string[];
  location_ids?: string[];
};

type TaxonomyTable = "story_categories" | "locations";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function pendingName(id: string) {
  if (!id.startsWith("__new__")) return null;
  try { return decodeURIComponent(id.slice("__new__".length)).trim() || null; }
  catch { return null; }
}

async function resolveTaxonomyIds(db: ReturnType<typeof getDB>, table: TaxonomyTable, requestedIds: string[]) {
  const resolvedIds: string[] = [];
  for (const requestedId of requestedIds) {
    const name = pendingName(requestedId);
    if (!name) {
      const existing = await db.prepare(`SELECT id FROM ${table} WHERE id=? LIMIT 1`).bind(requestedId).first<{ id: string }>();
      if (existing) resolvedIds.push(existing.id);
      continue;
    }

    const existing = await db.prepare(`SELECT id FROM ${table} WHERE lower(name)=lower(?) LIMIT 1`).bind(name).first<{ id: string }>();
    if (existing) { resolvedIds.push(existing.id); continue; }

    const baseSlug = slugify(name) || "entry";
    let slug = baseSlug;
    let suffix = 2;
    while (await db.prepare(`SELECT id FROM ${table} WHERE lower(slug)=lower(?) LIMIT 1`).bind(slug).first<{ id: string }>()) slug = `${baseSlug}-${suffix++}`;
    const id = crypto.randomUUID();
    await db.prepare(`INSERT INTO ${table} (id,name,slug) VALUES (?,?,?)`).bind(id, name, slug).run();
    resolvedIds.push(id);
  }
  return resolvedIds;
}

export async function GET(request: Request) {
  try {
    const db = getDB();
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug")?.trim();
    const excludeId = url.searchParams.get("exclude_id")?.trim();

    if (slug) {
      const duplicate = excludeId
        ? await db.prepare(`SELECT id FROM stories WHERE lower(slug)=lower(?) AND id!=? LIMIT 1`).bind(slug, excludeId).first<{ id: string }>()
        : await db.prepare(`SELECT id FROM stories WHERE lower(slug)=lower(?) LIMIT 1`).bind(slug).first<{ id: string }>();
      return Response.json({ success: true, available: !duplicate });
    }

    const result = await db.prepare(`
      SELECT
        s.id,s.slug,s.title,s.location,s.date,s.category,s.description,s.destination_id,
        s.cover_media_id,
        s.published,s.created_at,s.updated_at,
        COALESCE(d.name, s.location) AS destination_name,d.country AS destination_country,
        m.path AS cover_path,
        m.filename AS cover_filename,
        (SELECT COUNT(*) FROM story_blocks sb WHERE sb.story_id=s.id) AS block_count,
        (SELECT COUNT(*) FROM story_block_media sbm JOIN story_blocks sb ON sb.id=sbm.block_id WHERE sb.story_id=s.id) AS image_count,
        COALESCE((SELECT GROUP_CONCAT(c.name, ', ') FROM story_category_relations scr JOIN story_categories c ON c.id=scr.category_id WHERE scr.story_id=s.id), s.category) AS categories,
        COALESCE((SELECT GROUP_CONCAT(l.name, ', ') FROM story_location_relations slr JOIN locations l ON l.id=slr.location_id WHERE slr.story_id=s.id), s.location) AS locations
      FROM stories s
      LEFT JOIN destinations d ON d.id=s.destination_id
      LEFT JOIN media m ON m.id=s.cover_media_id
      ORDER BY s.created_at DESC
    `).all();
    return Response.json({ success: true, stories: result.results });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: "Failed to fetch stories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateStoryBody;
    const title = body.title?.trim();
    const slug = body.slug?.trim();
    const categoryIds = Array.from(new Set(body.category_ids ?? [])).filter(Boolean);
    const locationIds = Array.from(new Set(body.location_ids ?? [])).filter(Boolean);

    if (!title || !slug) return Response.json({ success: false, error: "title and slug are required", field: "slug" }, { status: 400 });

    const db = getDB();
    const duplicate = await db.prepare(`SELECT id FROM stories WHERE lower(slug)=lower(?) LIMIT 1`).bind(slug).first<{ id: string }>();
    if (duplicate) return Response.json({ success: false, error: "This slug is already in use.", field: "slug", code: "SLUG_EXISTS" }, { status: 409 });

    const resolvedCategoryIds = await resolveTaxonomyIds(db, "story_categories", categoryIds);
    const resolvedLocationIds = await resolveTaxonomyIds(db, "locations", locationIds);
    const id = crypto.randomUUID();
    const firstCategory = resolvedCategoryIds[0] ? await db.prepare(`SELECT name FROM story_categories WHERE id=? LIMIT 1`).bind(resolvedCategoryIds[0]).first<{ name: string }>() : null;
    const firstLocation = resolvedLocationIds[0] ? await db.prepare(`SELECT name FROM locations WHERE id=? LIMIT 1`).bind(resolvedLocationIds[0]).first<{ name: string }>() : null;
    const destination = body.destination_id ? await db.prepare(`SELECT name FROM destinations WHERE id=? LIMIT 1`).bind(body.destination_id).first<{ name: string }>() : null;

    await db.prepare(`INSERT INTO stories (id,slug,title,location,date,category,description,destination_id,published) VALUES (?,?,?,?,?,?,?,?,0)`).bind(id, slug, title, destination?.name || firstLocation?.name || body.destination?.trim() || null, body.date ?? null, firstCategory?.name ?? null, body.description?.trim() || null, body.destination_id || null).run();
    for (const categoryId of resolvedCategoryIds) await db.prepare(`INSERT OR IGNORE INTO story_category_relations (story_id, category_id) VALUES (?,?)`).bind(id, categoryId).run();
    for (const locationId of resolvedLocationIds) await db.prepare(`INSERT OR IGNORE INTO story_location_relations (story_id, location_id) VALUES (?,?)`).bind(id, locationId).run();
    const story = await db.prepare(`SELECT * FROM stories WHERE id=? LIMIT 1`).bind(id).first();
    return Response.json({ success: true, story });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: "Failed to create story" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) return Response.json({ success: false, error: "id is required" }, { status: 400 });
    const db = getDB();
    const story = await db.prepare(`SELECT id, cover_media_id FROM stories WHERE id=? LIMIT 1`).bind(body.id).first<{ id: string; cover_media_id: string | null }>();
    if (!story) return Response.json({ success: false, error: "Story not found" }, { status: 404 });
    const mediaRows = await db.prepare(`SELECT DISTINCT m.id, m.path, m.collection_id FROM media m WHERE m.id = ? OR m.id IN (SELECT media_id FROM story_blocks WHERE story_id=? AND media_id IS NOT NULL) OR m.id IN (SELECT sbm.media_id FROM story_block_media sbm JOIN story_blocks sb ON sb.id=sbm.block_id WHERE sb.story_id=?)`).bind(body.id, body.id, body.id).all<{ id: string; path: string; collection_id: string | null }>();
    await db.prepare(`DELETE FROM stories WHERE id=?`).bind(body.id).run();
    const orphanMedia: { id: string; path: string }[] = [];
    for (const media of mediaRows.results) {
      if (media.collection_id) continue;
      const usage = await db.prepare(`SELECT (SELECT COUNT(*) FROM stories WHERE cover_media_id=?) + (SELECT COUNT(*) FROM story_blocks WHERE media_id=?) + (SELECT COUNT(*) FROM story_block_media WHERE media_id=?) AS count`).bind(media.id, media.id, media.id).first<{ count: number }>();
      if ((usage?.count ?? 0) === 0) { await db.prepare(`DELETE FROM media WHERE id=?`).bind(media.id).run(); orphanMedia.push({ id: media.id, path: media.path }); }
    }
    const categoryCleanup = await db.prepare(`DELETE FROM story_categories
      WHERE NOT EXISTS (SELECT 1 FROM story_category_relations r WHERE r.category_id=story_categories.id)
      AND NOT EXISTS (SELECT 1 FROM stories s WHERE lower(trim(s.category))=lower(story_categories.name))`).run();
    const locationCleanup = await db.prepare(`DELETE FROM locations
      WHERE NOT EXISTS (SELECT 1 FROM story_location_relations r WHERE r.location_id=locations.id)
      AND NOT EXISTS (SELECT 1 FROM stories s WHERE lower(trim(s.location))=lower(locations.name))`).run();
    const destinationCleanup = await db.prepare(`DELETE FROM destinations
      WHERE NOT EXISTS (SELECT 1 FROM stories s WHERE s.destination_id=destinations.id)
      AND NOT EXISTS (SELECT 1 FROM collections c WHERE c.destination_id=destinations.id)
      AND NOT EXISTS (SELECT 1 FROM films f WHERE f.destination_id=destinations.id)
      AND NOT EXISTS (SELECT 1 FROM story_destinations sd WHERE sd.destination_id=destinations.id)`).run();
    if (orphanMedia.length) { const { env } = getCloudflareContext(); await Promise.all(orphanMedia.filter((media) => media.path).map((media) => env.MEDIA_BUCKET.delete(media.path))); }
    return Response.json({ success: true, deleted: body.id, deletedMedia: orphanMedia.length, cleanedCategories: categoryCleanup.meta.changes, cleanedLocations: locationCleanup.meta.changes, cleanedDestinations: destinationCleanup.meta.changes });
  } catch (error) {
    console.error("DELETE /api/admin/stories error:", error);
    return Response.json({ success: false, error: "Failed to delete story" }, { status: 500 });
  }
}