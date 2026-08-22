"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { mediaUrl } from "../../../../lib/media";

type Media = {
  id: string;
  collection_id?: string | null;
  type?: string;
  path: string;
  filename: string;
  alt: string | null;
  width: number;
  height: number;
  sort_order: number;
};

type Block = {
  id: string;
  type: string;
  sort_order: number;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  media: Media[];
};

type Story = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  date: string | null;
  category: string | null;
  description: string | null;
  published: number;
};

type StoryResponse = {
  success: boolean;
  story: Story;
  blocks: Block[];
  error?: string;
};

type MediaResponse = {
  success: boolean;
  media: Media[];
  error?: string;
};

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

export default function StoryEditorPage() {
  const params = useParams();
  const id = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [allMedia, setAllMedia] = useState<Media[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState(false);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [selectedMedia, setSelectedMedia] = useState<Record<string, string>>({});

  useEffect(() => {
    loadStory();
    loadMedia();
  }, [id]);

  async function loadStory() {
    try {
      const res = await fetch(`/api/admin/stories/${id}`);
      const data = (await res.json()) as StoryResponse;

      if (!data.success) {
        throw new Error(data.error || "Failed to load story");
      }

      setStory(data.story);
      setBlocks(data.blocks || []);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load story");
    } finally {
      setLoading(false);
    }
  }

  async function loadMedia() {
    try {
      const res = await fetch("/api/admin/media");
      const data = (await res.json()) as MediaResponse;

      if (!data.success) {
        throw new Error(data.error || "Failed to load media");
      }

      setAllMedia(data.media || []);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load media library");
    }
  }

  async function saveStory() {
    if (!story) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: story.title,
          slug: story.slug,
          location: story.location,
          date: story.date,
          category: story.category,
          description: story.description,
        }),
      });

      const data = (await res.json()) as {
        success: boolean;
        story: Story;
        error?: string;
      };

      if (!data.success) {
        throw new Error(data.error || "Failed to save");
      }

      setStory(data.story);
      setMessage("Story saved");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save story");
    } finally {
      setSaving(false);
    }
  }

  async function addMedia(blockId: string, mediaId: string, sortOrder?: number) {
    const block = blocks.find((item) => item.id === blockId);
    if (!block || !mediaId) return;

    if (block.media.some((media) => media.id === mediaId)) {
      return;
    }

    const res = await fetch(`/api/admin/stories/${id}/blocks/${blockId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_id: mediaId,
        sort_order: sortOrder ?? block.media.length,
      }),
    });

    const data = (await res.json()) as { success: boolean; error?: string };

    if (!data.success) {
      throw new Error(data.error || "Failed to add media");
    }
  }

  async function uploadMedia(blockId: string, files: FileList | null) {
    if (!story || !files || files.length === 0) return;

    setUploadingBlockId(blockId);
    setWorking(true);
    setMessage("");

    try {
      const block = blocks.find((item) => item.id === blockId);
      if (!block) throw new Error("Story block not found");

      let nextSortOrder = block.media.length;
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
        form.append("story_slug", story.slug);
        form.append("alt", file.name.replace(/\.[^/.]+$/, ""));
        form.append("width", String(dimensions.width));
        form.append("height", String(dimensions.height));

        const uploadResponse = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: form,
        });

        const uploadData = (await uploadResponse.json()) as {
          success: boolean;
          media?: Media;
          error?: string;
        };

        if (!uploadResponse.ok || !uploadData.success || !uploadData.media) {
          throw new Error(uploadData.error || `Failed to upload ${file.name}`);
        }

        await addMedia(blockId, uploadData.media.id, nextSortOrder);
        nextSortOrder += 1;
        uploaded += 1;
      }

      await Promise.all([loadStory(), loadMedia()]);
      setMessage(`${uploaded} image${uploaded === 1 ? "" : "s"} uploaded to R2`);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to upload media");
      await Promise.all([loadStory(), loadMedia()]);
    } finally {
      setUploadingBlockId(null);
      setWorking(false);
    }
  }

  async function removeMedia(blockId: string, mediaId: string) {
    setWorking(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/stories/${id}/blocks/${blockId}/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_id: mediaId }),
      });

      const data = (await res.json()) as { success: boolean; error?: string };

      if (!data.success) {
        throw new Error(data.error || "Failed to remove media");
      }

      await loadStory();
      setMessage("Media removed");
    } catch (error) {
      console.error(error);
      setMessage("Failed to remove media");
    } finally {
      setWorking(false);
    }
  }

  async function moveMedia(blockId: string, mediaId: string, direction: "up" | "down") {
    const block = blocks.find((item) => item.id === blockId);
    if (!block) return;

    const currentIndex = block.media.findIndex((media) => media.id === mediaId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= block.media.length) return;

    const currentMedia = block.media[currentIndex];
    const targetMedia = block.media[newIndex];

    setWorking(true);
    setMessage("");

    try {
      const first = await fetch(`/api/admin/stories/${id}/blocks/${blockId}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_id: currentMedia.id, sort_order: targetMedia.sort_order }),
      });

      if (!first.ok) throw new Error("Failed to reorder media");

      const second = await fetch(`/api/admin/stories/${id}/blocks/${blockId}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_id: targetMedia.id, sort_order: currentMedia.sort_order }),
      });

      if (!second.ok) throw new Error("Failed to reorder media");

      await loadStory();
      setMessage("Gallery order updated");
    } catch (error) {
      console.error(error);
      setMessage("Failed to reorder gallery");
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 40 }}>Loading...</main>;
  }

  if (!story) {
    return <main style={{ padding: 40 }}>Story not found.</main>;
  }

  return (
    <main style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <div>
          <p style={{ marginBottom: 8, opacity: 0.6, fontSize: 14 }}>Story Editor</p>
          <h1 style={{ margin: 0 }}>{story.title}</h1>
        </div>

        <button
          onClick={saveStory}
          disabled={saving}
          style={{ padding: "12px 24px", border: "none", background: "#111", color: "#fff", cursor: saving ? "default" : "pointer" }}
        >
          {saving ? "Saving..." : "Save Story"}
        </button>
      </div>

      {message && <p style={{ marginBottom: 30, padding: 12, background: "#f3f3f3" }}>{message}</p>}

      <section style={{ border: "1px solid #ddd", padding: 24, marginBottom: 40 }}>
        <h2>Story Information</h2>

        <label>
          Title
          <input value={story.title} onChange={(e) => setStory({ ...story, title: e.target.value })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6, marginBottom: 20 }} />
        </label>

        <label>
          Slug
          <input value={story.slug} onChange={(e) => setStory({ ...story, slug: e.target.value })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6, marginBottom: 20 }} />
        </label>

        <label>
          Description
          <textarea value={story.description || ""} onChange={(e) => setStory({ ...story, description: e.target.value })} rows={5} style={{ display: "block", width: "100%", padding: 10, marginTop: 6, marginBottom: 20 }} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <label>
            Location
            <input value={story.location || ""} onChange={(e) => setStory({ ...story, location: e.target.value })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }} />
          </label>

          <label>
            Date
            <input type="date" value={story.date || ""} onChange={(e) => setStory({ ...story, date: e.target.value })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }} />
          </label>

          <label>
            Category
            <input value={story.category || ""} onChange={(e) => setStory({ ...story, category: e.target.value })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }} />
          </label>
        </div>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Story Blocks</h2>
          <span style={{ fontSize: 13, opacity: 0.5 }}>{blocks.length} blocks</span>
        </div>

        {blocks.length === 0 ? (
          <p>No blocks.</p>
        ) : (
          blocks.map((block) => {
            const usedMediaIds = new Set(block.media.map((media) => media.id));
            const availableMedia = allMedia.filter((media) => !usedMediaIds.has(media.id));
            const uploading = uploadingBlockId === block.id;

            return (
              <div key={block.id} style={{ border: "1px solid #ddd", padding: 24, marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <p style={{ opacity: 0.5, fontSize: 13, marginBottom: 8 }}>{block.type} · Order {block.sort_order}</p>
                    {block.eyebrow && <p style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, opacity: 0.6, marginBottom: 8 }}>{block.eyebrow}</p>}
                    <h3 style={{ margin: 0 }}>{block.title || "Untitled block"}</h3>
                  </div>
                  <span style={{ fontSize: 13, opacity: 0.5 }}>{block.media.length} media</span>
                </div>

                {block.body && <p style={{ lineHeight: 1.6, marginBottom: 30 }}>{block.body}</p>}

                <div style={{ padding: 16, background: "#f7f7f7", marginBottom: 24 }}>
                  <strong style={{ display: "block", marginBottom: 10 }}>Add Media</strong>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <select
                      value={selectedMedia[block.id] || ""}
                      onChange={(e) => setSelectedMedia((current) => ({ ...current, [block.id]: e.target.value }))}
                      disabled={working}
                      style={{ flex: 1, minWidth: 220, padding: 10, border: "1px solid #ccc", background: "#fff" }}
                    >
                      <option value="">Select an existing image...</option>
                      {availableMedia.map((media) => (
                        <option key={media.id} value={media.id}>
                          {media.filename} · {media.width} × {media.height}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={async () => {
                        const mediaId = selectedMedia[block.id];
                        if (!mediaId) return;
                        setWorking(true);
                        setMessage("");
                        try {
                          await addMedia(block.id, mediaId);
                          setSelectedMedia((current) => ({ ...current, [block.id]: "" }));
                          await loadStory();
                          setMessage("Media added");
                        } catch (error) {
                          console.error(error);
                          setMessage("Failed to add media");
                        } finally {
                          setWorking(false);
                        }
                      }}
                      disabled={working || !selectedMedia[block.id]}
                      style={{ padding: "10px 20px", border: "none", background: working || !selectedMedia[block.id] ? "#ccc" : "#111", color: "#fff", cursor: working || !selectedMedia[block.id] ? "default" : "pointer" }}
                    >
                      Add
                    </button>

                    <label
                      style={{ padding: "10px 20px", background: uploading ? "#ccc" : "#111", color: "#fff", cursor: uploading ? "default" : "pointer" }}
                    >
                      {uploading ? "Uploading..." : "Upload images"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={working}
                        onChange={(e) => {
                          void uploadMedia(block.id, e.target.files);
                          e.currentTarget.value = "";
                        }}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>

                  <small style={{ display: "block", marginTop: 10, opacity: 0.5 }}>
                    JPEG, PNG or WebP · max 5 MB each · stored in Cloudflare R2
                  </small>
                </div>

                {block.media.length > 0 ? (
                  <div>
                    <h4 style={{ marginBottom: 16 }}>Gallery</h4>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
                      {block.media.map((media, index) => (
                        <div key={media.id} style={{ border: "1px solid #ddd", overflow: "hidden", background: "#fff" }}>
                          <img
                            src={mediaUrl(media.path)}
                            alt={media.alt || media.filename}
                            width={media.width}
                            height={media.height}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            style={{ width: "100%", height: "auto", aspectRatio: "3 / 2", objectFit: "cover", display: "block" }}
                          />

                          <div style={{ padding: 12 }}>
                            <strong style={{ display: "block", fontSize: 13, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {media.filename}
                            </strong>

                            <small style={{ display: "block", opacity: 0.5, marginBottom: 12 }}>
                              {media.width} × {media.height}
                            </small>

                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => void moveMedia(block.id, media.id, "up")} disabled={working || index === 0} style={{ padding: "6px 10px", border: "1px solid #ddd", background: index === 0 ? "#eee" : "#fff", cursor: index === 0 ? "default" : "pointer" }}>↑</button>
                              <button onClick={() => void moveMedia(block.id, media.id, "down")} disabled={working || index === block.media.length - 1} style={{ padding: "6px 10px", border: "1px solid #ddd", background: index === block.media.length - 1 ? "#eee" : "#fff", cursor: index === block.media.length - 1 ? "default" : "pointer" }}>↓</button>
                              <button onClick={() => void removeMedia(block.id, media.id)} disabled={working} style={{ padding: "6px 10px", border: "1px solid #ddd", background: "#fff", color: "#b00020", cursor: "pointer", marginLeft: "auto" }}>Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 30, background: "#f7f7f7", textAlign: "center", opacity: 0.6 }}>
                    This block has no media.
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
