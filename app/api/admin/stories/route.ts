import { getDB } from "../../../../lib/db";

type CreateStoryBody = {
  title?: string;
  slug?: string;
  date?: string | null;
  description?: string | null;
  destination_id?: string | null;
  category_ids?: string[];
  location_ids?: string[];
};

export async function GET() {
  try {
    const db = getDB();
    const result = await db.prepare(`
      SELECT
        s.id,s.slug,s.title,s.location,s.date,s.category,s.description,s.destination_id,
        s.published,s.created_at,s.updated_at,
        d.name AS destination_name,d.country AS destination_country,
        COALESCE((SELECT GROUP_CONCAT(c.name, ', ') FROM story_category_relations scr JOIN story_categories c ON c.id=scr.category_id WHERE scr.story_id=s.id), s.category) AS categories,
        COALESCE((SELECT GROUP_CONCAT(l.name, ', ') FROM story_location_relations slr JOIN locations l ON l.id=slr.location_id WHERE slr.story_id=s.id), s.location) AS locations
      FROM stories s
      LEFT JOIN destinations d ON d.id=s.destination_id
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

    if (!title || !slug) return Response.json({ success: false, error: "title and slug are required" }, { status: 400 });

    const db = getDB();
    const id = crypto.randomUUID();

    const firstCategory = categoryIds[0]
      ? await db.prepare(`SELECT name FROM story_categories WHERE id=? LIMIT 1`).bind(categoryIds[0]).first<{ name: string }>()
      : null;
    const firstLocation = locationIds[0]
      ? await db.prepare(`SELECT name FROM locations WHERE id=? LIMIT 1`).bind(locationIds[0]).first<{ name: string }>()
      : null;

    await db.prepare(`
      INSERT INTO stories (id,slug,title,location,date,category,description,destination_id,published)
      VALUES (?,?,?,?,?,?,?,?,0)
    `).bind(
      id,
      slug,
      title,
      firstLocation?.name ?? null,
      body.date ?? null,
      firstCategory?.name ?? null,
      body.description?.trim() || null,
      body.destination_id || null,
    ).run();

    for (const categoryId of categoryIds) {
      await db.prepare(`INSERT OR IGNORE INTO story_category_relations (story_id, category_id) VALUES (?,?)`).bind(id, categoryId).run();
    }
    for (const locationId of locationIds) {
      await db.prepare(`INSERT OR IGNORE INTO story_location_relations (story_id, location_id) VALUES (?,?)`).bind(id, locationId).run();
    }

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
    const result = await db.prepare(`DELETE FROM stories WHERE id=?`).bind(body.id).run();
    if (!result.meta.changes) return Response.json({ success: false, error: "Story not found" }, { status: 404 });
    return Response.json({ success: true, deleted: body.id });
  } catch (error) {
    console.error("DELETE /api/admin/stories error:", error);
    return Response.json({ success: false, error: "Failed to delete story" }, { status: 500 });
  }
}
