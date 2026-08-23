import { getDB } from "../../../../lib/db";

type PositionPayload = { collection_id?: string; position_x?: number; position_y?: number };

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ success: false, error: "id is required" }, { status: 400 });

  try {
    const db = getDB();
    const position = await db.prepare("SELECT collection_id,position_x,position_y FROM collection_cover_positions WHERE collection_id=?").bind(id).first();
    return Response.json({ success: true, position: position ?? { collection_id: id, position_x: 50, position_y: 50 } });
  } catch (error) {
    console.error("GET /api/admin/collection-cover error:", error);
    return Response.json({ success: false, error: "Failed to load cover position" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as PositionPayload;
    if (!body.collection_id) return Response.json({ success: false, error: "collection_id is required" }, { status: 400 });

    const position_x = Math.max(0, Math.min(100, Number(body.position_x ?? 50)));
    const position_y = Math.max(0, Math.min(100, Number(body.position_y ?? 50)));
    const db = getDB();

    await db.prepare(`INSERT INTO collection_cover_positions (collection_id,position_x,position_y,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(collection_id) DO UPDATE SET position_x=excluded.position_x,position_y=excluded.position_y,updated_at=CURRENT_TIMESTAMP`).bind(body.collection_id, position_x, position_y).run();

    return Response.json({ success: true, position: { collection_id: body.collection_id, position_x, position_y } });
  } catch (error) {
    console.error("PATCH /api/admin/collection-cover error:", error);
    return Response.json({ success: false, error: "Failed to save cover position" }, { status: 500 });
  }
}
