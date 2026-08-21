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

const blockDescriptions: Record<BlockType, string> = {
  text: "A section of editorial copy",
  image: "One large editorial photograph",
  gallery: "A curated sequence of photographs",
  quote: "A highlighted quote or vow",
  credits: "Vendors and production credits",
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
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [mediaPicker, setMediaPicker] = useState<string | null>(null);
  const [mediaSearch, setMediaSearch] = useState("");

  const loadStory = async () => {
    const res = await fetch(`/api/admin/stories/${id}`, { cache: "no-store" });
    const data = (await res.json()) as { success: boolean; story: Story; blocks: Block[]; error?: string };
    if (!res.ok || !data.success) throw new Error(data.error || `Failed to load story (${res.status})`);
    setStory(data.story);
    setBlocks(data.blocks || []);
  };

  const loadMedia = async () => {
    setMediaLoading(true);
    try {
      const res = await fetch("/api/admin/media", { cache: "no-store" });
      const data = (await res.json()) as { success: boolean; media: Media[]; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error || `Failed to load media (${res.status})`);
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
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Failed to load story editor");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void init();
    return () => { cancelled = true; };
  }, [id]);

  const request = async <T,>(url: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(url, { ...options, cache: "no-store" });
    const data = (await res.json()) as ApiResult<T>;
    if (!res.ok || !data.success) throw new Error(data.error || `Request failed (${res.status})`);
    return data as T;
  };

  const saveStory = async () => {
    if (!story) return;
    setSaving(true);
    setMessage("");
    try {
      const result = await request<{ story: Story }>(`/api/admin/stories/${id}`, {
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
      if (result.story) setStory(result.story);
      setMessage("Saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save story");
    } finally {
      setSaving(false);
    }
  };

  const updateBlock = async (blockId: string, patch: Partial<Block>) => {
    setWorking(true);
    try {
      await request(`/api/admin/stories/${id}/blocks/${blockId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      await loadStory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update block");
    } finally {
      setWorking(false);
    }
  };

  const addBlock = async (type: BlockType) => {
    setWorking(true);
    setShowAddMenu(false);
    try {
      const result = await request<{ block: Block }>(`/api/admin/stories/${id}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, sort_order: blocks.length, gallery_layout: "grid" }),
      });
      await loadStory();
      if (result.block) setActiveBlock(result.block.id);
      setMessage(`${blockLabels[type]} block added`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to add block");
    } finally {
      setWorking(false);
    }
  };

  const deleteBlock = async (blockId: string) => {
    if (!window.confirm("Delete this block?")) return;
    setWorking(true);
    try {
      await request(`/api/admin/stories/${id}/blocks/${blockId}`, { method: "DELETE" });
      setActiveBlock(null);
      await loadStory();
      setMessage("Block deleted");
    } catch (error) {
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
        request(`/api/admin/stories/${id}/blocks/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: b.sort_order }) }),
        request(`/api/admin/stories/${id}/blocks/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: a.sort_order }) }),
      ]);
      await loadStory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to reorder blocks");
    } finally {
      setWorking(false);
    }
  };

  const addMedia = async (blockId: string, mediaId: string, sortOrder: number) => {
    setWorking(true);
    try {
      await request(`/api/admin/stories/${id}/blocks/${blockId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_id: mediaId, sort_order: sortOrder }),
      });
      setMediaPicker(null);
      await loadStory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to add media");
    } finally {
      setWorking(false);
    }
  };

  const removeMedia = async (blockId: string, mediaId: string) => {
    setWorking(true);
    try {
      await request(`/api/admin/stories/${id}/blocks/${blockId}/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_id: mediaId }),
      });
      await loadStory();
    } catch (error) {
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
      await Promise.all([
        request(`/api/admin/stories/${id}/blocks/${block.id}/media`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ media_id: a.id, sort_order: b.sort_order }) }),
        request(`/api/admin/stories/${id}/blocks/${block.id}/media`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ media_id: b.id, sort_order: a.sort_order }) }),
      ]);
      await loadStory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to reorder media");
    } finally {
      setWorking(false);
    }
  };

  const filteredMedia = useMemo(() => {
    const q = mediaSearch.trim().toLowerCase();
    if (!q) return allMedia;
    return allMedia.filter((media) => `${media.filename} ${media.alt || ""}`.toLowerCase().includes(q));
  }, [allMedia, mediaSearch]);

  if (loading) {
    return <main className="min-h-screen bg-[#f7f5f0] px-6 pt-28 text-[#171717]"><div className="mx-auto max-w-7xl"><p className="font-sans text-[10px] uppercase tracking-[0.28em] opacity-50">The Scene Studio / Story Editor</p><div className="mt-12 h-1 w-24 animate-pulse bg-[#171717]/15" /></div></main>;
  }

  if (!story) {
    return <main className="min-h-screen bg-[#f7f5f0] px-6 pt-28 text-[#171717]"><div className="mx-auto max-w-2xl"><p className="font-sans text-[10px] uppercase tracking-[0.28em] opacity-50">Story Editor</p><h1 className="mt-5 font-serif text-5xl tracking-[-0.04em]">Unable to open story.</h1><p className="mt-5 font-sans text-sm text-red-700">{message || "Story not found."}</p></div></main>;
  }

  const active = blocks.find((block) => block.id === activeBlock) || null;

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f0]/95 px-5 py-4 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6">
          <div className="min-w-0">
            <a href="/admin/stories" className="font-sans text-[9px] uppercase tracking-[0.28em] opacity-50 hover:opacity-100">← Stories</a>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="truncate font-serif text-xl tracking-[-0.03em] md:text-2xl">{story.title}</h1>
              <span className={`hidden rounded-full px-2 py-1 font-sans text-[8px] uppercase tracking-[0.18em] sm:inline-flex ${story.published ? "bg-[#263a2d] text-white" : "bg-black/8 text-black/55"}`}>{story.published ? "Published" : "Draft"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <a href={`/stories/${story.slug}`} target="_blank" rel="noreferrer" className="hidden border border-black/15 px-4 py-2 font-sans text-[9px] uppercase tracking-[0.2em] hover:bg-black hover:text-white md:inline-block">Preview ↗</a>
            <button onClick={saveStory} disabled={saving || working} className="bg-[#171717] px-5 py-2.5 font-sans text-[9px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-75 disabled:opacity-40">{saving ? "Saving…" : "Save"}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[230px_minmax(0,1fr)_310px]">
        <aside className="border-r border-black/10 px-5 py-7 lg:min-h-[calc(100vh-73px)]">
          <div className="flex items-center justify-between">
            <p className="font-sans text-[9px] uppercase tracking-[0.24em] opacity-50">Story structure</p>
            <button onClick={() => setShowAddMenu((value) => !value)} className="text-xl leading-none opacity-60 hover:opacity-100">+</button>
          </div>
          {showAddMenu && (
            <div className="mt-3 overflow-hidden border border-black/10 bg-white shadow-sm">
              {(Object.keys(blockLabels) as BlockType[]).map((type) => (
                <button key={type} onClick={() => addBlock(type)} disabled={working} className="block w-full border-b border-black/5 px-3 py-3 text-left last:border-0 hover:bg-[#ece9e2] disabled:opacity-40">
                  <span className="block font-serif text-base">{blockLabels[type]}</span>
                  <span className="mt-0.5 block font-sans text-[8px] uppercase tracking-[0.12em] opacity-45">{blockDescriptions[type]}</span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-5 space-y-1">
            {blocks.map((block, index) => (
              <button key={block.id} onClick={() => setActiveBlock(block.id)} className={`group flex w-full items-center gap-3 px-2.5 py-3 text-left transition ${activeBlock === block.id ? "bg-black text-white" : "hover:bg-black/5"}`}>
                <span className="w-5 font-sans text-[9px] opacity-40">{String(index + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-sans text-[10px] uppercase tracking-[0.14em]">{blockLabels[block.type]}</span>
                <span className="text-[10px] opacity-35">{block.type === "gallery" ? block.media.length : ""}</span>
              </button>
            ))}
          </div>
          {blocks.length === 0 && <p className="mt-5 font-serif text-lg opacity-40">Start building the story.</p>}
        </aside>

        <section className="min-w-0 px-5 py-8 md:px-10 lg:px-12">
          <div className="mx-auto max-w-[900px]">
            <div className="mb-10 border-b border-black/10 pb-8">
              <p className="font-sans text-[9px] uppercase tracking-[0.28em] opacity-45">Story information</p>
              <input value={story.title} onChange={(e) => setStory({ ...story, title: e.target.value })} className="mt-4 w-full border-0 bg-transparent p-0 font-serif text-4xl tracking-[-0.04em] outline-none placeholder:opacity-20 md:text-6xl" placeholder="Story title" />
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <input value={story.location || ""} onChange={(e) => setStory({ ...story, location: e.target.value })} placeholder="Location" className="border-b border-black/15 bg-transparent py-2 font-sans text-[10px] uppercase tracking-[0.16em] outline-none" />
                <input value={story.date || ""} onChange={(e) => setStory({ ...story, date: e.target.value })} placeholder="Date" className="border-b border-black/15 bg-transparent py-2 font-sans text-[10px] uppercase tracking-[0.16em] outline-none" />
                <input value={story.category || ""} onChange={(e) => setStory({ ...story, category: e.target.value })} placeholder="Category" className="border-b border-black/15 bg-transparent py-2 font-sans text-[10px] uppercase tracking-[0.16em] outline-none" />
              </div>
              <textarea value={story.description || ""} onChange={(e) => setStory({ ...story, description: e.target.value })} rows={3} placeholder="Short story introduction" className="mt-6 w-full resize-none border-0 bg-transparent p-0 font-serif text-xl leading-relaxed outline-none placeholder:opacity-25" />
            </div>

            {message && <div className="mb-6 border-l-2 border-black px-4 py-3 font-sans text-[10px] uppercase tracking-[0.12em]">{message}</div>}

            <div className="space-y-7">
              {blocks.map((block, index) => (
                <article key={block.id} onClick={() => setActiveBlock(block.id)} className={`group relative overflow-hidden border bg-white transition ${activeBlock === block.id ? "border-black shadow-[0_12px_40px_rgba(0,0,0,.06)]" : "border-black/8 hover:border-black/25"}`}>
                  <div className="flex items-center justify-between border-b border-black/8 px-5 py-3">
                    <div className="flex items-center gap-3"><span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-40">{String(index + 1).padStart(2, "0")}</span><span className="font-sans text-[9px] uppercase tracking-[0.2em]">{blockLabels[block.type]}</span></div>
                    <div className="flex items-center gap-1 opacity-40 transition group-hover:opacity-100">
                      <button onClick={(e) => { e.stopPropagation(); void moveBlock(index, -1); }} disabled={working || index === 0} className="px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-20">↑</button>
                      <button onClick={(e) => { e.stopPropagation(); void moveBlock(index, 1); }} disabled={working || index === blocks.length - 1} className="px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-20">↓</button>
                      <button onClick={(e) => { e.stopPropagation(); void deleteBlock(block.id); }} disabled={working} className="px-2 py-1 font-sans text-[8px] uppercase tracking-[0.12em] text-red-700 hover:bg-red-50 disabled:opacity-30">Delete</button>
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    {block.eyebrow && <p className="mb-3 font-sans text-[9px] uppercase tracking-[0.25em] opacity-45">{block.eyebrow}</p>}
                    {block.title && <h2 className="font-serif text-3xl tracking-[-0.035em] md:text-4xl">{block.title}</h2>}
                    {block.body && <p className="mt-4 max-w-2xl whitespace-pre-wrap font-serif text-lg leading-[1.65] opacity-75">{block.body}</p>}

                    {block.type === "image" && block.media[0] && <img src={mediaUrl(block.media[0].path)} alt={block.media[0].alt || block.media[0].filename} className="mt-6 max-h-[620px] w-full object-contain bg-[#ece9e2]" />}

                    {block.type === "gallery" && (
                      <div className={`mt-6 grid gap-2 ${block.gallery_layout === "portrait-pair" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
                        {block.media.map((media) => <img key={media.id} src={mediaUrl(media.path)} alt={media.alt || media.filename} className={`w-full object-cover ${block.gallery_layout === "feature" ? "aspect-[4/3] first:col-span-2 first:aspect-[16/9]" : block.gallery_layout === "portrait-pair" ? "aspect-[2/3]" : "aspect-[4/3]"}`} />)}
                        {block.media.length === 0 && <div className="col-span-full border border-dashed border-black/15 px-6 py-16 text-center font-serif text-xl opacity-40">No images yet</div>}
                      </div>
                    )}

                    {block.type === "quote" && <div className="my-5 border-l border-black/20 pl-6"><span className="font-serif text-5xl opacity-20">“</span><p className="font-serif text-2xl leading-relaxed">{block.body || "Quote"}</p></div>}
                  </div>
                </article>
              ))}

              <button onClick={() => setShowAddMenu(true)} className="w-full border border-dashed border-black/15 py-8 font-sans text-[9px] uppercase tracking-[0.25em] opacity-50 transition hover:border-black/40 hover:opacity-100">+ Add story block</button>
            </div>
          </div>
        </section>

        <aside className="border-l border-black/10 bg-[#ece9e2]/35 px-5 py-7 lg:min-h-[calc(100vh-73px)]">
          {!active ? (
            <div className="sticky top-24">
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] opacity-45">Inspector</p>
              <p className="mt-5 font-serif text-2xl leading-tight opacity-45">Select a block to edit its content and media.</p>
            </div>
          ) : (
            <div className="sticky top-24">
              <div className="flex items-center justify-between"><p className="font-sans text-[9px] uppercase tracking-[0.25em] opacity-45">{blockLabels[active.type]}</p><button onClick={() => setActiveBlock(null)} className="font-sans text-[9px] uppercase tracking-[0.18em] opacity-45 hover:opacity-100">Close</button></div>
              <div className="mt-7 space-y-6">
                <label className="block"><span className="font-sans text-[8px] uppercase tracking-[0.2em] opacity-45">Eyebrow</span><input value={active.eyebrow || ""} onChange={(e) => void updateBlock(active.id, { eyebrow: e.target.value || null })} className="mt-2 w-full border-b border-black/15 bg-transparent py-2 font-serif text-lg outline-none" /></label>
                <label className="block"><span className="font-sans text-[8px] uppercase tracking-[0.2em] opacity-45">Title</span><input value={active.title || ""} onChange={(e) => void updateBlock(active.id, { title: e.target.value || null })} className="mt-2 w-full border-b border-black/15 bg-transparent py-2 font-serif text-lg outline-none" /></label>
                <label className="block"><span className="font-sans text-[8px] uppercase tracking-[0.2em] opacity-45">Body</span><textarea value={active.body || ""} onChange={(e) => void updateBlock(active.id, { body: e.target.value || null })} rows={8} className="mt-2 w-full resize-y border border-black/10 bg-white p-3 font-serif text-sm leading-relaxed outline-none" /></label>

                {active.type === "gallery" && <>
                  <label className="block"><span className="font-sans text-[8px] uppercase tracking-[0.2em] opacity-45">Gallery title</span><input value={active.gallery_title || ""} onChange={(e) => void updateBlock(active.id, { gallery_title: e.target.value || null })} className="mt-2 w-full border-b border-black/15 bg-transparent py-2 font-serif text-lg outline-none" /></label>
                  <label className="block"><span className="font-sans text-[8px] uppercase tracking-[0.2em] opacity-45">Layout</span><select value={active.gallery_layout || "grid"} onChange={(e) => void updateBlock(active.id, { gallery_layout: e.target.value as GalleryLayout })} className="mt-2 w-full border border-black/10 bg-white p-3 font-sans text-[10px] uppercase tracking-[0.12em] outline-none"><option value="grid">Grid</option><option value="feature">Feature</option><option value="portrait-pair">Portrait Pair</option></select></label>
                </>}

                {(active.type === "gallery" || active.type === "image") && <div>
                  <div className="flex items-center justify-between"><span className="font-sans text-[8px] uppercase tracking-[0.2em] opacity-45">Media</span><button onClick={() => { setMediaSearch(""); setMediaPicker(active.id); }} className="font-sans text-[8px] uppercase tracking-[0.15em] underline underline-offset-4">Add media</button></div>
                  <div className="mt-3 space-y-2">
                    {active.media.map((media, index) => <div key={media.id} className="flex gap-3 border-b border-black/8 pb-2"><img src={mediaUrl(media.path)} alt={media.alt || media.filename} className="h-14 w-14 shrink-0 object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-sans text-[9px]">{media.filename}</p><div className="mt-1 flex gap-2"><button onClick={() => void moveMedia(active, index, -1)} disabled={working || index === 0} className="text-[10px] opacity-50 disabled:opacity-15">←</button><button onClick={() => void moveMedia(active, index, 1)} disabled={working || index === active.media.length - 1} className="text-[10px] opacity-50 disabled:opacity-15">→</button><button onClick={() => void removeMedia(active.id, media.id)} disabled={working} className="font-sans text-[8px] uppercase text-red-700">Remove</button></div></div></div>)}
                    {active.media.length === 0 && <p className="py-4 font-serif text-sm opacity-40">No media selected.</p>}
                  </div>
                </div>}
              </div>
            </div>
          )}
        </aside>
      </div>

      {mediaPicker && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-8" onClick={() => setMediaPicker(null)}>
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden bg-[#f7f5f0] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 md:px-7"><div><p className="font-sans text-[9px] uppercase tracking-[0.25em] opacity-45">Media library</p><h2 className="mt-1 font-serif text-2xl">Choose photographs</h2></div><button onClick={() => setMediaPicker(null)} className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-50 hover:opacity-100">Close ×</button></div>
            <div className="border-b border-black/10 px-5 py-3 md:px-7"><input autoFocus value={mediaSearch} onChange={(e) => setMediaSearch(e.target.value)} placeholder="Search filename…" className="w-full border-0 bg-transparent font-sans text-xs outline-none" /></div>
            <div className="max-h-[65vh] overflow-y-auto p-5 md:p-7">
              {mediaLoading ? <p className="py-20 text-center font-serif text-2xl opacity-40">Loading photographs…</p> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{filteredMedia.map((media) => <button key={media.id} onClick={() => void addMedia(mediaPicker, media.id, blocks.find((block) => block.id === mediaPicker)?.media.length || 0)} disabled={working} className="group overflow-hidden bg-white text-left disabled:opacity-40"><img src={mediaUrl(media.path)} alt={media.alt || media.filename} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" /><span className="block truncate px-2 py-2 font-sans text-[8px] uppercase tracking-[0.08em] opacity-60">{media.filename}</span></button>)}</div>}
              {!mediaLoading && filteredMedia.length === 0 && <p className="py-20 text-center font-serif text-2xl opacity-40">No photographs found.</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
