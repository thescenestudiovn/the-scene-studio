import { getDB } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
    blockId: string;
  }>;
};

type UpdateBlockBody = {
  type?: string;
  sort_order?: number;
  eyebrow?: string | null;
  title?: string | null;
  body?: string | null;
  media_id?: string | null;
  gallery_title?: string | null;
  gallery_layout?: "grid" | "feature" | "portrait-pair";
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id: storyId, blockId } = await params;
    const body = (await request.json()) as UpdateBlockBody;
    const db = getDB();

    const existing = await db
      .prepare(`SELECT id FROM story_blocks WHERE id = ? AND story_id = ? LIMIT 1`)
      .bind(blockId, storyId)
      .first();

    if (!existing) {
      return Response.json(
        { success: false, error: "Story block not found" },
        { status: 404 }
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    const updates: [string, unknown][] = [
      ["type = ?", body.type],
      ["sort_order = ?", body.sort_order],
      ["eyebrow = ?", body.eyebrow],
      ["title = ?", body.title],
      ["body = ?", body.body],
      ["media_id = ?", body.media_id],
      ["gallery_title = ?", body.gallery_title],
      ["gallery_layout = ?", body.gallery_layout],
    ];

    for (const [field, value] of updates) {
      if (value !== undefined) {
        fields.push(field);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return Response.json({ success: true, message: "Nothing to update" });
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(blockId, storyId);

    await db
      .prepare(`
        UPDATE story_blocks
        SET ${fields.join(", ")}
        WHERE id = ? AND story_id = ?
      `)
      .bind(...values)
      .run();

    const block = await db
      .prepare(`SELECT * FROM story_blocks WHERE id = ? AND story_id = ? LIMIT 1`)
      .bind(blockId, storyId)
      .first();

    return Response.json({ success: true, block });
  } catch (error) {
    console.error("PATCH story block error:", error);
    return Response.json(
      { success: false, error: "Failed to update story block" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id: storyId, blockId } = await params;
    const db = getDB();

    const existing = await db
      .prepare(`SELECT id FROM story_blocks WHERE id = ? AND story_id = ? LIMIT 1`)
      .bind(blockId, storyId)
      .first();

    if (!existing) {
      return Response.json(
        { success: false, error: "Story block not found" },
        { status: 404 }
      );
    }

    await db
      .prepare(`DELETE FROM story_block_media WHERE block_id = ?`)
      .bind(blockId)
      .run();

    const result = await db
      .prepare(`DELETE FROM story_blocks WHERE id = ? AND story_id = ?`)
      .bind(blockId, storyId)
      .run();

    if (!result.meta.changes) {
      return Response.json(
        { success: false, error: "Story block not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, deleted: blockId });
  } catch (error) {
    console.error("DELETE story block error:", error);
    return Response.json(
      { success: false, error: "Failed to delete story block" },
      { status: 500 }
    );
  }
}
