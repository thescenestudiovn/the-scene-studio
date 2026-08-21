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
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id: storyId, blockId } = await params;

    const body = (await request.json()) as UpdateBlockBody;

    const db = getDB();

    const existing = await db
      .prepare(`
        SELECT id
        FROM story_blocks
        WHERE id = ?
          AND story_id = ?
        LIMIT 1
      `)
      .bind(blockId, storyId)
      .first();

    if (!existing) {
      return Response.json(
        {
          success: false,
          error: "Story block not found",
        },
        { status: 404 }
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.type !== undefined) {
      fields.push("type = ?");
      values.push(body.type);
    }

    if (body.sort_order !== undefined) {
      fields.push("sort_order = ?");
      values.push(body.sort_order);
    }

    if (body.eyebrow !== undefined) {
      fields.push("eyebrow = ?");
      values.push(body.eyebrow);
    }

    if (body.title !== undefined) {
      fields.push("title = ?");
      values.push(body.title);
    }

    if (body.body !== undefined) {
      fields.push("body = ?");
      values.push(body.body);
    }

    if (body.media_id !== undefined) {
      fields.push("media_id = ?");
      values.push(body.media_id);
    }

    if (body.gallery_title !== undefined) {
      fields.push("gallery_title = ?");
      values.push(body.gallery_title);
    }

    if (fields.length === 0) {
      return Response.json({
        success: true,
        message: "Nothing to update",
      });
    }

    values.push(blockId, storyId);

    await db
      .prepare(`
        UPDATE story_blocks
        SET ${fields.join(", ")}
        WHERE id = ?
          AND story_id = ?
      `)
      .bind(...values)
      .run();

    const block = await db
      .prepare(`
        SELECT *
        FROM story_blocks
        WHERE id = ?
          AND story_id = ?
        LIMIT 1
      `)
      .bind(blockId, storyId)
      .first();

    return Response.json({
      success: true,
      block,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/stories/[id]/blocks/[blockId] error:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to update story block",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id: storyId, blockId } = await params;

    const db = getDB();

    const existing = await db
      .prepare(`
        SELECT id
        FROM story_blocks
        WHERE id = ?
          AND story_id = ?
        LIMIT 1
      `)
      .bind(blockId, storyId)
      .first();

    if (!existing) {
      return Response.json(
        {
          success: false,
          error: "Story block not found",
        },
        { status: 404 }
      );
    }

    // Remove media relationships first.
    await db
      .prepare(`
        DELETE FROM story_block_media
        WHERE block_id = ?
      `)
      .bind(blockId)
      .run();

    // Then remove the block itself.
    const result = await db
      .prepare(`
        DELETE FROM story_blocks
        WHERE id = ?
          AND story_id = ?
      `)
      .bind(blockId, storyId)
      .run();

    if (!result.meta.changes) {
      return Response.json(
        {
          success: false,
          error: "Story block not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      deleted: blockId,
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/stories/[id]/blocks/[blockId] error:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to delete story block",
      },
      { status: 500 }
    );
  }
}