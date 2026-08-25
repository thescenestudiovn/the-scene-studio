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

    const id = crypto.randomUUID();
    const slug = slugify(name);
    await db.prepare(`INSERT INTO story_categories (id, name, slug) VALUES (?, ?, ?)`).bind(id, name, slug).run();
    return Response.json({ success: true, category: { id, name, slug }, existing: false });
  } catch (error) {
    console.error("POST /api/admin/story-categories error:", error);
    return Response.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}
