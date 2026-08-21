import { getDB } from "../../../../../lib/db";
import { nasConfigured, sanitizeNasPath, uploadToNas } from "../../../../../lib/nas";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function safeFilename(name: string) {
  const normalized = name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "-");
  return normalized.replace(/-+/g, "-").replace(/^-|-$/g, "") || `image-${Date.now()}.jpg`;
}

function getDimensions(_file: File) {
  return { width: null as number | null, height: null as number | null };
}

export async function POST(request: Request) {
  try {
    if (!nasConfigured()) {
      return Response.json(
        {
          success: false,
          error: "NAS upload is not configured. Set NAS_WEBDAV_URL, NAS_USERNAME and NAS_PASSWORD in the Worker secrets.",
        },
        { status: 503 },
      );
    }

    const form = await request.formData();
    const collectionId = String(form.get("collection_id") || "").trim();
    const files = form.getAll("files").filter((value): value is File => value instanceof File);

    if (!collectionId) {
      return Response.json({ success: false, error: "collection_id is required" }, { status: 400 });
    }
    if (!files.length) {
      return Response.json({ success: false, error: "Select at least one image" }, { status: 400 });
    }

    const db = getDB();
    const collection = await db
      .prepare("SELECT id, slug FROM collections WHERE id = ?")
      .bind(collectionId)
      .first<{ id: string; slug: string }>();

    if (!collection) {
      return Response.json({ success: false, error: "Collection not found" }, { status: 404 });
    }

    const results: Array<Record<string, unknown>> = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return Response.json({ success: false, error: `${file.name}: unsupported image type` }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return Response.json({ success: false, error: `${file.name}: maximum file size is 50 MB` }, { status: 400 });
      }

      const filename = safeFilename(file.name);
      // NAS_WEBDAV_URL points at the public/WEB WebDAV root. The public URL
      // therefore maps directly to /collections/<slug>/<filename>.
      const path = `/collections/${collection.slug}/${Date.now()}-${filename}`;
      const cleanPath = sanitizeNasPath(path);
      await uploadToNas(cleanPath, file);

      const id = crypto.randomUUID();
      const dimensions = getDimensions(file);
      const sort = await db
        .prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM media WHERE collection_id = ?")
        .bind(collectionId)
        .first<{ next: number }>();

      await db
        .prepare(`
          INSERT INTO media (id, collection_id, type, path, filename, alt, width, height, sort_order)
          VALUES (?, ?, 'image', ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          id,
          collectionId,
          `/${cleanPath}`,
          filename,
          filename.replace(/\.[^.]+$/, ""),
          dimensions.width,
          dimensions.height,
          sort?.next ?? 0,
        )
        .run();

      const media = await db
        .prepare(`
          SELECT id, collection_id, type, path, filename, alt, width, height, sort_order, created_at
          FROM media WHERE id = ?
        `)
        .bind(id)
        .first();

      results.push(media || { id });
    }

    return Response.json({ success: true, media: results });
  } catch (error) {
    console.error("POST /api/admin/media/upload error:", error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to upload media" },
      { status: 500 },
    );
  }
}
