import { getDB } from "../../../../../lib/db";

const NAS_UPLOAD_URL = process.env.NAS_UPLOAD_URL;
const NAS_UPLOAD_TOKEN = process.env.NAS_UPLOAD_TOKEN;

function cleanRelativePath(value: string) {
  return value
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");
}

function cleanFilename(value: string) {
  const filename = value.replace(/\\/g, "/").split("/").pop() || "file";
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(request: Request) {
  if (!NAS_UPLOAD_URL || !NAS_UPLOAD_TOKEN) {
    return Response.json(
      {
        success: false,
        error: "NAS upload is not configured",
      },
      { status: 503 }
    );
  }

  const filename = cleanFilename(request.headers.get("x-filename") || "");
  const uploadPath = cleanRelativePath(
    request.headers.get("x-upload-path") || "gallery"
  );
  const contentType =
    request.headers.get("content-type") || "application/octet-stream";
  const width = Number(request.headers.get("x-width") || 0) || null;
  const height = Number(request.headers.get("x-height") || 0) || null;
  const alt = request.headers.get("x-alt") || null;
  const collectionId = request.headers.get("x-collection-id") || null;

  if (!filename) {
    return Response.json(
      { success: false, error: "Filename is required" },
      { status: 400 }
    );
  }

  if (!/^image\/(jpeg|png|webp|avif)$/i.test(contentType)) {
    return Response.json(
      {
        success: false,
        error: "Only JPEG, PNG, WebP and AVIF images are supported",
      },
      { status: 400 }
    );
  }

  if (!request.body) {
    return Response.json(
      { success: false, error: "Request body is empty" },
      { status: 400 }
    );
  }

  const nasUrl = new URL(NAS_UPLOAD_URL);
  nasUrl.searchParams.set("path", uploadPath);
  nasUrl.searchParams.set("filename", filename);

  try {
    const headers = new Headers({
      Authorization: `Bearer ${NAS_UPLOAD_TOKEN}`,
      "Content-Type": contentType,
    });

    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    const response = await fetch(nasUrl, {
      method: "POST",
      headers,
      body: request.body,
    });

    const raw = await response.text();
    let result: { path?: string; error?: string } = {};

    try {
      result = JSON.parse(raw) as typeof result;
    } catch {
      result = { error: raw || "NAS upload failed" };
    }

    if (!response.ok || !result.path) {
      return Response.json(
        {
          success: false,
          error: result.error || `NAS upload failed (${response.status})`,
        },
        { status: 502 }
      );
    }

    const db = getDB();
    const id = crypto.randomUUID();
    const normalizedPath = result.path.startsWith("/")
      ? result.path
      : `/${result.path}`;

    await db
      .prepare(`
        INSERT INTO media (
          id,
          collection_id,
          type,
          path,
          filename,
          alt,
          width,
          height,
          sort_order
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        collectionId,
        "image",
        normalizedPath,
        filename,
        alt,
        width,
        height,
        0
      )
      .run();

    const media = await db
      .prepare(`
        SELECT
          id,
          collection_id,
          type,
          path,
          filename,
          alt,
          width,
          height,
          sort_order,
          created_at
        FROM media
        WHERE id = ?
      `)
      .bind(id)
      .first();

    return Response.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error("POST /api/admin/media/upload error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to upload image to NAS",
      },
      { status: 502 }
    );
  }
}
