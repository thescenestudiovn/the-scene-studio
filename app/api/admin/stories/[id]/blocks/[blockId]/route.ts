import { getDB } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string; blockId: string }> };
type UpdateBlockBody = { type?: string; variant?: string | null; sort_order?: number; parent_block_id?: string | null; is_visible?: boolean; eyebrow?: string | null; title?: string | null; body?: string | null; media_id?: string | null; gallery_title?: string | null; data?: Record<string, unknown> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id: storyId, blockId } = await params; const body = (await request.json()) as UpdateBlockBody; const db = getDB();
    const existing = await db.prepare("SELECT id FROM story_blocks WHERE id=? AND story_id=? LIMIT 1").bind(blockId, storyId).first();
    if (!existing) return Response.json({ success: false, error: "Story block not found" }, { status: 404 });
    const fields: string[] = []; const values: unknown[] = []; const add = (field: string, value: unknown) => { fields.push(`${field}=?`); values.push(value); };
    if (body.type !== undefined) add("type", body.type); if (body.variant !== undefined) add("variant", body.variant); if (body.sort_order !== undefined) add("sort_order", body.sort_order); if (body.parent_block_id !== undefined) add("parent_block_id", body.parent_block_id); if (body.is_visible !== undefined) add("is_visible", body.is_visible ? 1 : 0); if (body.eyebrow !== undefined) add("eyebrow", body.eyebrow); if (body.title !== undefined) add("title", body.title); if (body.body !== undefined) add("body", body.body); if (body.media_id !== undefined) add("media_id", body.media_id); if (body.gallery_title !== undefined) add("gallery_title", body.gallery_title); if (body.data !== undefined) add("data", JSON.stringify(body.data));
    if (!fields.length) return Response.json({ success: true, message: "Nothing to update" });
    values.push(blockId, storyId); await db.prepare(`UPDATE story_blocks SET ${fields.join(",")} WHERE id=? AND story_id=?`).bind(...values).run();

    if (body.data !== undefined && Array.isArray(body.data.media_ids)) {
      const mediaIds = body.data.media_ids.filter((id): id is string => typeof id === "string" && id.length > 0);
      await db.prepare("DELETE FROM story_block_media WHERE block_id=?").bind(blockId).run();
      for (let index = 0; index < mediaIds.length; index += 1) {
        const mediaId = mediaIds[index];
        const exists = await db.prepare("SELECT id FROM media WHERE id=? LIMIT 1").bind(mediaId).first();
        if (exists) await db.prepare("INSERT INTO story_block_media (block_id,media_id,sort_order) VALUES (?,?,?)").bind(blockId, mediaId, index).run();
      }
    }

    if (body.type === "text" && (body.body !== undefined || body.data !== undefined)) await db.prepare("UPDATE text_block_data SET content=?, columns_data=? WHERE block_id=?").bind(body.body ?? "", JSON.stringify(body.data?.columns ?? []), blockId).run();
    const block = await db.prepare("SELECT * FROM story_blocks WHERE id=? AND story_id=? LIMIT 1").bind(blockId, storyId).first<Record<string, unknown>>();
    const media = await db.prepare("SELECT m.id,m.collection_id,m.type,m.path,m.filename,m.alt,m.width,m.height,sbm.sort_order FROM story_block_media sbm INNER JOIN media m ON m.id=sbm.media_id WHERE sbm.block_id=? ORDER BY sbm.sort_order ASC").bind(blockId).all();
    return Response.json({ success: true, block: { ...block, media: media.results ?? [] } });
  } catch (error) { console.error(error); return Response.json({ success: false, error: "Failed to update story block" }, { status: 500 }); }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try { const { id: storyId, blockId } = await params; const db = getDB(); const existing = await db.prepare("SELECT id FROM story_blocks WHERE id=? AND story_id=? LIMIT 1").bind(blockId, storyId).first(); if (!existing) return Response.json({ success: false, error: "Story block not found" }, { status: 404 }); await db.prepare("DELETE FROM story_block_media WHERE block_id=?").bind(blockId).run(); const result = await db.prepare("DELETE FROM story_blocks WHERE id=? AND story_id=?").bind(blockId, storyId).run(); if (!result.meta.changes) return Response.json({ success: false, error: "Story block not found" }, { status: 404 }); return Response.json({ success: true, deleted: blockId }); }
  catch (error) { console.error(error); return Response.json({ success: false, error: "Failed to delete story block" }, { status: 500 }); }
}
