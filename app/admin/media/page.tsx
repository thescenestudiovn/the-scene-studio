"use client";

import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "../../../lib/media";

type Media = {
  id: string;
  path: string;
  filename: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at?: string;
};

type MediaResponse = {
  success: boolean;
  media: Media[];
  error?: string;
};

export default function AdminMediaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const data = (await response.json()) as MediaResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load media");
      }
      setMedia(data.media || []);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage("");

    try {
      let uploaded = 0;

      for (const file of Array.from(files)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          throw new Error(`${file.name}: only JPEG, PNG, and WebP are allowed`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name}: maximum file size is 5 MB`);
        }

        const dimensions = await readImageSize(file);
        const form = new FormData();
        form.append("file", file);
        form.append("story_slug", "library");
        form.append("alt", file.name.replace(/\.[^/.]+$/, ""));
        form.append("width", String(dimensions.width));
        form.append("height", String(dimensions.height));

        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: form,
        });
        const data = (await response.json()) as { success: boolean; error?: string };

        if (!response.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        uploaded += 1;
      }

      await loadMedia();
      setMessage(`${uploaded} image${uploaded === 1 ? "" : "s"} uploaded to R2`);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Upload failed");
      await loadMedia();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <main style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, marginBottom: 30 }}>
        <div>
          <p style={{ marginBottom: 8, opacity: 0.55, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>Admin</p>
          <h1 style={{ margin: 0 }}>Media Library</h1>
          <p style={{ marginTop: 10, opacity: 0.6 }}>Images are stored in Cloudflare R2.</p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ padding: "12px 20px", border: 0, background: "#111", color: "#fff", cursor: uploading ? "default" : "pointer" }}
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(event) => uploadFiles(event.target.files)}
        />
      </div>

      {message && <p style={{ padding: 12, background: "#f4f4f4", marginBottom: 24 }}>{message}</p>}

      {loading ? (
        <p>Loading media...</p>
      ) : media.length === 0 ? (
        <div style={{ padding: 50, border: "1px dashed #ccc", textAlign: "center" }}>
          <p style={{ marginBottom: 16 }}>No images yet.</p>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
            Upload your first image
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
          {media.map((item) => (
            <article key={item.id} style={{ border: "1px solid #ddd", overflow: "hidden" }}>
              <div style={{ aspectRatio: "4 / 3", background: "#f3f3f3" }}>
                <img
                  src={mediaUrl(item.path)}
                  alt={item.alt || item.filename}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ padding: 14 }}>
                <p style={{ margin: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.filename}</p>
                <p style={{ margin: "7px 0 0", fontSize: 12, opacity: 0.55 }}>
                  {item.width || "—"} × {item.height || "—"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function readImageSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name}`));
    };
    image.src = url;
  });
}
