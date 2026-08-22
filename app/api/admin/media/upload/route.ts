import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "../../../../../lib/db";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PUBLIC_MEDIA_BASE_URL = "https://media.thescenestudio.asia";

function safeSegment(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "media";
}
function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const storySlug = String(form.get("story_slug") || "");
    const collectionSlug = String(form.get("collection_slug") || "");
    const collectionId = String(form.get("collection_id") || "") || null;
    const filename = file instanceof File ? file.name : "";
    const alt = String(form.get("alt") || filename || "");
    const width = Number(form.get("width") || 0) || null;
    const height = Number(form.get("height") || 0) || null;

    if (!(file instanceof File)) return Response.json({ success: false, error: "file is required" }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return Response.json({ success: false, error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return Response.json({ success: false, error: "Image must be 5 MB or smaller" }, { status: 400 });

    const db = getDB();
    let resolvedCollectionId = collectionId;
    let resolvedCollectionSlug = collectionSlug;
    if (resolvedCollectionId) {
      const collection = await db.prepare("SELECT id, slug FROM collections WHERE id = ?").bind(resolvedCollectionId).first<{ id: string; slug: string }>();
      if (!collection) return Response.json({ success: false, error: "Collection not found" }, { status: 404 });
      resolvedCollectionSlug = collection.slug;
    }

    const { env } = getCloudflareContext();
    const bucket = (env as unknown as { MEDIA_BUCKET: R2Bucket }).MEDIA_BUCKET;
    if (!bucket) throw new Error("MEDIA_BUCKET binding is not configured");

    const id = crypto.randomUUID();
    const folder = resolvedCollectionSlug ? `collections/${safeSegment(resolvedCollectionSlug)}` : storySlug ? `stories/${safeSegment(storySlug)}` : "library";
    const key = `${folder}/${id}.${extensionForType(file.type)}`;
    await bucket.put(key, file.stream(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" } });

    const path = `${PUBLIC_MEDIA_BASE_URL}/${key}`;
    const maxOrder = resolvedCollectionId ? await db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM media WHERE collection_id = ?").bind(resolvedCollectionId).first<{ max_order: number }>() : null;
    const sortOrder = Number(maxOrder?.max_order ?? -1) + 1;

    await db.prepare(`INSERT INTO media (id, collection_id, type, path, filename, alt, width, height, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, resolvedCollectionId, "image", path, filename, alt, width, height, sortOrder).run();
    const media = await db.prepare(`SELECT id, collection_id, type, path, filename, alt, width, height, sort_order, created_at FROM media WHERE id = ?`).bind(id).first();
    return Response.json({ success: true, media });
  } catch (error) {
    console.error("POST /api/admin/media/upload error:", error);
    return Response.json({ success: false, error: "Failed to upload media" }, { status: 500 });
  }
}
