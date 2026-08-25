import { getDB } from "../../../../lib/db";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const db = getDB();
    const result = await db.prepare(`SELECT id, name, slug, created_at, updated_at FROM story_categories ORDER BY name ASC`).all();
    return Response.json({ success: true, categories: result.results });
  } catch (error) {
    console.error("GET /api/admin/story-categories error:", error);
    return Response.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string };
    const name = body.name?.trim();
    if (!name) return Response.json({ success: false, error: "name is required" }, { status: 400 });

    const db = getDB();
    const existing = await db.prepare(`SELECT id, name, slug FROM story_categories WHERE lower(name) = lower(?) LIMIT 1`).bind(name).first<{ id: string; name: string; slug: string }>();
    if (existing) return Response.json({ success: true, category: existing, existing: true });

    // New categories are intentionally NOT persisted here. The editor keeps this
    // virtual category in local state and sends it with the Story update. The
    // Story PATCH endpoint creates the category only when the Story is saved.
    const id = `__new__${encodeURIComponent(name)}`;
    return Response.json({ success: true, category: { id, name, slug: slugify(name) }, existing: false, pending: true });
  } catch (error) {
    console.error("POST /api/admin/story-categories error:", error);
    return Response.json({ success: false, error: "Failed to prepare category" }, { status: 500 });
  }
}
