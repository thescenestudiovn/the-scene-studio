import { getDB } from "../../../../lib/db";

export async function GET(request: Request) {
  try {
    const db = getDB();
    const url = new URL(request.url);
    const collectionId = url.searchParams.get("collection_id");
    const query = collectionId
      ? `SELECT m.id,m.collection_id,m.type,m.path,m.filename,m.alt,m.width,m.height,m.sort_order,m.created_at,c.title AS collection_title FROM media m LEFT JOIN collections c ON c.id=m.collection_id WHERE m.collection_id=? ORDER BY m.sort_order ASC,m.created_at ASC`
      : `SELECT m.id,m.collection_id,m.type,m.path,m.filename,m.alt,m.width,m.height,m.sort_order,m.created_at,c.title AS collection_title FROM media m LEFT JOIN collections c ON c.id=m.collection_id ORDER BY m.created_at DESC,m.sort_order ASC`;
    const result = collectionId ? await db.prepare(query).bind(collectionId).all() : await db.prepare(query).all();
    return Response.json({ success: true, media: result.results });
  } catch (error) {
    console.error("GET /api/admin/media error:", error);
    return Response.json({ success: false, error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { collection_id?: string | null; type?: string; path?: string; filename?: string | null; alt?: string | null; width?: number | null; height?: number | null; sort_order?: number };
    if (!body.path) return Response.json({ success: false, error: "path is required" }, { status: 400 });
    const db = getDB(); const id = crypto.randomUUID();
    await db.prepare(`INSERT INTO media (id,collection_id,type,path,filename,alt,width,height,sort_order) VALUES (?,?,?,?,?,?,?,?,?)`).bind(id, body.collection_id || null, body.type || "image", body.path, body.filename || null, body.alt || null, body.width || null, body.height || null, body.sort_order || 0).run();
    const media = await db.prepare(`SELECT id,collection_id,type,path,filename,alt,width,height,sort_order,created_at FROM media WHERE id=?`).bind(id).first();
    return Response.json({ success: true, media });
  } catch (error) {
    console.error("POST /api/admin/media error:", error);
    return Response.json({ success: false, error: "Failed to create media" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; collection_id?: string | null; type?: string; path?: string; filename?: string | null; alt?: string | null; width?: number | null; height?: number | null; sort_order?: number };
    if (!body.id || !body.path) return Response.json({ success: false, error: "id and path are required" }, { status: 400 });
    const db = getDB();
    const result = await db.prepare(`UPDATE media SET collection_id=?,type=?,path=?,filename=?,alt=?,width=?,height=?,sort_order=? WHERE id=?`).bind(body.collection_id || null, body.type || "image", body.path, body.filename || null, body.alt || null, body.width || null, body.height || null, body.sort_order || 0, body.id).run();
    if (!result.meta.changes) return Response.json({ success: false, error: "Media not found" }, { status: 404 });
    const media = await db.prepare(`SELECT id,collection_id,type,path,filename,alt,width,height,sort_order,created_at FROM media WHERE id=?`).bind(body.id).first();
    return Response.json({ success: true, media });
  } catch (error) {
    console.error("PATCH /api/admin/media error:", error);
    return Response.json({ success: false, error: "Failed to update media" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) return Response.json({ success: false, error: "id is required" }, { status: 400 });
    const db = getDB(); const result = await db.prepare("DELETE FROM media WHERE id=?").bind(id).run();
    if (!result.meta.changes) return Response.json({ success: false, error: "Media not found" }, { status: 404 });
    return Response.json({ success: true, deleted: id });
  } catch (error) {
    console.error("DELETE /api/admin/media error:", error);
    return Response.json({ success: false, error: "Failed to delete media" }, { status: 500 });
  }
}
