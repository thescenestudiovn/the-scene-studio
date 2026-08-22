import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "../../../../lib/db";

type CollectionPayload = {
  id?: string; title?: string; slug?: string; description?: string | null; destination_id?: string | null;
  client_name?: string | null; event_date?: string | null; seo_title?: string | null; seo_description?: string | null;
  published?: number | boolean; cover_media_id?: string | null;
};

const fields = `c.id, c.title, c.slug, c.description, c.destination_id, c.client_name, c.event_date,
  c.seo_title, c.seo_description, c.published, c.cover_media_id, c.created_at, c.updated_at,
  d.name AS destination_name, d.country AS destination_country,
  (SELECT COUNT(*) FROM media m WHERE m.collection_id = c.id) AS media_count,
  (SELECT m.path FROM media m WHERE m.id = c.cover_media_id) AS cover_path`;

export async function GET() {
  try {
    const db = getDB();
    const result = await db.prepare(`SELECT ${fields} FROM collections c LEFT JOIN destinations d ON d.id = c.destination_id ORDER BY c.created_at DESC`).all();
    return Response.json({ success: true, collections: result.results });
  } catch (error) {
    console.error("GET /api/admin/collections error:", error);
    return Response.json({ success: false, error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CollectionPayload;
    if (!body.title?.trim() || !body.slug?.trim()) return Response.json({ success: false, error: "title and slug are required" }, { status: 400 });
    const db = getDB(); const id = crypto.randomUUID();
    await db.prepare(`INSERT INTO collections (id,title,slug,description,destination_id,client_name,event_date,seo_title,seo_description,published,cover_media_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id, body.title.trim(), body.slug.trim(), body.description || null, body.destination_id || null, body.client_name || null, body.event_date || null, body.seo_title || null, body.seo_description || null, body.published === false ? 0 : 1, body.cover_media_id || null).run();
    const collection = await db.prepare(`SELECT ${fields} FROM collections c LEFT JOIN destinations d ON d.id = c.destination_id WHERE c.id = ?`).bind(id).first();
    return Response.json({ success: true, collection });
  } catch (error) {
    console.error("POST /api/admin/collections error:", error);
    return Response.json({ success: false, error: "Failed to create collection" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as CollectionPayload;
    if (!body.id || !body.title?.trim() || !body.slug?.trim()) return Response.json({ success: false, error: "id, title and slug are required" }, { status: 400 });
    const db = getDB();
    const result = await db.prepare(`UPDATE collections SET title=?,slug=?,description=?,destination_id=?,client_name=?,event_date=?,seo_title=?,seo_description=?,published=?,cover_media_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(body.title.trim(), body.slug.trim(), body.description || null, body.destination_id || null, body.client_name || null, body.event_date || null, body.seo_title || null, body.seo_description || null, body.published === false ? 0 : 1, body.cover_media_id || null, body.id).run();
    if (!result.meta.changes) return Response.json({ success: false, error: "Collection not found" }, { status: 404 });
    const collection = await db.prepare(`SELECT ${fields} FROM collections c LEFT JOIN destinations d ON d.id = c.destination_id WHERE c.id = ?`).bind(body.id).first();
    return Response.json({ success: true, collection });
  } catch (error) {
    console.error("PATCH /api/admin/collections error:", error);
    return Response.json({ success: false, error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    let id = url.searchParams.get("id");
    if (!id) {
      try { id = ((await request.json()) as { id?: string }).id ?? null; } catch { /* query-string form is also supported */ }
    }
    if (!id) return Response.json({ success: false, error: "id is required" }, { status: 400 });

    const db = getDB();
    const collection = await db.prepare("SELECT id FROM collections WHERE id=?").bind(id).first<{ id: string }>();
    if (!collection) return Response.json({ success: false, error: "Collection not found" }, { status: 404 });

    const media = await db.prepare("SELECT id, path FROM media WHERE collection_id=?").bind(id).all<{ id: string; path: string }>();

    try {
      const { env } = await getCloudflareContext({ async: true });
      const bucket = (env as unknown as { MEDIA_BUCKET?: R2Bucket }).MEDIA_BUCKET;
      if (bucket) {
        for (const item of media.results) {
          if (!item.path) continue;
          try {
            const parsed = new URL(item.path);
            const key = parsed.pathname.replace(/^\//, "");
            if (key) await bucket.delete(key);
          } catch (storageError) { console.error(`Failed to delete R2 object for ${item.id}:`, storageError); }
        }
      }
    } catch (storageError) { console.error("Failed to access R2 while deleting collection:", storageError); }

    // Remove dependent records before deleting the collection.
    await db.prepare("DELETE FROM story_block_media WHERE media_id IN (SELECT id FROM media WHERE collection_id=?)").bind(id).run();
    await db.prepare("DELETE FROM media WHERE collection_id=?").bind(id).run();
    await db.prepare("DELETE FROM story_gallery_cta WHERE collection_id=?").bind(id).run();
    await db.prepare("DELETE FROM collections WHERE id=?").bind(id).run();

    return Response.json({ success: true, deleted: id, deleted_media: media.results.length });
  } catch (error) {
    console.error("DELETE /api/admin/collections error:", error);
    return Response.json({ success: false, error: "Failed to delete collection" }, { status: 500 });
  }
}
