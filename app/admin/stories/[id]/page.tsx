"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Media = {
  id: string;
  path: string;
  filename: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
};

type BlockType = "text" | "image" | "gallery" | "quote" | "credits";
type GalleryLayout = "grid" | "feature" | "portrait-pair";

type Block = {
  id: string;
  type: BlockType;
  sort_order: number;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  media_id: string | null;
  gallery_title: string | null;
  gallery_layout: GalleryLayout;
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
  seo_title?: string | null;
  seo_description?: string | null;
  destination_id?: string | null;
  cover_media_id?: string | null;
  published: number;
};

type ApiResult<T = unknown> = {
  success: boolean;
  error?: string;
  story?: T;
  block?: T;
};

const MEDIA_BASE = "https://media.thescenestudio.asia";

function mediaUrl(path: string) {
  return `${MEDIA_BASE}/${path.replace(/^\/+/, "")}`;
}

const blockLabels: Record<BlockType, string> = {
  text: "Text",
  image: "Image",
  gallery: "Gallery",
  quote: "Quote",
  credits: "Credits",
};

export default function StoryEditorPage() {
  const params = useParams();
  const id = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  const loadStory = async () => {
    const res = await fetch(`/api/admin/stories/${id}`, { cache: "no-store" });
    const data = (await res.json()) as {
      success: boolean;
      story: Story;
      blocks: Block[];
      error?: string;
    };
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Failed to load story (${res.status})`);
    }
    setStory(data.story);
    setBlocks(data.blocks || []);
  };

  const loadMedia = async () => {
    setMediaLoading(true);
    try {
      const res = await fetch("/api/admin/media", { cache: "no-store" });
      const data = (await res.json()) as {
        success: boolean;
        media: Media[];
        error?: string;
      };
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to load media (${res.status})`);
      }
      setAllMedia(data.media || []);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to load media");
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setMessage("");
      try {
        await loadStory();
        if (!cancelled) void loadMedia();
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Failed to load story editor");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const saveStory = async () => {
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
          seo_title: story.seo_title,
          seo_description: story.seo_description,
          destination_id: story.destination_id,
          cover_media_id: story.cover_media_id,
          published: Boolean(story.published),
        }),
      });
      const data = (await res.json()) as ApiResult<Story>;
      if (!res.ok || !data.success || !data.story) throw new Error(data.error || "Failed to save story");
      setStory(data.story);
      setMessage("Saved");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to save story");
    } finally {
      setSaving(false);
    }
  };

  const updateBlock = async (blockId: string, patch: Partial<Block>) => {
    setWorking(true);
    try {
      const res = await fetch(`/api/admin/stories/${id}/blocks/${blockId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await res.json()) as ApiResult<Block>;
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update block");
      await loadStory();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to update block");
    } finally {
      setWorking(false);
    }
  };

  const addBlock = async (type: BlockType) => {
    setWorking(true);
    try {
      const res = await fetch(`/api/admin/stories/${id}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, sort_order: blocks.length, gallery_layout: "grid" }),
      });
      const data = (await res.json()) as ApiResult<Block>;
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to add block");
      await loadStory();
      if (data.block) setActiveBlock(data.block.id);
      setMessage(`${blockLabels[type]} block added`);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to add block");
    } finally {
      setWorking(false);
    }
  };

  const deleteBlock = async (blockId: string) => {
    if (!window.confirm("Delete this block?")) return;
    setWorking(true);
    try {
      const res = await fetch(`/api/admin/stories/${id}/blocks/${blockId}`, { method: "DELETE" });
      const data = (await res.json()) as ApiResult;
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete block");
      setActiveBlock(null);
      await loadStory();
      setMessage("Block deleted");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to delete block");
    } finally {
      setWorking(false);
    }
  };

  const updateBlockOrder = async (blockId: string, sort_order: number) => {
    await updateBlock(blockId, { sort_order });
  };

  const moveBlock = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    setWorking(true);
    try {
      const a = blocks[index];
      const b = blocks[target];
      const [ra, rb] = await Promise.all([
        fetch(`/api/admin/stories/${id}/blocks/${a.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: b.sort_order }),
        }),
        fetch(`/api/admin/stories/${id}/blocks/${b.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: a.sort_order }),
        }),
      ]);
      if (!ra.ok || !rb.ok) throw new Error("Failed to reorder blocks");
      await loadStory();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to reorder blocks");
    } finally {
      setWorking(false);
    }
  };

  const addMedia = async (blockId: string, mediaId: string, sort_order: number) => {
    setWorking(true);
    try {
      const res = await fetch(`/api/admin/stories/${id}/blocks/${blockId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_id: mediaId, sort_order }),
      });
      const data = (await res.json()) as ApiResult;
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to add media");
      await loadStory();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to add media");
    } finally {
      setWorking(false);
    }
  };

  const removeMedia = async (blockId: string, mediaId: string) => {
    setWorking(true);
    try {
      const res = await fetch(`/api/admin/stories/${id}/blocks/${blockId}/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_id: mediaId }),
      });
      const data = (await res.json()) as ApiResult;
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to remove media");
      await loadStory();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to remove media");
    } finally {
      setWorking(false);
    }
  };

  const moveMedia = async (block: Block, index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= block.media.length) return;
    setWorking(true);
    try {
      const a = block.media[index];
      const b = block.media[target];
      const [ra, rb] = await Promise.all([
        fetch(`/api/admin/stories/${id}/blocks/${block.id}/media`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ media_id: a.id, sort_order: b.sort_order }),
        }),
        fetch(`/api/admin/stories/${id}/blocks/${block.id}/media`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ media_id: b.id, sort_order: a.sort_order }),
        }),
      ]);
      if (!ra.ok || !rb.ok) throw new Error("Failed to reorder media");
      await loadStory();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to reorder media");
    } finally {
      setWorking(false);
    }
  };

  const mediaById = useMemo(() => new Map(allMedia.map((media) => [media.id, media])), [allMedia]);

  if (loading) {
    return <main style={{ padding: 40 }}>Loading story editor…</main>;
  }

  if (!story) {
    return (
      <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
        <h1>Story Editor</h1>
        <p style={{ color: "#b00020" }}>{message || "Story not found."}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <div>
          <p style={{ marginBottom: 8, opacity: 0.6, fontSize: 14 }}>Story Editor</p>
          <h1 style={{ margin: 0 }}>{story.title}</h1>
        </div>
        <button onClick={saveStory} disabled={saving} style={{ padding: "12px 24px", border: "none", background: "#111", color: "#fff", cursor: saving ? "default" : "pointer" }}>
          {saving ? "Saving…" : "Save Story"}
        </button>
      </div>

      {message && <p style={{ marginBottom: 30, padding: 12, background: "#f3f3f3" }}>{message}</p>}
      {mediaLoading && <p style={{ opacity: 0.6 }}>Loading media library…</p>}

      <section style={{ border: "1px solid #ddd", padding: 24, marginBottom: 40 }}>
        <h2>Story Information</h2>
        <label>Title<input value={story.title} onChange={(e) => setStory({ ...story, title: e.target.value })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6, marginBottom: 20 }} /></label>
        <label>Slug<input value={story.slug} onChange={(e) => setStory({ ...story, slug: e.target.value })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6, marginBottom: 20 }} /></label>
        <label>Description<textarea value={story.description || ""} onChange={(e) => setStory({ ...story, description: e.target.value })} rows={5} style={{ display: "block", width: "100%", padding: 10, marginTop: 6, marginBottom: 20 }} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <label>Location<input value={story.location || ""} onChange={(e) => setStory({ ...story, location: e.target.value })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }} /></label>
          <label>Date<input type="date" value={story.date || ""} onChange={(e) => setStory({ ...story, date: e.target.value })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }} /></label>
          <label>Category<input value={story.category || ""} onChange={(e) => setStory({ ...story, category: e.target.value })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }} /></label>
        </div>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Story Blocks</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {(["text", "image", "gallery", "quote", "credits"] as BlockType[]).map((type) => (
              <button key={type} onClick={() => addBlock(type)} disabled={working} style={{ padding: "8px 12px" }}>+ {blockLabels[type]}</button>
            ))}
          </div>
        </div>

        {blocks.length === 0 ? <p>No blocks.</p> : blocks.map((block, index) => (
          <article key={block.id} style={{ border: "1px solid #ddd", padding: 24, marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ opacity: 0.5, fontSize: 13 }}>{block.type} · Order {block.sort_order}</p>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => moveBlock(index, -1)} disabled={working || index === 0}>↑</button>
                <button onClick={() => moveBlock(index, 1)} disabled={working || index === blocks.length - 1}>↓</button>
                <button onClick={() => deleteBlock(block.id)} disabled={working}>Delete</button>
              </div>
            </div>

            {block.type === "gallery" && (
              <>
                <label>Gallery title<input value={block.gallery_title || ""} onChange={(e) => updateBlock(block.id, { gallery_title: e.target.value || null })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }} /></label>
                <label>Layout<select value={block.gallery_layout || "grid"} onChange={(e) => updateBlock(block.id, { gallery_layout: e.target.value as GalleryLayout })} style={{ display: "block", padding: 10, marginTop: 6, marginBottom: 20 }}><option value="grid">Grid</option><option value="feature">Feature</option><option value="portrait-pair">Portrait pair</option></select></label>
              </>
            )}

            <label>Eyebrow<input value={block.eyebrow || ""} onChange={(e) => updateBlock(block.id, { eyebrow: e.target.value || null })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }} /></label>
            <label>Title<input value={block.title || ""} onChange={(e) => updateBlock(block.id, { title: e.target.value || null })} style={{ display: "block", width: "100%", padding: 10, marginTop: 6, marginBottom: 12 }} /></label>
            <label>Body<textarea value={block.body || ""} onChange={(e) => updateBlock(block.id, { body: e.target.value || null })} rows={4} style={{ display: "block", width: "100%", padding: 10, marginTop: 6, marginBottom: 20 }} /></label>

            {block.media.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
                {block.media.map((media, mediaIndex) => (
                  <div key={media.id} style={{ border: "1px solid #ddd", overflow: "hidden" }}>
                    <img src={mediaUrl(media.path)} alt={media.alt || media.filename} width={media.width || undefined} height={media.height || undefined} loading="lazy" decoding="async" referrerPolicy="no-referrer" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: 10 }}>
                      <strong style={{ display: "block", fontSize: 13 }}>{media.filename}</strong>
                      <small style={{ opacity: 0.6 }}>{media.width} × {media.height}</small>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button onClick={() => moveMedia(block, mediaIndex, -1)} disabled={working || mediaIndex === 0}>←</button>
                        <button onClick={() => moveMedia(block, mediaIndex, 1)} disabled={working || mediaIndex === block.media.length - 1}>→</button>
                        <button onClick={() => removeMedia(block.id, media.id)} disabled={working}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {block.type === "gallery" && (
              <div style={{ marginTop: 20 }}>
                <h4>Add media</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
                  {allMedia.filter((media) => !block.media.some((item) => item.id === media.id)).slice(0, 40).map((media) => (
                    <button key={media.id} onClick={() => addMedia(block.id, media.id, block.media.length)} disabled={working} style={{ textAlign: "left", padding: 6, background: "#fff", border: "1px solid #ddd" }}>
                      <img src={mediaUrl(media.path)} alt={media.alt || media.filename} style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
                      <small>{media.filename}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
