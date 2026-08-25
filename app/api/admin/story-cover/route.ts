import { getDB } from "../../../../lib/db";

type PositionPayload = { story_id?: string; position_x?: number; position_y?: number };

async function ensureTable(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS story_cover_positions (story_id TEXT PRIMARY KEY, position_x REAL NOT NULL DEFAULT 50, position_y REAL NOT NULL DEFAULT 50, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ success: false, error: "id is required" }, { status: 400 });
  try {
    const db = getDB(); await ensureTable(db);
    const position = await db.prepare("SELECT story_id,position_x,position_y FROM story_cover_positions WHERE story_id=?").bind(id).first();
    return Response.json({ success: true, position: position ?? { story_id: id, position_x: 50, position_y: 50 } });
  } catch (error) {
    console.error("GET /api/admin/story-cover error:", error);
    return Response.json({ success: false, error: "Failed to load cover position" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as PositionPayload;
    if (!body.story_id) return Response.json({ success: false, error: "story_id is required" }, { status: 400 });
    const position_x = Math.max(0, Math.min(100, Number(body.position_x ?? 50)));
    const position_y = Math.max(0, Math.min(100, Number(body.position_y ?? 50)));
    const db = getDB(); await ensureTable(db);
    const story = await db.prepare("SELECT id FROM stories WHERE id=? LIMIT 1").bind(body.story_id).first();
    if (!story) return Response.json({ success: false, error: "Story not found" }, { status: 404 });
    await db.prepare(`INSERT INTO story_cover_positions (story_id,position_x,position_y,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(story_id) DO UPDATE SET position_x=excluded.position_x,position_y=excluded.position_y,updated_at=CURRENT_TIMESTAMP`).bind(body.story_id, position_x, position_y).run();
    return Response.json({ success: true, position: { story_id: body.story_id, position_x, position_y } });
  } catch (error) {
    console.error("PATCH /api/admin/story-cover error:", error);
    return Response.json({ success: false, error: "Failed to save cover position" }, { status: 500 });
  }
}
