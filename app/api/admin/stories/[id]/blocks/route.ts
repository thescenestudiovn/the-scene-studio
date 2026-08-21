import { getDB } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type CreateBlockBody = {
  type?: string;
  sort_order?: number;
  eyebrow?: string | null;
  title?: string | null;
  body?: string | null;
  media_id?: string | null;
  gallery_title?: string | null;
  gallery_layout?: "grid" | "feature" | "portrait-pair";
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const db = getDB();
    const result = await db
      .prepare(`
        SELECT *
        FROM story_blocks
        WHERE story_id = ?
        ORDER BY sort_order ASC
      `)
      .bind(id)
      .all();

    return Response.json({ success: true, blocks: result.results });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Failed to fetch story blocks" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as CreateBlockBody;
    const {
      type,
      sort_order = 0,
      eyebrow = null,
      title = null,
      body: content = null,
      media_id = null,
      gallery_title = null,
      gallery_layout = "grid",
    } = body;

    if (!type) {
      return Response.json(
        { success: false, error: "type is required" },
        { status: 400 }
      );
    }

    const db = getDB();
    const story = await db
      .prepare(`SELECT id FROM stories WHERE id = ? LIMIT 1`)
      .bind(id)
      .first();

    if (!story) {
      return Response.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      );
    }

    const blockId = crypto.randomUUID();

    await db
      .prepare(`
        INSERT INTO story_blocks (
          id, story_id, type, sort_order, eyebrow, title, body,
          media_id, gallery_title, gallery_layout
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        blockId,
        id,
        type,
        sort_order,
        eyebrow,
        title,
        content,
        media_id,
        gallery_title,
        gallery_layout
      )
      .run();

    const block = await db
      .prepare(`SELECT * FROM story_blocks WHERE id = ? LIMIT 1`)
      .bind(blockId)
      .first();

    return Response.json({ success: true, block });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Failed to create story block" },
      { status: 500 }
    );
  }
}
