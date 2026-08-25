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
    const result = await db.prepare(`SELECT id, name, slug, city, country, created_at, updated_at FROM locations ORDER BY name ASC`).all();
    return Response.json({ success: true, locations: result.results });
  } catch (error) {
    console.error("GET /api/admin/locations error:", error);
    return Response.json({ success: false, error: "Failed to fetch locations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; city?: string | null; country?: string | null };
    const name = body.name?.trim();
    if (!name) return Response.json({ success: false, error: "name is required" }, { status: 400 });

    const db = getDB();
    const existing = await db.prepare(`SELECT id, name, slug, city, country FROM locations WHERE lower(name) = lower(?) LIMIT 1`).bind(name).first<{ id: string; name: string; slug: string; city: string | null; country: string | null }>();
    if (existing) return Response.json({ success: true, location: existing, existing: true });

    // New locations are virtual until the Story is saved. The Story PATCH
    // endpoint recognizes this id format and creates the location then.
    const id = `__new__${encodeURIComponent(name)}`;
    return Response.json({ success: true, location: { id, name, slug: slugify(name), city: body.city?.trim() || null, country: body.country?.trim() || null }, existing: false, pending: true });
  } catch (error) {
    console.error("POST /api/admin/locations error:", error);
    return Response.json({ success: false, error: "Failed to prepare location" }, { status: 500 });
  }
}
