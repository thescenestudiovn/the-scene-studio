import { getDB } from "../../../../../lib/db";
import { nasConfigured, nasConfigurationError, sanitizeNasPath, uploadToNas } from "../../../../../lib/nas";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function safeFilename(name: string) {
  const normalized = name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "-");
  return normalized.replace(/-+/g, "-").replace(/^-|-$/g, "") || `image-${Date.now()}.jpg`;
}

export async function GET() {
  const configurationError = nasConfigurationError();
  return Response.json({
    success: !configurationError && nasConfigured(),
    configured: !configurationError && nasConfigured(),
    error: configurationError,
  });
}

export async function POST(request: Request) {
  try {
    const configurationError = nasConfigurationError();
    if (configurationError) {
      return Response.json({ success: false, error: configurationError }, { status: 503 });
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
      const uniqueFilename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${filename}`;
      const cleanPath = sanitizeNasPath(`/collections/${collection.slug}/${uniqueFilename}`);

      await uploadToNas(cleanPath, file);

      const id = crypto.randomUUID();
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
          null,
          null,
          null,
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
