import { getDB } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };
type CreateBlockBody = { type?: string; variant?: string | null; sort_order?: number; parent_block_id?: string | null; is_visible?: boolean; eyebrow?: string | null; title?: string | null; body?: string | null; media_id?: string | null; gallery_title?: string | null; data?: Record<string, unknown> };

const DETAIL_TABLES: Record<string, string> = { text: "text_block_data", image: "image_block_data", content: "content_block_data", links: "links_block_data", blog: "blog_block_data", video: "video_block_data", contact: "contact_block_data", social: "social_block_data", others: "others_block_data", flex: "flex_block_data" };

async function createDetailRow(db: ReturnType<typeof getDB>, type: string, blockId: string, body: CreateBlockBody) {
  const table = DETAIL_TABLES[type];
  if (type === "text") return db.prepare(`INSERT INTO ${table} (block_id,content,columns_data) VALUES (?,?,?)`).bind(blockId, body.body ?? "", JSON.stringify(body.data?.columns ?? [])).run();
  if (type === "image") return db.prepare(`INSERT INTO ${table} (block_id,layout,caption,alt_text) VALUES (?,?,?,?)`).bind(blockId, String(body.data?.layout ?? "single"), body.title ?? null, body.data?.alt_text ? String(body.data.alt_text) : null).run();
  if (type === "video") return db.prepare(`INSERT INTO ${table} (block_id,provider,video_id,url,settings) VALUES (?,?,?,?,?)`).bind(blockId, body.data?.provider ? String(body.data.provider) : null, body.data?.video_id ? String(body.data.video_id) : null, body.data?.url ? String(body.data.url) : null, JSON.stringify(body.data?.settings ?? {})).run();
  return db.prepare(`INSERT INTO ${table} (block_id,content) VALUES (?,?)`).bind(blockId, JSON.stringify(body.data ?? {})).run();
}

export async function GET(_request: Request, { params }: RouteContext) {
  try { const { id } = await params; const db = getDB(); const result = await db.prepare(`SELECT * FROM story_blocks WHERE story_id=? ORDER BY sort_order ASC`).bind(id).all(); return Response.json({ success: true, blocks: result.results }); }
  catch (error) { console.error(error); return Response.json({ success: false, error: "Failed to fetch story blocks" }, { status: 500 }); }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params; const body = (await request.json()) as CreateBlockBody;
    if (!body.type || !DETAIL_TABLES[body.type]) return Response.json({ success: false, error: "A supported block type is required" }, { status: 400 });
    const db = getDB(); const story = await db.prepare("SELECT id FROM stories WHERE id=? LIMIT 1").bind(id).first();
    if (!story) return Response.json({ success: false, error: "Story not found" }, { status: 404 });
    const blockId = crypto.randomUUID();
    const orderRow = await db.prepare("SELECT COALESCE(MAX(sort_order),0)+1000 AS next_order FROM story_blocks WHERE story_id=? AND parent_block_id IS NULL").bind(id).first<{ next_order: number }>();
    const sortOrder = body.sort_order ?? Number(orderRow?.next_order ?? 1000);
    await db.prepare(`INSERT INTO story_blocks (id,story_id,type,variant,parent_block_id,is_visible,sort_order,eyebrow,title,body,media_id,gallery_title,data) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(blockId,id,body.type,body.variant??null,body.parent_block_id??null,body.is_visible===false?0:1,sortOrder,body.eyebrow??null,body.title??null,body.body??null,body.media_id??null,body.gallery_title??null,JSON.stringify(body.data??{})).run();
    await createDetailRow(db, body.type, blockId, body);
    const block = await db.prepare("SELECT * FROM story_blocks WHERE id=? LIMIT 1").bind(blockId).first();
    return Response.json({ success: true, block });
  } catch (error) { console.error(error); return Response.json({ success: false, error: "Failed to create story block" }, { status: 500 }); }
}
