import { getDB } from "@/lib/db";

type RouteContext = {
    params: Promise<{
        id: string;
        blockId: string;
    }>;
};

type AddMediaBody = {
    media_id?: string;
    sort_order?: number;
};

export async function POST(
    request: Request,
    { params }: RouteContext
) {
    try {
        const { id: storyId, blockId } = await params;

        const body = (await request.json()) as AddMediaBody;
        const {
            media_id: mediaId,
            sort_order: sortOrder = 0,
        } = body;

        if (!mediaId) {
            return Response.json(
                {
                    success: false,
                    error: "media_id is required",
                },
                { status: 400 }
            );
        }

        const db = getDB();

        const block = await db
            .prepare(`
        SELECT id
        FROM story_blocks
        WHERE id = ?
          AND story_id = ?
        LIMIT 1
      `)
            .bind(blockId, storyId)
            .first();

        if (!block) {
            return Response.json(
                {
                    success: false,
                    error: "Story block not found",
                },
                { status: 404 }
            );
        }

        const media = await db
            .prepare(`
        SELECT id
        FROM media
        WHERE id = ?
        LIMIT 1
      `)
            .bind(mediaId)
            .first();

        if (!media) {
            return Response.json(
                {
                    success: false,
                    error: "Media not found",
                },
                { status: 404 }
            );
        }

        await db
            .prepare(`
        INSERT OR REPLACE INTO story_block_media (
          block_id,
          media_id,
          sort_order
        )
        VALUES (?, ?, ?)
      `)
            .bind(blockId, mediaId, sortOrder)
            .run();

        return Response.json({
            success: true,
            block_id: blockId,
            media_id: mediaId,
            sort_order: sortOrder,
        });
    } catch (error) {
        console.error(
            "POST story block media error:",
            error
        );

        return Response.json(
            {
                success: false,
                error: "Failed to add media to story block",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: RouteContext
) {
    try {
        const { id: storyId, blockId } = await params;

        const body = (await request.json()) as {
            media_id?: string;
        };

        const mediaId = body.media_id;

        if (!mediaId) {
            return Response.json(
                {
                    success: false,
                    error: "media_id is required",
                },
                { status: 400 }
            );
        }

        const db = getDB();

        const block = await db
            .prepare(`
        SELECT id
        FROM story_blocks
        WHERE id = ?
          AND story_id = ?
        LIMIT 1
      `)
            .bind(blockId, storyId)
            .first();

        if (!block) {
            return Response.json(
                {
                    success: false,
                    error: "Story block not found",
                },
                { status: 404 }
            );
        }

        await db
            .prepare(`
        DELETE FROM story_block_media
        WHERE block_id = ?
          AND media_id = ?
      `)
            .bind(blockId, mediaId)
            .run();

        return Response.json({
            success: true,
            removed: mediaId,
        });
    } catch (error) {
        console.error(
            "DELETE story block media error:",
            error
        );

        return Response.json(
            {
                success: false,
                error: "Failed to remove media from story block",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: RouteContext
) {
    try {
        const { id: storyId, blockId } = await params;

        const body = (await request.json()) as {
            media_id?: string;
            sort_order?: number;
        };

        const mediaId = body.media_id;
        const sortOrder = body.sort_order;

        if (!mediaId || sortOrder === undefined) {
            return Response.json(
                {
                    success: false,
                    error: "media_id and sort_order are required",
                },
                { status: 400 }
            );
        }

        const db = getDB();

        const block = await db
            .prepare(`
        SELECT id
        FROM story_blocks
        WHERE id = ?
          AND story_id = ?
        LIMIT 1
      `)
            .bind(blockId, storyId)
            .first();

        if (!block) {
            return Response.json(
                {
                    success: false,
                    error: "Story block not found",
                },
                { status: 404 }
            );
        }

        await db
            .prepare(`
        UPDATE story_block_media
        SET sort_order = ?
        WHERE block_id = ?
          AND media_id = ?
      `)
            .bind(sortOrder, blockId, mediaId)
            .run();

        return Response.json({
            success: true,
            media_id: mediaId,
            sort_order: sortOrder,
        });
    } catch (error) {
        console.error(
            "PATCH story block media error:",
            error
        );

        return Response.json(
            {
                success: false,
                error: "Failed to reorder media",
            },
            { status: 500 }
        );
    }
}