import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "../../../../lib/db";

type CollectionPayload = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  destination_id?: string | null;
  client_name?: string | null;
  event_date?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published?: number | boolean;
  cover_media_id?: string | null;
};

type GalleryPagePayload = {
  title?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  eyebrow?: string;
  description?: string;
};

const fields = `c.id,c.title,c.slug,c.description,c.destination_id,c.client_name,c.event_date,c.seo_title,c.seo_description,c.published,c.cover_media_id,c.created_at,c.updated_at,d.name AS destination_name,d.country AS destination_country,(SELECT COUNT(*) FROM media m WHERE m.collection_id=c.id) AS media_count,(SELECT m.path FROM media m WHERE m.id=c.cover_media_id) AS cover_path`;

async function ensureCoverPositionTable() {
  const db = getDB();
  await db.prepare(`CREATE TABLE IF NOT EXISTS collection_cover_positions (collection_id TEXT PRIMARY KEY, position_x REAL NOT NULL DEFAULT 50, position_y REAL NOT NULL DEFAULT 50, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function ensureGalleryPage() {
  const db = getDB();
  let page = await db.prepare(`SELECT id,slug,title,seo_title,seo_description,published FROM pages WHERE slug='gallery' LIMIT 1`).first<{ id: string; slug: string; title: string; seo_title: string | null; seo_description: string | null; published: number }>();
  if (!page) {
    const id = "page-gallery";
    await db.prepare(`INSERT OR IGNORE INTO pages (id,slug,title,page_type,seo_title,seo_description,published) VALUES (?,'gallery','Gallery','gallery',NULL,NULL,1)`).bind(id).run();
    page = await db.prepare(`SELECT id,slug,title,seo_title,seo_description,published FROM pages WHERE slug='gallery' LIMIT 1`).first<{ id: string; slug: string; title: string; seo_title: string | null; seo_description: string | null; published: number }>();
  }
  return page;
}

async function getGalleryPage() {
  const db = getDB();
  const page = await ensureGalleryPage();
  if (!page) return null;
  const block = await db.prepare(`SELECT data FROM page_blocks WHERE page_id=? AND type='hero' ORDER BY sort_order ASC LIMIT 1`).bind(page.id).first<{ data: string }>();
  let data: { eyebrow?: string; body?: string } = {};
  if (block?.data) {
    try { data = JSON.parse(block.data) as { eyebrow?: string; body?: string }; } catch { data = {}; }
  }
  return { ...page, eyebrow: data.eyebrow ?? "Collections", description: data.body ?? "Manage the gallery collections and the editorial content shown above them." };
}

async function getCollections() {
  const db = getDB();
  await ensureCoverPositionTable();
  const result = await db.prepare(`SELECT ${fields},COALESCE(cp.position_x,50) AS cover_position_x,COALESCE(cp.position_y,50) AS cover_position_y FROM collections c LEFT JOIN destinations d ON d.id=c.destination_id LEFT JOIN collection_cover_positions cp ON cp.collection_id=c.id ORDER BY c.created_at DESC`).all();
  return result.results ?? [];
}

export async function GET() {
  try {
    const collections = await getCollections();
    let galleryPage = null;
    try { galleryPage = await getGalleryPage(); } catch (error) { console.error("GET /api/admin/collections galleryPage error:", error); }
    return Response.json({ success: true, collections, galleryPage });
  } catch (error) {
    console.error("GET /api/admin/collections error:", error);
    return Response.json({ success: false, error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CollectionPayload;
    if (!body.title?.trim() || !body.slug?.trim()) return Response.json({ success: false, error: "title and slug are required" }, { status: 400 });
    const db = getDB();
    const id = crypto.randomUUID();
    await db.prepare(`INSERT INTO collections (id,title,slug,description,destination_id,client_name,event_date,seo_title,seo_description,published,cover_media_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(id,body.title.trim(),body.slug.trim(),body.description || null,body.destination_id || null,body.client_name || null,body.event_date || null,body.seo_title || null,body.seo_description || null,body.published === false ? 0 : 1,body.cover_media_id || null).run();
    const collection = await db.prepare(`SELECT ${fields} FROM collections c LEFT JOIN destinations d ON d.id=c.destination_id WHERE c.id=?`).bind(id).first();
    return Response.json({ success: true, collection });
  } catch (error) {
    console.error("POST /api/admin/collections error:", error);
    return Response.json({ success: false, error: "Failed to create collection" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as CollectionPayload & { galleryPage?: GalleryPagePayload };
    const db = getDB();
    if (body.galleryPage) {
      const page = await ensureGalleryPage();
      if (!page) return Response.json({ success: false, error: "Unable to initialize Gallery page" }, { status: 500 });
      await db.prepare(`UPDATE pages SET title=?,seo_title=?,seo_description=?,published=1,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(body.galleryPage.title?.trim() || "Gallery",body.galleryPage.seo_title?.trim() || null,body.galleryPage.seo_description?.trim() || null,page.id).run();
      const data = JSON.stringify({ eyebrow: body.galleryPage.eyebrow?.trim() || "", body: body.galleryPage.description?.trim() || "" });
      await db.prepare(`INSERT INTO page_blocks (id,page_id,type,sort_order,data) VALUES ('gallery-hero',?,'hero',0,?) ON CONFLICT(id) DO UPDATE SET page_id=excluded.page_id,type=excluded.type,sort_order=excluded.sort_order,data=excluded.data,updated_at=CURRENT_TIMESTAMP`).bind(page.id,data).run();
      return Response.json({ success: true, galleryPage: await getGalleryPage() });
    }
    if (!body.id || !body.title?.trim() || !body.slug?.trim()) return Response.json({ success: false, error: "id, title and slug are required" }, { status: 400 });
    const result = await db.prepare(`UPDATE collections SET title=?,slug=?,description=?,destination_id=?,client_name=?,event_date=?,seo_title=?,seo_description=?,published=?,cover_media_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(body.title.trim(),body.slug.trim(),body.description || null,body.destination_id || null,body.client_name || null,body.event_date || null,body.seo_title || null,body.seo_description || null,body.published === false ? 0 : 1,body.cover_media_id || null,body.id).run();
    if (!result.meta.changes) return Response.json({ success: false, error: "Collection not found" }, { status: 404 });
    const collection = await db.prepare(`SELECT ${fields} FROM collections c LEFT JOIN destinations d ON d.id=c.destination_id WHERE c.id=?`).bind(body.id).first();
    return Response.json({ success: true, collection });
  } catch (error) {
    console.error("PATCH /api/admin/collections error:", error);
    return Response.json({ success: false, error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    let id = url.searchParams.get("id");
    if (!id) { try { id = ((await request.json()) as { id?: string }).id ?? null; } catch {} }
    if (!id) return Response.json({ success: false, error: "id is required" }, { status: 400 });
    const db = getDB();
    const collection = await db.prepare("SELECT id FROM collections WHERE id=?").bind(id).first<{ id: string }>();
    if (!collection) return Response.json({ success: false, error: "Collection not found" }, { status: 404 });
    const media = await db.prepare("SELECT id,path FROM media WHERE collection_id=?").bind(id).all<{ id: string; path: string }>();
    try {
      const { env } = await getCloudflareContext({ async: true });
      const bucket = (env as unknown as { MEDIA_BUCKET?: R2Bucket }).MEDIA_BUCKET;
      if (bucket) for (const item of media.results) { try { const key = new URL(item.path).pathname.replace(/^\//, ""); if (key) await bucket.delete(key); } catch {} }
    } catch {}
    await db.prepare("DELETE FROM story_block_media WHERE media_id IN (SELECT id FROM media WHERE collection_id=?)").bind(id).run();
    await db.prepare("DELETE FROM media WHERE collection_id=?").bind(id).run();
    await db.prepare("DELETE FROM story_gallery_cta WHERE collection_id=?").bind(id).run();
    await db.prepare("DELETE FROM collection_cover_positions WHERE collection_id=?").bind(id).run();
    await db.prepare("DELETE FROM collections WHERE id=?").bind(id).run();
    return Response.json({ success: true, deleted: id, deleted_media: media.results.length });
  } catch (error) {
    console.error("DELETE /api/admin/collections error:", error);
    return Response.json({ success: false, error: "Failed to delete collection" }, { status: 500 });
  }
}
