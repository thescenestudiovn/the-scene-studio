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

type AddCategory = "Text" | "Image" | "Content" | "Links" | "Video" | "Contact" | "Social" | "Others" | "Flex Block";

type AddOption = {
  label: string;
  description?: string;
  type: BlockType;
  preset?: string;
};

const MEDIA_BASE = "https://media.thescenestudio.asia";

function mediaUrl(path: string) {
  return `${MEDIA_BASE}/${path.replace(/^\/+/, "")}`;
}

const categories: { name: AddCategory; description: string }[] = [
  { name: "Text", description: "Headings, paragraphs and editorial layouts" },
  { name: "Image", description: "Single photographs and image-led sections" },
  { name: "Content", description: "Galleries, quotes and supporting content" },
  { name: "Links", description: "Calls to action and linked content" },
  { name: "Video", description: "Films and video-led sections" },
  { name: "Contact", description: "Contact and enquiry sections" },
  { name: "Social", description: "Social links and profiles" },
  { name: "Others", description: "Supporting editorial elements" },
  { name: "Flex Block", description: "Flexible custom content" },
];

const options: Record<AddCategory, AddOption[]> = {
  Text: [
    { label: "Heading 1", type: "text", preset: "Heading 1" },
    { label: "Heading 2", type: "text", preset: "Heading 2" },
    { label: "Heading 3", type: "text", preset: "Heading 3" },
    { label: "Wide Text", type: "text", preset: "Wide Text" },
    { label: "Regular Text", type: "text", preset: "Regular Text" },
    { label: "Narrow Text", type: "text", preset: "Narrow Text" },
    { label: "Text Columns 2", type: "text", preset: "Text Columns 2" },
    { label: "Text Columns 3", type: "text", preset: "Text Columns 3" },
    { label: "Text Columns 4", type: "text", preset: "Text Columns 4" },
  ],
  Image: [
    { label: "Single Image", type: "image", preset: "Single Image" },
    { label: "Image with Caption", type: "image", preset: "Image with Caption" },
  ],
  Content: [
    { label: "Gallery", type: "gallery", preset: "Gallery" },
    { label: "Quote", type: "quote", preset: "Quote" },
    { label: "Credits", type: "credits", preset: "Credits" },
  ],
  Links: [
    { label: "Text Link", type: "text", preset: "Text Link" },
    { label: "Call to Action", type: "text", preset: "Call to Action" },
  ],
  Video: [
    { label: "Film", type: "credits", preset: "Film" },
    { label: "Video Embed", type: "credits", preset: "Video Embed" },
  ],
  Contact: [
    { label: "Contact", type: "credits", preset: "Contact" },
  ],
  Social: [
    { label: "Social Links", type: "credits", preset: "Social Links" },
  ],
  Others: [
    { label: "Divider", type: "text", preset: "Divider" },
    { label: "Spacer", type: "text", preset: "Spacer" },
  ],
  "Flex Block": [
    { label: "Flex Block", type: "text", preset: "Flex Block" },
  ],
};

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
  const [addScreen, setAddScreen] = useState(false);
  const [addCategory, setAddCategory] = useState<AddCategory>("Text");
  const [mediaPicker, setMediaPicker] = useState<string | null>(null);
  const [mediaSearch, setMediaSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);

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

  const request = async <T,>(url: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(url, { ...init, cache: "no-store" });
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

  const addBlock = async (option: AddOption) => {
    setWorking(true);
    try {
      const result = await request<{ block: Block }>(`/api/admin/stories/${id}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: option.type,
          sort_order: blocks.length,
          gallery_layout: "grid",
          eyebrow: option.preset || null,
        }),
      });
      await loadStory();
      if (result.block) setActiveBlock(result.block.id);
      setAddScreen(false);
      setMessage(`${option.label} added`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to add block");
    } finally {
      setWorking(false);
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

  const openMediaPicker = (blockId: string) => {
    const block = blocks.find((item) => item.id === blockId);
    setSelectedMedia(block?.media.map((media) => media.id) || []);
    setMediaPicker(blockId);
    setMediaSearch("");
  };

  const toggleMedia = (mediaId: string) => {
    setSelectedMedia((current) => current.includes(mediaId) ? current.filter((id) => id !== mediaId) : [...current, mediaId]);
  };

  const selectAllMedia = () => {
    const ids = filteredMedia.map((media) => media.id);
    setSelectedMedia((current) => Array.from(new Set([...current, ...ids])));
  };

  const clearMediaSelection = () => setSelectedMedia([]);

  const addSelectedMedia = async () => {
    if (!mediaPicker || selectedMedia.length === 0) return;
    const block = blocks.find((item) => item.id === mediaPicker);
    if (!block) return;

    setWorking(true);
    try {
      const existing = new Set(block.media.map((media) => media.id));
      const ids = selectedMedia.filter((mediaId) => !existing.has(mediaId));
      if (ids.length === 0) {
        setMediaPicker(null);
        return;
      }

      if (block.type === "image") {
        await request(`/api/admin/stories/${id}/blocks/${block.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ media_id: ids[0] }),
        });
      } else {
        await Promise.all(ids.map((mediaId, index) => request(`/api/admin/stories/${id}/blocks/${block.id}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ media_id: mediaId, sort_order: block.media.length + index }),
        })));
      }

      setMediaPicker(null);
      setSelectedMedia([]);
      await loadStory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to add selected media");
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

  const active = blocks.find((block) => block.id === activeBlock) || null;

  if (loading) {
    return <main className="min-h-screen bg-[#f7f5f0] px-6 pt-28 text-[#171717]"><div className="mx-auto max-w-7xl"><p className="font-sans text-[10px] uppercase tracking-[0.28em] opacity-50">The Scene Studio / Story Editor</p><div className="mt-12 h-1 w-24 animate-pulse bg-[#171717]/15" /></div></main>;
  }

  if (!story) {
    return <main className="min-h-screen bg-[#f7f5f0] px-6 pt-28 text-[#171717]"><div className="mx-auto max-w-2xl"><p className="font-sans text-[10px] uppercase tracking-[0.28em] opacity-50">Story Editor</p><h1 className="mt-5 font-serif text-5xl tracking-[-0.04em]">Unable to open story.</h1><p className="mt-5 font-sans text-sm text-red-700">{message || "Story not found."}</p></div></main>;
  }

  if (addScreen) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
        <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f0]/95 px-6 py-5 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1300px] items-center justify-between">
            <button onClick={() => setAddScreen(false)} className="font-sans text-[10px] uppercase tracking-[0.22em] opacity-55 hover:opacity-100">← Back to Story</button>
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] opacity-45">Add Block</p>
            <span className="w-24" />
          </div>
        </header>

        <div className="mx-auto grid max-w-[1300px] lg:grid-cols-[280px_1fr]">
          <aside className="border-r border-black/10 px-6 py-8 lg:min-h-[calc(100vh-72px)]">
            <p className="mb-5 font-sans text-[9px] uppercase tracking-[0.25em] opacity-45">Elements</p>
            <nav className="space-y-1">
              {categories.map((category) => (
                <button key={category.name} onClick={() => setAddCategory(category.name)} className={`w-full px-4 py-4 text-left transition ${addCategory === category.name ? "bg-[#171717] text-white" : "hover:bg-black/5"}`}>
                  <span className="block font-serif text-xl tracking-[-0.02em]">{category.name}</span>
                  <span className={`mt-1 block font-sans text-[8px] uppercase tracking-[0.1em] ${addCategory === category.name ? "opacity-60" : "opacity-40"}`}>{category.description}</span>
                </button>
              ))}
            </nav>
          </aside>

          <section className="px-7 py-10 md:px-12 lg:px-16">
            <div className="max-w-4xl">
              <p className="font-sans text-[9px] uppercase tracking-[0.25em] opacity-45">{addCategory}</p>
              <h1 className="mt-3 font-serif text-5xl tracking-[-0.05em] md:text-6xl">Choose an element</h1>
              <p className="mt-4 max-w-2xl font-sans text-sm leading-7 opacity-55">Choose the building block you want to add to this story. You will return to the editor immediately after choosing it.</p>

              <div className="mt-12 grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
                {options[addCategory].map((option) => (
                  <button key={option.label} onClick={() => void addBlock(option)} disabled={working} className="group min-h-[150px] bg-[#f7f5f0] p-6 text-left transition hover:bg-white disabled:cursor-wait disabled:opacity-40">
                    <span className="font-serif text-2xl tracking-[-0.025em] group-hover:underline">{option.label}</span>
                    <span className="mt-3 block font-sans text-[9px] uppercase tracking-[0.16em] opacity-40">Add to story →</span>
                  </button>
                ))}
              </div>

              <div className="mt-10 border-t border-black/10 pt-6 font-sans text-[9px] uppercase tracking-[0.16em] opacity-35">The Scene Studio / Story Builder</div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (mediaPicker) {
    const pickerBlock = blocks.find((block) => block.id === mediaPicker);
    const existingIds = new Set(pickerBlock?.media.map((media) => media.id) || []);

    return (
      <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
        <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f0]/95 px-5 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-5">
            <button onClick={() => { setMediaPicker(null); setSelectedMedia([]); }} className="font-sans text-[10px] uppercase tracking-[0.22em] opacity-55 hover:opacity-100">← Back to Block</button>
            <div className="text-center"><p className="font-sans text-[9px] uppercase tracking-[0.25em] opacity-45">Media Library</p><h1 className="mt-1 font-serif text-2xl tracking-[-0.03em]">Choose photographs</h1></div>
            <button onClick={() => void addSelectedMedia()} disabled={working || selectedMedia.length === 0} className="bg-[#171717] px-5 py-2.5 font-sans text-[9px] uppercase tracking-[0.2em] text-white disabled:opacity-30">{working ? "Adding…" : `Add ${selectedMedia.length || ""} selected`}</button>
          </div>
        </header>

        <section className="mx-auto max-w-[1400px] px-5 py-7 md:px-8">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="font-sans text-[9px] uppercase tracking-[0.18em] opacity-45">{selectedMedia.length} selected</span>
              <button onClick={selectAllMedia} className="font-sans text-[9px] uppercase tracking-[0.18em] underline underline-offset-4">Select all</button>
              <button onClick={clearMediaSelection} className="font-sans text-[9px] uppercase tracking-[0.18em] opacity-45 hover:opacity-100">Clear</button>
            </div>
            <input value={mediaSearch} onChange={(e) => setMediaSearch(e.target.value)} placeholder="Search media…" className="w-full border-b border-black/15 bg-transparent px-0 py-2 font-sans text-[10px] uppercase tracking-[0.12em] outline-none md:w-72" />
          </div>

          {mediaLoading ? (
            <div className="py-24 text-center font-sans text-[10px] uppercase tracking-[0.2em] opacity-40">Loading media…</div>
          ) : filteredMedia.length === 0 ? (
            <div className="py-24 text-center font-serif text-2xl opacity-35">No media found.</div>
          ) : (
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredMedia.map((media) => {
                const selected = selectedMedia.includes(media.id);
                const existing = existingIds.has(media.id);
                return (
                  <button key={media.id} type="button" onClick={() => !existing && toggleMedia(media.id)} disabled={existing} className={`group relative overflow-hidden bg-[#ece9e2] text-left ${selected ? "ring-2 ring-[#171717] ring-offset-2 ring-offset-[#f7f5f0]" : ""} ${existing ? "cursor-default opacity-55" : ""}`}>
                    <img src={mediaUrl(media.path)} alt={media.alt || media.filename} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.02]" loading="lazy" />
                    <span className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center border text-[11px] ${selected ? "border-[#171717] bg-[#171717] text-white" : "border-white/80 bg-black/20 text-white"}`}>{selected ? "✓" : ""}</span>
                    {existing && <span className="absolute inset-x-0 bottom-0 bg-[#171717]/80 px-2 py-2 font-sans text-[7px] uppercase tracking-[0.15em] text-white">Already in block</span>}
                    <span className="block truncate px-2 py-2 font-sans text-[8px] uppercase tracking-[0.08em] opacity-45">{media.filename}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f0]/95 px-5 py-4 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6">
          <div className="min-w-0">
            <a href="/admin/stories" className="font-sans text-[9px] uppercase tracking-[0.28em] opacity-50 hover:opacity-100">← Stories</a>
            <div className="mt-1 flex items-center gap-3"><h1 className="truncate font-serif text-xl tracking-[-0.03em] md:text-2xl">{story.title}</h1><span className={`hidden rounded-full px-2 py-1 font-sans text-[8px] uppercase tracking-[0.18em] sm:inline-flex ${story.published ? "bg-[#263a2d] text-white" : "bg-black/8 text-black/55"}`}>{story.published ? "Published" : "Draft"}</span></div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <a href={`/stories/${story.slug}`} target="_blank" rel="noreferrer" className="hidden border border-black/15 px-4 py-2 font-sans text-[9px] uppercase tracking-[0.2em] hover:bg-black hover:text-white md:inline-block">Preview ↗</a>
            <button onClick={saveStory} disabled={saving || working} className="bg-[#171717] px-5 py-2.5 font-sans text-[9px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-75 disabled:opacity-40">{saving ? "Saving…" : "Save"}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[230px_minmax(0,1fr)_320px]">
        <aside className="border-r border-black/10 px-5 py-7 lg:min-h-[calc(100vh-73px)]">
          <div className="flex items-center justify-between"><p className="font-sans text-[9px] uppercase tracking-[0.24em] opacity-50">Story structure</p><button onClick={() => { setAddCategory("Text"); setAddScreen(true); }} className="text-xl leading-none opacity-60 hover:opacity-100">+</button></div>
          <button onClick={() => { setAddCategory("Text"); setAddScreen(true); }} className="mt-5 flex w-full items-center justify-between border border-dashed border-black/15 px-3 py-3 text-left hover:border-black/40"><span className="font-sans text-[9px] uppercase tracking-[0.18em] opacity-55">Add Block</span><span className="text-lg opacity-50">+</span></button>
          <div className="mt-4 space-y-1">
            {blocks.map((block, index) => <button key={block.id} onClick={() => setActiveBlock(block.id)} className={`flex w-full items-center gap-3 px-2.5 py-3 text-left transition ${activeBlock === block.id ? "bg-black text-white" : "hover:bg-black/5"}`}><span className="w-5 font-sans text-[9px] opacity-40">{String(index + 1).padStart(2, "0")}</span><span className="flex-1 font-sans text-[10px] uppercase tracking-[0.14em]">{blockLabels[block.type]}</span>{block.type === "gallery" && <span className="text-[9px] opacity-35">{block.media.length}</span>}</button>)}
          </div>
          {blocks.length === 0 && <p className="mt-5 font-serif text-lg opacity-40">Start building the story.</p>}
        </aside>

        <section className="min-w-0 px-5 py-8 md:px-10 lg:px-12">
          <div className="mx-auto max-w-[900px]">
            <div className="mb-10 border-b border-black/10 pb-8">
              <p className="font-sans text-[9px] uppercase tracking-[0.28em] opacity-45">Story information</p>
              <input value={story.title} onChange={(e) => setStory({ ...story, title: e.target.value })} className="mt-4 w-full border-0 bg-transparent p-0 font-serif text-4xl tracking-[-0.04em] outline-none md:text-6xl" />
              <div className="mt-6 grid gap-4 md:grid-cols-3"><input value={story.location || ""} onChange={(e) => setStory({ ...story, location: e.target.value })} placeholder="Location" className="border-b border-black/15 bg-transparent py-2 font-sans text-[10px] uppercase tracking-[0.16em] outline-none" /><input value={story.date || ""} onChange={(e) => setStory({ ...story, date: e.target.value })} placeholder="Date" className="border-b border-black/15 bg-transparent py-2 font-sans text-[10px] uppercase tracking-[0.16em] outline-none" /><input value={story.category || ""} onChange={(e) => setStory({ ...story, category: e.target.value })} placeholder="Category" className="border-b border-black/15 bg-transparent py-2 font-sans text-[10px] uppercase tracking-[0.16em] outline-none" /></div>
              <textarea value={story.description || ""} onChange={(e) => setStory({ ...story, description: e.target.value })} rows={3} placeholder="Short story introduction" className="mt-6 w-full resize-none border-0 bg-transparent p-0 font-serif text-xl leading-relaxed outline-none placeholder:opacity-25" />
            </div>

            {message && <div className="mb-6 border-l-2 border-black px-4 py-3 font-sans text-[10px] uppercase tracking-[0.12em]">{message}</div>}

            <div className="space-y-7">
              {blocks.map((block, index) => (
                <article key={block.id} onClick={() => setActiveBlock(block.id)} className={`group relative overflow-hidden border bg-white transition ${activeBlock === block.id ? "border-black shadow-[0_12px_40px_rgba(0,0,0,.06)]" : "border-black/8 hover:border-black/25"}`}>
                  <div className="flex items-center justify-between border-b border-black/8 px-5 py-3"><div className="flex items-center gap-3"><span className="font-sans text-[9px] uppercase tracking-[0.2em] opacity-40">{String(index + 1).padStart(2, "0")}</span><span className="font-sans text-[9px] uppercase tracking-[0.2em]">{blockLabels[block.type]}</span></div><div className="flex items-center gap-1 opacity-40 transition group-hover:opacity-100"><button onClick={(e) => { e.stopPropagation(); void moveBlock(index, -1); }} disabled={working || index === 0} className="px-2 py-1 text-xs disabled:opacity-20">↑</button><button onClick={(e) => { e.stopPropagation(); void moveBlock(index, 1); }} disabled={working || index === blocks.length - 1} className="px-2 py-1 text-xs disabled:opacity-20">↓</button><button onClick={(e) => { e.stopPropagation(); void deleteBlock(block.id); }} disabled={working} className="px-2 py-1 font-sans text-[8px] uppercase tracking-[0.12em] text-red-700 disabled:opacity-30">Delete</button></div></div>
                  <div className="p-6 md:p-8">
                    {block.eyebrow && <p className="mb-3 font-sans text-[9px] uppercase tracking-[0.25em] opacity-45">{block.eyebrow}</p>}
                    {block.title && <h2 className="font-serif text-3xl tracking-[-0.035em] md:text-4xl">{block.title}</h2>}
                    {block.body && <p className="mt-4 max-w-2xl whitespace-pre-wrap font-serif text-lg leading-[1.65] opacity-75">{block.body}</p>}
                    {block.type === "image" && block.media[0] && <img src={mediaUrl(block.media[0].path)} alt={block.media[0].alt || block.media[0].filename} className="mt-6 max-h-[620px] w-full object-contain bg-[#ece9e2]" />}
                    {block.type === "gallery" && <div className={`mt-6 grid gap-2 ${block.gallery_layout === "portrait-pair" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>{block.media.map((media) => <img key={media.id} src={mediaUrl(media.path)} alt={media.alt || media.filename} className={`w-full object-cover ${block.gallery_layout === "feature" ? "aspect-[4/3] first:col-span-2 first:aspect-[16/9]" : block.gallery_layout === "portrait-pair" ? "aspect-[2/3]" : "aspect-[4/3]"}`} />)}{block.media.length === 0 && <div className="col-span-full border border-dashed border-black/15 px-6 py-16 text-center font-serif text-xl opacity-40">No images yet</div>}</div>}
                    {block.type === "quote" && <div className="my-5 border-l border-black/20 pl-6"><span className="font-serif text-5xl opacity-20">“</span><p className="font-serif text-2xl leading-relaxed">{block.body || "Quote"}</p></div>}
                  </div>
                </article>
              ))}
              <button onClick={() => { setAddCategory("Text"); setAddScreen(true); }} className="w-full border border-dashed border-black/15 py-8 font-sans text-[9px] uppercase tracking-[0.25em] opacity-50 transition hover:border-black/40 hover:opacity-100">+ Add story block</button>
            </div>
          </div>
        </section>

        <aside className="border-l border-black/10 bg-[#ece9e2]/35 px-5 py-7 lg:min-h-[calc(100vh-73px)]">
          {!active ? <div className="sticky top-24"><p className="font-sans text-[9px] uppercase tracking-[0.25em] opacity-45">Inspector</p><h2 className="mt-4 font-serif text-3xl tracking-[-0.03em]">Select a block</h2><p className="mt-3 font-sans text-xs leading-6 opacity-50">Choose a block from the story structure to edit its content and media.</p></div> : <div className="sticky top-24">
            <div className="flex items-center justify-between"><div><p className="font-sans text-[9px] uppercase tracking-[0.25em] opacity-45">Inspector</p><h2 className="mt-1 font-serif text-2xl">{blockLabels[active.type]}</h2></div><button onClick={() => setActiveBlock(null)} className="text-xs opacity-40">×</button></div>
            <div className="mt-7 space-y-5">
              <label className="block"><span className="font-sans text-[8px] uppercase tracking-[0.18em] opacity-45">Eyebrow</span><input value={active.eyebrow || ""} onChange={(e) => setBlocks((current) => current.map((b) => b.id === active.id ? { ...b, eyebrow: e.target.value } : b))} onBlur={() => void updateBlock(active.id, { eyebrow: active.eyebrow })} className="mt-2 w-full border-b border-black/15 bg-transparent py-2 font-sans text-sm outline-none" /></label>
              <label className="block"><span className="font-sans text-[8px] uppercase tracking-[0.18em] opacity-45">Title</span><input value={active.title || ""} onChange={(e) => setBlocks((current) => current.map((b) => b.id === active.id ? { ...b, title: e.target.value } : b))} onBlur={() => void updateBlock(active.id, { title: active.title })} className="mt-2 w-full border-b border-black/15 bg-transparent py-2 font-serif text-xl outline-none" /></label>
              <label className="block"><span className="font-sans text-[8px] uppercase tracking-[0.18em] opacity-45">Body</span><textarea value={active.body || ""} onChange={(e) => setBlocks((current) => current.map((b) => b.id === active.id ? { ...b, body: e.target.value } : b))} onBlur={() => void updateBlock(active.id, { body: active.body })} rows={7} className="mt-2 w-full resize-none border border-black/10 bg-white/60 p-3 font-serif text-sm leading-6 outline-none" /></label>

              {(active.type === "image" || active.type === "gallery") && <div className="border-t border-black/10 pt-5"><div className="flex items-center justify-between"><span className="font-sans text-[8px] uppercase tracking-[0.18em] opacity-45">Media · {active.media.length}</span><button onClick={() => openMediaPicker(active.id)} className="border border-black/15 px-3 py-2 font-sans text-[8px] uppercase tracking-[0.15em] hover:bg-black hover:text-white">Choose media</button></div>
                {active.type === "gallery" && <div className="mt-4"><span className="font-sans text-[8px] uppercase tracking-[0.18em] opacity-45">Gallery layout</span><div className="mt-2 grid grid-cols-3 gap-1">{(["grid", "feature", "portrait-pair"] as GalleryLayout[]).map((layout) => <button key={layout} onClick={() => void updateBlock(active.id, { gallery_layout: layout })} className={`border px-2 py-2 font-sans text-[7px] uppercase tracking-[0.1em] ${active.gallery_layout === layout ? "border-black bg-black text-white" : "border-black/10"}`}>{layout}</button>)}</div></div>}
                <div className="mt-4 space-y-2">{active.media.map((media, index) => <div key={media.id} className="flex items-center gap-2 bg-white/60 p-2"><img src={mediaUrl(media.path)} alt={media.alt || media.filename} className="h-12 w-14 object-cover" /><span className="min-w-0 flex-1 truncate font-sans text-[8px] opacity-60">{media.filename}</span><button onClick={() => void moveMedia(active, index, -1)} disabled={index === 0 || working} className="text-xs opacity-45 disabled:opacity-15">↑</button><button onClick={() => void moveMedia(active, index, 1)} disabled={index === active.media.length - 1 || working} className="text-xs opacity-45 disabled:opacity-15">↓</button><button onClick={() => void removeMedia(active.id, media.id)} disabled={working} className="text-xs text-red-700 opacity-55">×</button></div>)}</div>
              </div>}
            </div>
          </div>}
        </aside>
      </div>
    </main>
  );
}
