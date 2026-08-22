import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "../../../../lib/db";

type MediaPayload = { id?: string; collection_id?: string | null; type?: string; path?: string; filename?: string | null; alt?: string | null; width?: number | null; height?: number | null; sort_order?: number };

export async function GET(request: Request) {
  try {
    const db = getDB(); const url = new URL(request.url); const collectionId = url.searchParams.get("collection_id");
    const query = collectionId ? `SELECT m.id,m.collection_id,m.type,m.path,m.filename,m.alt,m.width,m.height,m.sort_order,m.created_at,c.title AS collection_title FROM media m LEFT JOIN collections c ON c.id=m.collection_id WHERE m.collection_id=? ORDER BY m.sort_order ASC,m.created_at ASC` : `SELECT m.id,m.collection_id,m.type,m.path,m.filename,m.alt,m.width,m.height,m.sort_order,m.created_at,c.title AS collection_title FROM media m LEFT JOIN collections c ON c.id=m.collection_id ORDER BY m.created_at DESC,m.sort_order ASC`;
    const result = collectionId ? await db.prepare(query).bind(collectionId).all() : await db.prepare(query).all();
    return Response.json({ success: true, media: result.results });
  } catch (error) { console.error("GET /api/admin/media error:", error); return Response.json({ success: false, error: "Failed to fetch media" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MediaPayload;
    if (!body.path) return Response.json({ success: false, error: "path is required" }, { status: 400 });
    const db = getDB(); const id = crypto.randomUUID();
    await db.prepare(`INSERT INTO media (id,collection_id,type,path,filename,alt,width,height,sort_order) VALUES (?,?,?,?,?,?,?,?,?)`).bind(id, body.collection_id || null, body.type || "image", body.path, body.filename || null, body.alt || null, body.width ?? null, body.height ?? null, body.sort_order ?? 0).run();
    const media = await db.prepare(`SELECT id,collection_id,type,path,filename,alt,width,height,sort_order,created_at FROM media WHERE id=?`).bind(id).first();
    return Response.json({ success: true, media });
  } catch (error) { console.error("POST /api/admin/media error:", error); return Response.json({ success: false, error: "Failed to create media" }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as MediaPayload & { items?: Array<{ id: string; sort_order: number }> };
    const db = getDB();
    if (Array.isArray(body.items)) {
      const items = body.items.filter(item => item?.id && Number.isInteger(item.sort_order));
      if (!items.length) return Response.json({ success: false, error: "items are required" }, { status: 400 });
      await db.batch(items.map(item => db.prepare("UPDATE media SET sort_order=? WHERE id=?").bind(item.sort_order, item.id)));
      return Response.json({ success: true, reordered: items.length });
    }
    if (!body.id || !body.path) return Response.json({ success: false, error: "id and path are required" }, { status: 400 });
    const result = await db.prepare(`UPDATE media SET collection_id=?,type=?,path=?,filename=?,alt=?,width=?,height=?,sort_order=? WHERE id=?`).bind(body.collection_id || null, body.type || "image", body.path, body.filename || null, body.alt || null, body.width ?? null, body.height ?? null, body.sort_order ?? 0, body.id).run();
    if (!result.meta.changes) return Response.json({ success: false, error: "Media not found" }, { status: 404 });
    return Response.json({ success: true, media: await db.prepare(`SELECT id,collection_id,type,path,filename,alt,width,height,sort_order,created_at FROM media WHERE id=?`).bind(body.id).first() });
  } catch (error) { console.error("PATCH /api/admin/media error:", error); return Response.json({ success: false, error: "Failed to update media" }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; ids?: string[] };
    const ids = Array.isArray(body.ids) ? [...new Set(body.ids.filter(Boolean))] : body.id ? [body.id] : [];
    if (!ids.length) return Response.json({ success: false, error: "id or ids is required" }, { status: 400 });
    const db = getDB(); const placeholders = ids.map(() => "?").join(",");
    const media = await db.prepare(`SELECT id,path FROM media WHERE id IN (${placeholders})`).bind(...ids).all<{ id: string; path: string }>();
    if (!media.results.length) return Response.json({ success: false, error: "Media not found" }, { status: 404 });
    try {
      const { env } = await getCloudflareContext({ async: true }); const bucket = (env as unknown as { MEDIA_BUCKET?: R2Bucket }).MEDIA_BUCKET;
      if (bucket) await Promise.all(media.results.map(async item => { if (!item.path) return; try { const key = new URL(item.path).pathname.replace(/^\//, ""); if (key) await bucket.delete(key); } catch (e) { console.error(`Failed to delete R2 object ${item.id}:`, e); } }));
    } catch (e) { console.error("Failed to access R2; continuing with DB deletion:", e); }
    await db.prepare(`DELETE FROM story_block_media WHERE media_id IN (${placeholders})`).bind(...ids).run();
    await db.prepare(`UPDATE collections SET cover_media_id=NULL,updated_at=CURRENT_TIMESTAMP WHERE cover_media_id IN (${placeholders})`).bind(...ids).run();
    await db.prepare(`DELETE FROM media WHERE id IN (${placeholders})`).bind(...ids).run();
    return Response.json({ success: true, deleted: media.results.map(item => item.id) });
  } catch (error) { console.error("DELETE /api/admin/media error:", error); return Response.json({ success: false, error: "Failed to delete media" }, { status: 500 }); }
}
