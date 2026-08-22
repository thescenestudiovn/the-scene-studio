"use client";

import { ChangeEvent, useEffect, useState } from "react";

type Media = {
  id: string;
  path: string;
  filename: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  created_at?: string;
};

type MediaResponse = {
  success: boolean;
  media: Media[];
  error?: string;
};

async function getImageSize(file: File) {
  const url = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [folder, setFolder] = useState("gallery");
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState("");

  async function loadMedia() {
    const response = await fetch("/api/admin/media", { cache: "no-store" });
    const data = (await response.json()) as MediaResponse;

    if (!data.success) {
      throw new Error(data.error || "Failed to load media");
    }

    setMedia(data.media || []);
  }

  useEffect(() => {
    loadMedia().catch((error) => {
      console.error(error);
      setMessage("Failed to load media library");
    });
  }, []);

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files || []));
    setMessage("");
  }

  async function uploadFiles() {
    if (!files.length || uploading) return;

    setUploading(true);
    setMessage("");

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setProgress(`Uploading ${index + 1} / ${files.length}: ${file.name}`);

        const { width, height } = await getImageSize(file);

        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            "X-Filename": file.name,
            "X-Upload-Path": folder,
            "X-Width": String(width),
            "X-Height": String(height),
            ...(alt ? { "X-Alt": alt } : {}),
          },
          body: file,
        });

        const data = (await response.json()) as {
          success: boolean;
          error?: string;
        };

        if (!response.ok || !data.success) {
          throw new Error(data.error || `Upload failed: ${file.name}`);
        }
      }

      setFiles([]);
      setProgress("");
      setMessage(`${files.length} image${files.length === 1 ? "" : "s"} uploaded`);
      await loadMedia();
    } catch (error) {
      console.error(error);
      setProgress("");
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: 40,
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <p style={{ opacity: 0.55, fontSize: 13, marginBottom: 8 }}>
          Admin
        </p>
        <h1 style={{ margin: 0 }}>Media Library</h1>
      </div>

      <section
        style={{
          border: "1px solid #ddd",
          padding: 24,
          marginBottom: 40,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Upload to NAS</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <label>
            NAS folder
            <input
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              disabled={uploading}
              placeholder="gallery"
              style={{
                display: "block",
                width: "100%",
                padding: 10,
                marginTop: 6,
                border: "1px solid #ccc",
              }}
            />
          </label>

          <label>
            Alt text
            <input
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              disabled={uploading}
              placeholder="Optional"
              style={{
                display: "block",
                width: "100%",
                padding: 10,
                marginTop: 6,
                border: "1px solid #ccc",
              }}
            />
          </label>
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleFiles}
          disabled={uploading}
        />

        {files.length > 0 && (
          <p style={{ marginTop: 12, opacity: 0.65 }}>
            {files.length} file{files.length === 1 ? "" : "s"} selected
          </p>
        )}

        <button
          onClick={uploadFiles}
          disabled={uploading || files.length === 0}
          style={{
            marginTop: 16,
            padding: "12px 22px",
            border: 0,
            background: uploading || files.length === 0 ? "#ccc" : "#111",
            color: "#fff",
            cursor: uploading || files.length === 0 ? "default" : "pointer",
          }}
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>

        {progress && <p style={{ marginTop: 16 }}>{progress}</p>}
        {message && (
          <p style={{ marginTop: 16, padding: 12, background: "#f5f5f5" }}>
            {message}
          </p>
        )}
      </section>

      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0 }}>Media Library</h2>
          <span style={{ opacity: 0.5 }}>{media.length} images</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {media.map((item) => (
            <article
              key={item.id}
              style={{ border: "1px solid #ddd", overflow: "hidden" }}
            >
              <img
                src={`https://media.thescenestudio.asia${item.path}`}
                alt={item.alt || item.filename}
                loading="lazy"
                style={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "3 / 2",
                  objectFit: "cover",
                }}
              />
              <div style={{ padding: 12 }}>
                <strong
                  style={{
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.filename}
                </strong>
                <small style={{ opacity: 0.55 }}>
                  {item.width || "?"} × {item.height || "?"}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
