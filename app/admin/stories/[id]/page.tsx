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
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  const loadStory = async () => {
    const res = await fetch(`/api/admin/stories/${id}`);
    const data = (await res.json()) as {
      success: boolean;
      story: Story;
      blocks: Block[];
      error?: string;
    };
    if (!data.success) throw new Error(data.error || "Failed to load story");
    setStory(data.story);
    setBlocks(data.blocks || []);
  };

  const loadMedia = async () => {
    const res = await fetch("/api/admin/media");
    const data = (await res.json()) as { success: boolean; media: Media[]; error?: string };
    if (!data.success) throw new Error(data.error || "Failed to load media");
    setAllMedia(data.media || []);
  };

  useEffect(() => {
    Promise.all([loadStory(), loadMedia()])
      .catch((error) => {
        console.error(error);
        setMessage(error instanceof Error ? error.message : "Failed to load editor");
      })
      .finally(() => setLoading(false));
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
      if (!data.success || !data.story) throw new Error(data.error || "Failed to save story");
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
      if (!data.success) throw new Error(data.error || "Failed to update block");
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
        body: JSON.stringify({
          type,
          sort_order: blocks.length,
          gallery_layout: "grid",
        }),
      });
      const data = (await res.json()) as ApiResult<Block>;
      if (!data.success) throw new Error(data.error || "Failed to add block");
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
      if (!data.success) throw new Error(data.error || "Failed to delete block");
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

  const moveBlock = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    setWorking(true);
    try {
      const a = blocks[index];
      const b = blocks[target];
      await Promise.all([
        updateBlockOrder(a.id, b.sort_order),
        updateBlockOrder(b.id, a.sort_order),
      ]);
      await loadStory();
    } catch (error) {
      console.error(error);
      setMessage("Failed to reorder blocks");
    } finally {
      setWorking(false);
    }
  };

  const updateBlockOrder = async (blockId: string, sortOrder: number) => {
    const res = await fetch(`/api/admin/stories/${id}/blocks/${blockId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sort_order: sortOrder }),
    });
    const data = (await res.json()) as ApiResult;
    if (!data.success) throw new Error(data.error || "Failed to reorder block");
  };

  const addMedia = async (block: Block, mediaId: string) => {
    if (!mediaId) return;
    setWorking(true);
    try {
      const res = await fetch(`/api/admin/stories/${id}/blocks/${block.id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_id: mediaId, sort_order: block.media.length }),
      });
      const data = (await res.json()) as ApiResult;
      if (!data.success) throw new Error(data.error || "Failed to add media");
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
      if (!data.success) throw new Error(data.error || "Failed to remove media");
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
    const a = block.media[index];
    const b = block.media[target];
    setWorking(true);
    try {
      await Promise.all([
        patchMediaOrder(block.id, a.id, b.sort_order),
        patchMediaOrder(block.id, b.id, a.sort_order),
      ]);
      await loadStory();
    } catch (error) {
      console.error(error);
      setMessage("Failed to reorder media");
    } finally {
      setWorking(false);
    }
  };

  const patchMediaOrder = async (blockId: string, mediaId: string, sort_order: number) => {
    const res = await fetch(`/api/admin/stories/${id}/blocks/${blockId}/media`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_id: mediaId, sort_order }),
    });
    const data = (await res.json()) as ApiResult;
    if (!data.success) throw new Error(data.error || "Failed to reorder media");
  };

  const setBlockMedia = (block: Block, mediaId: string) => {
    updateBlock(block.id, { media_id: mediaId || null });
  };

  const unusedMedia = useMemo(() => new Map(allMedia.map((media) => [media.id, media])), [allMedia]);

  if (loading) return <main style={styles.loading}>Loading story editor…</main>;
  if (!story) return <main style={styles.loading}>Story not found.</main>;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>STORIES / EDITOR</div>
          <h1 style={styles.title}>{story.title || "Untitled story"}</h1>
          <div style={styles.subtle}>{story.slug}</div>
        </div>
        <div style={styles.headerActions}>
          {message && <span style={styles.saved}>{message}</span>}
          <button
            type="button"
            onClick={() => setStory({ ...story, published: story.published ? 0 : 1 })}
            style={story.published ? styles.publishOn : styles.publishOff}
          >
            {story.published ? "Published" : "Draft"}
          </button>
          <button type="button" onClick={saveStory} disabled={saving || working} style={styles.saveButton}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      <div style={styles.layout}>
        <section>
          <div style={styles.canvasHeader}>
            <div>
              <div style={styles.kicker}>STORY CONTENT</div>
              <h2 style={styles.sectionTitle}>Editorial layout</h2>
            </div>
            <span style={styles.counter}>{blocks.length} blocks</span>
          </div>

          {blocks.map((block, index) => {
            const selectedIds = new Set(block.media.map((media) => media.id));
            return (
              <article
                key={block.id}
                style={{
                  ...styles.block,
                  ...(activeBlock === block.id ? styles.blockActive : {}),
                }}
                onClick={() => setActiveBlock(block.id)}
              >
                <div style={styles.blockTop}>
                  <div style={styles.blockBadge}>{index + 1} · {blockLabels[block.type] || block.type}</div>
                  <div style={styles.blockActions}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); moveBlock(index, -1); }} disabled={index === 0 || working} style={styles.iconButton}>↑</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); moveBlock(index, 1); }} disabled={index === blocks.length - 1 || working} style={styles.iconButton}>↓</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} disabled={working} style={styles.deleteButton}>Delete</button>
                  </div>
                </div>

                {(block.type === "text" || block.type === "image" || block.type === "gallery") && (
                  <div style={styles.fields}>
                    <label style={styles.field}>
                      <span style={styles.label}>Eyebrow</span>
                      <input value={block.eyebrow || ""} onChange={(e) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, eyebrow: e.target.value } : item))} onBlur={(e) => updateBlock(block.id, { eyebrow: e.target.value })} style={styles.input} />
                    </label>
                    <label style={styles.field}>
                      <span style={styles.label}>Title</span>
                      <input value={block.title || ""} onChange={(e) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, title: e.target.value } : item))} onBlur={(e) => updateBlock(block.id, { title: e.target.value })} style={styles.input} />
                    </label>
                    {block.type === "text" && (
                      <label style={styles.field}>
                        <span style={styles.label}>Body</span>
                        <textarea value={block.body || ""} onChange={(e) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, body: e.target.value } : item))} onBlur={(e) => updateBlock(block.id, { body: e.target.value })} rows={6} style={styles.textarea} />
                      </label>
                    )}
                  </div>
                )}

                {block.type === "image" && (
                  <div style={styles.mediaSection}>
                    <label style={styles.field}>
                      <span style={styles.label}>Image</span>
                      <select value={block.media_id || ""} onChange={(e) => setBlockMedia(block, e.target.value)} style={styles.input}>
                        <option value="">Select image…</option>
                        {allMedia.map((media) => <option key={media.id} value={media.id}>{media.filename}</option>)}
                      </select>
                    </label>
                    {block.media_id && unusedMedia.get(block.media_id) && (
                      <img src={mediaUrl(unusedMedia.get(block.media_id)!.path)} alt={unusedMedia.get(block.media_id)!.alt || ""} style={styles.heroPreview} />
                    )}
                  </div>
                )}

                {block.type === "gallery" && (
                  <div style={styles.mediaSection}>
                    <div style={styles.twoCols}>
                      <label style={styles.field}>
                        <span style={styles.label}>Gallery title</span>
                        <input value={block.gallery_title || ""} onChange={(e) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, gallery_title: e.target.value } : item))} onBlur={(e) => updateBlock(block.id, { gallery_title: e.target.value })} style={styles.input} />
                      </label>
                      <label style={styles.field}>
                        <span style={styles.label}>Layout</span>
                        <select value={block.gallery_layout || "grid"} onChange={(e) => updateBlock(block.id, { gallery_layout: e.target.value as GalleryLayout })} style={styles.input}>
                          <option value="grid">Grid</option>
                          <option value="feature">Feature</option>
                          <option value="portrait-pair">Portrait pair</option>
                        </select>
                      </label>
                    </div>

                    <div style={styles.addMediaRow}>
                      <select defaultValue="" disabled={working} onChange={(e) => { const value = e.target.value; if (value) addMedia(block, value); e.currentTarget.value = ""; }} style={styles.input}>
                        <option value="">Add image to gallery…</option>
                        {allMedia.filter((media) => !selectedIds.has(media.id)).map((media) => <option key={media.id} value={media.id}>{media.filename}</option>)}
                      </select>
                    </div>

                    <div style={styles.galleryGrid}>
                      {block.media.map((media, mediaIndex) => (
                        <div key={media.id} style={styles.mediaCard}>
                          <img src={mediaUrl(media.path)} alt={media.alt || media.filename} style={styles.mediaThumb} />
                          <div style={styles.mediaMeta}>
                            <div style={styles.mediaName}>{media.filename}</div>
                            <div style={styles.mediaControls}>
                              <button type="button" disabled={mediaIndex === 0 || working} onClick={() => moveMedia(block, mediaIndex, -1)} style={styles.iconButton}>↑</button>
                              <button type="button" disabled={mediaIndex === block.media.length - 1 || working} onClick={() => moveMedia(block, mediaIndex, 1)} style={styles.iconButton}>↓</button>
                              <button type="button" disabled={working} onClick={() => removeMedia(block.id, media.id)} style={styles.deleteButton}>Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {block.type === "quote" && (
                  <label style={styles.field}>
                    <span style={styles.label}>Quote</span>
                    <textarea value={block.body || ""} onChange={(e) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, body: e.target.value } : item))} onBlur={(e) => updateBlock(block.id, { body: e.target.value })} rows={5} style={styles.quoteInput} />
                  </label>
                )}

                {block.type === "credits" && (
                  <label style={styles.field}>
                    <span style={styles.label}>Credits</span>
                    <textarea value={block.body || ""} onChange={(e) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, body: e.target.value } : item))} onBlur={(e) => updateBlock(block.id, { body: e.target.value })} rows={6} placeholder="Photography — The Scene Studio\nPlanning — …" style={styles.textarea} />
                  </label>
                )}
              </article>
            );
          })}

          <div style={styles.addBlock}>
            <div style={styles.kicker}>ADD CONTENT</div>
            <div style={styles.addGrid}>
              {(Object.keys(blockLabels) as BlockType[]).map((type) => (
                <button key={type} type="button" disabled={working} onClick={() => addBlock(type)} style={styles.addButton}>
                  <strong>＋ {blockLabels[type]}</strong>
                  <span>{type === "gallery" ? "Multiple images" : type === "image" ? "Single image" : type === "text" ? "Editorial copy" : type === "quote" ? "Pull quote" : "Credits"}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside style={styles.sidebar}>
          <div style={styles.sideCard}>
            <div style={styles.kicker}>STORY</div>
            <h3 style={styles.sideTitle}>Information</h3>
            <label style={styles.field}><span style={styles.label}>Title</span><input value={story.title} onChange={(e) => setStory({ ...story, title: e.target.value })} style={styles.input} /></label>
            <label style={styles.field}><span style={styles.label}>Slug</span><input value={story.slug} onChange={(e) => setStory({ ...story, slug: e.target.value })} style={styles.input} /></label>
            <label style={styles.field}><span style={styles.label}>Location</span><input value={story.location || ""} onChange={(e) => setStory({ ...story, location: e.target.value })} style={styles.input} /></label>
            <label style={styles.field}><span style={styles.label}>Date</span><input value={story.date || ""} onChange={(e) => setStory({ ...story, date: e.target.value })} style={styles.input} /></label>
            <label style={styles.field}><span style={styles.label}>Category</span><input value={story.category || ""} onChange={(e) => setStory({ ...story, category: e.target.value })} style={styles.input} /></label>
            <label style={styles.field}><span style={styles.label}>Description</span><textarea value={story.description || ""} onChange={(e) => setStory({ ...story, description: e.target.value })} rows={5} style={styles.textarea} /></label>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.kicker}>COVER</div>
            <h3 style={styles.sideTitle}>Hero image</h3>
            <select value={story.cover_media_id || ""} onChange={(e) => setStory({ ...story, cover_media_id: e.target.value || null })} style={styles.input}>
              <option value="">Select cover…</option>
              {allMedia.map((media) => <option key={media.id} value={media.id}>{media.filename}</option>)}
            </select>
            {story.cover_media_id && unusedMedia.get(story.cover_media_id) && <img src={mediaUrl(unusedMedia.get(story.cover_media_id)!.path)} alt="Cover" style={styles.coverPreview} />}
          </div>

          <div style={styles.sideCard}>
            <div style={styles.kicker}>SEO</div>
            <h3 style={styles.sideTitle}>Search preview</h3>
            <label style={styles.field}><span style={styles.label}>SEO title</span><input value={story.seo_title || ""} onChange={(e) => setStory({ ...story, seo_title: e.target.value })} style={styles.input} /></label>
            <label style={styles.field}><span style={styles.label}>SEO description</span><textarea value={story.seo_description || ""} onChange={(e) => setStory({ ...story, seo_description: e.target.value })} rows={5} style={styles.textarea} /></label>
          </div>
        </aside>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f4f1", color: "#181818", paddingBottom: 80 },
  loading: { minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Arial, sans-serif" },
  header: { position: "sticky", top: 0, zIndex: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 30, padding: "18px 32px", background: "rgba(245,244,241,.96)", borderBottom: "1px solid #dedbd4", backdropFilter: "blur(12px)" },
  headerActions: { display: "flex", alignItems: "center", gap: 10 },
  kicker: { fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#77736c" },
  title: { margin: "6px 0 2px", fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 28 },
  subtle: { fontSize: 12, color: "#8a867f" },
  saved: { fontSize: 12, color: "#6b6862", marginRight: 8 },
  saveButton: { border: 0, background: "#171717", color: "#fff", padding: "11px 22px", cursor: "pointer" },
  publishOn: { border: "1px solid #b9c9b7", background: "#e8f0e6", color: "#31502f", padding: "10px 14px", cursor: "pointer" },
  publishOff: { border: "1px solid #d5d1ca", background: "#fff", color: "#77736c", padding: "10px 14px", cursor: "pointer" },
  layout: { maxWidth: 1500, margin: "0 auto", padding: "32px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 28 },
  canvasHeader: { display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 18 },
  sectionTitle: { margin: "5px 0 0", fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 25 },
  counter: { fontSize: 12, color: "#77736c" },
  block: { background: "#fff", border: "1px solid #dedbd4", marginBottom: 16, padding: 22, transition: "border-color .15s, box-shadow .15s" },
  blockActive: { borderColor: "#9d988f", boxShadow: "0 8px 25px rgba(0,0,0,.04)" },
  blockTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  blockBadge: { fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "#77736c" },
  blockActions: { display: "flex", gap: 6 },
  iconButton: { minWidth: 34, height: 32, border: "1px solid #d9d5ce", background: "#fff", cursor: "pointer" },
  deleteButton: { border: "1px solid #ddd7d0", background: "#fff", color: "#8a3d36", padding: "7px 10px", cursor: "pointer" },
  fields: { display: "grid", gap: 16 },
  field: { display: "grid", gap: 7, marginBottom: 14 },
  label: { fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#77736c" },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #d9d5ce", background: "#fff", padding: "11px 12px", fontSize: 14, outline: "none" },
  textarea: { width: "100%", boxSizing: "border-box", border: "1px solid #d9d5ce", background: "#fff", padding: "11px 12px", fontSize: 14, lineHeight: 1.6, resize: "vertical", outline: "none" },
  quoteInput: { width: "100%", boxSizing: "border-box", border: "0", background: "#f5f3ef", padding: "28px", fontFamily: "Georgia, serif", fontSize: 25, lineHeight: 1.35, resize: "vertical" },
  mediaSection: { marginTop: 18 },
  twoCols: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  addMediaRow: { margin: "10px 0 18px" },
  galleryGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 },
  mediaCard: { border: "1px solid #dedbd4", background: "#faf9f7", overflow: "hidden" },
  mediaThumb: { width: "100%", aspectRatio: "3 / 2", objectFit: "cover", display: "block" },
  mediaMeta: { padding: 9 },
  mediaName: { fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 8 },
  mediaControls: { display: "flex", gap: 5 },
  heroPreview: { width: "100%", marginTop: 12, display: "block", aspectRatio: "3 / 2", objectFit: "cover" },
  addBlock: { border: "1px dashed #c9c5bd", background: "#faf9f7", padding: 20, marginTop: 22 },
  addGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 12 },
  addButton: { minHeight: 78, textAlign: "left", border: "1px solid #dedbd4", background: "#fff", padding: 12, cursor: "pointer", display: "grid", alignContent: "center", gap: 5 },
  sidebar: { display: "grid", alignContent: "start", gap: 16 },
  sideCard: { background: "#fff", border: "1px solid #dedbd4", padding: 20 },
  sideTitle: { margin: "6px 0 18px", fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 20 },
  coverPreview: { width: "100%", marginTop: 12, display: "block", aspectRatio: "3 / 2", objectFit: "cover" },
};
