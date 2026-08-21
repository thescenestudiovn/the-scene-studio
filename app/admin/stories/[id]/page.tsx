"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Media = { id: string; path: string; filename: string; alt: string | null; width: number | null; height: number | null; sort_order: number };
type BlockType = "text" | "image" | "gallery" | "quote" | "credits";
type Layout = "grid" | "feature" | "portrait-pair";
type Block = { id: string; type: BlockType; sort_order: number; eyebrow: string | null; title: string | null; body: string | null; media_id: string | null; gallery_title: string | null; gallery_layout: Layout; media: Media[] };
type Story = { id: string; slug: string; title: string; location: string | null; date: string | null; category: string | null; description: string | null; seo_title?: string | null; seo_description?: string | null; destination_id?: string | null; cover_media_id?: string | null; published: number };
type Destination = { id: string; name: string; country_name: string; slug: string };
type Api = { success: boolean; error?: string; story?: Story; block?: Block; blocks?: Block[]; media?: Media[]; destinations?: Destination[] };

const MEDIA_BASE = "https://media.thescenestudio.asia";
const CATEGORIES = ["Wedding", "Prewedding", "Elopement", "Engagement", "Destination Wedding", "Editorial", "Lifestyle", "Other"];
const BLOCKS = [
  { group: "Text", items: ["Heading 1", "Heading 2", "Heading 3", "Wide Text", "Regular Text", "Narrow Text", "Text Columns 2", "Text Columns 3", "Text Columns 4"] },
  { group: "Image", items: ["Image", "Image Columns", "Image Grid"] },
  { group: "Video", items: ["Video"] },
  { group: "More", items: ["Quote", "Contact", "Social", "Link", "Divider", "Flex Block"] },
];
const mediaUrl = (path: string) => `${MEDIA_BASE}/${path.replace(/^\/+/, "")}`;
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function StoryEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("All changes saved");
  const [settings, setSettings] = useState(false);
  const [picker, setPicker] = useState<number | null>(null);
  const [mediaPicker, setMediaPicker] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [mediaQuery, setMediaQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const api = async (url: string, init?: RequestInit) => {
    const res = await fetch(url, { ...init, cache: "no-store" });
    const data = (await res.json()) as Api;
    if (!res.ok || !data.success) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  };

  const load = async () => {
    const [storyRes, mediaRes, destRes] = await Promise.all([api(`/api/admin/stories/${id}`), api("/api/admin/media"), api("/api/admin/destinations")]);
    if (!storyRes.story) throw new Error("Story not found");
    setStory(storyRes.story);
    setBlocks((storyRes.blocks || []).sort((a, b) => a.sort_order - b.sort_order));
    setMedia(mediaRes.media || []);
    setDestinations(destRes.destinations || []);
  };

  useEffect(() => { void load().catch((e) => setMessage(e instanceof Error ? e.message : "Failed to load story")).finally(() => setLoading(false)); }, [id]);

  const save = async (patch?: Partial<Story>) => {
    if (!story) return;
    setSaving(true); setMessage("");
    try {
      const next = { ...story, ...patch };
      const data = await api(`/api/admin/stories/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      if (data.story) setStory(data.story);
      setMessage("All changes saved");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const normalize = async (items: Block[]) => {
    for (let i = 0; i < items.length; i++) if (items[i].sort_order !== i) await api(`/api/admin/stories/${id}/blocks/${items[i].id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: i }) });
  };

  const addBlock = async (label: string, index: number) => {
    setWorking(true);
    try {
      const type: BlockType = label === "Image" ? "image" : label === "Image Columns" || label === "Image Grid" ? "gallery" : label === "Quote" ? "quote" : label === "Contact" || label === "Social" || label === "Video" ? "credits" : "text";
      const created = await api(`/api/admin/stories/${id}/blocks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, sort_order: blocks.length, gallery_layout: label === "Image Columns" ? "portrait-pair" : "grid", eyebrow: label }) });
      if (!created.block) throw new Error("Failed to create block");
      const next = [...blocks]; next.splice(index, 0, created.block); setBlocks(next); await normalize(next); await load(); setEditing(created.block.id); setPicker(null); setMessage(`${label} added`);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Failed to add block"); }
    finally { setWorking(false); }
  };

  const updateBlock = async (block: Block, patch: Partial<Block>) => {
    setWorking(true);
    try { await api(`/api/admin/stories/${id}/blocks/${block.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }); await load(); setMessage("All changes saved"); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Failed to update block"); }
    finally { setWorking(false); }
  };

  const duplicate = async (block: Block, index: number) => {
    setWorking(true);
    try {
      const created = await api(`/api/admin/stories/${id}/blocks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: block.type, sort_order: blocks.length, eyebrow: block.eyebrow, title: block.title, body: block.body, media_id: block.media_id, gallery_title: block.gallery_title, gallery_layout: block.gallery_layout }) });
      if (!created.block) throw new Error("Failed to duplicate block");
      if (block.media.length && block.type !== "image") await Promise.all(block.media.map((m, i) => api(`/api/admin/stories/${id}/blocks/${created.block!.id}/media`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ media_id: m.id, sort_order: i }) })));
      const next = [...blocks]; next.splice(index + 1, 0, { ...created.block, media: block.media }); await normalize(next); await load(); setEditing(created.block.id); setMessage("Block duplicated");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Failed to duplicate block"); }
    finally { setWorking(false); }
  };

  const remove = async (block: Block) => {
    if (!window.confirm("Delete this block?")) return;
    setWorking(true);
    try { await api(`/api/admin/stories/${id}/blocks/${block.id}`, { method: "DELETE" }); setEditing(null); await load(); setMessage("Block deleted"); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Failed to delete block"); }
    finally { setWorking(false); }
  };

  const drop = async (target: number) => {
    if (!dragId) return;
    const from = blocks.findIndex((b) => b.id === dragId); if (from < 0 || from === target) { setDragId(null); return; }
    const next = [...blocks]; const [moved] = next.splice(from, 1); next.splice(target, 0, moved); setBlocks(next); setDragId(null); setWorking(true);
    try { await normalize(next); await load(); setMessage("Block order saved"); } catch (e) { setMessage(e instanceof Error ? e.message : "Failed to reorder blocks"); await load(); } finally { setWorking(false); }
  };

  const openMedia = (block: Block) => { setMediaPicker(block.id); setSelectedMedia(block.media.map((m) => m.id)); setMediaQuery(""); };
  const filteredMedia = useMemo(() => { const q = mediaQuery.trim().toLowerCase(); return q ? media.filter((m) => `${m.filename} ${m.alt || ""}`.toLowerCase().includes(q)) : media; }, [media, mediaQuery]);
  const applyMedia = async () => {
    if (!mediaPicker) return;
    const block = blocks.find((b) => b.id === mediaPicker); if (!block) return;
    setWorking(true);
    try {
      const existing = new Set(block.media.map((m) => m.id));
      const added = selectedMedia.filter((x) => !existing.has(x));
      if (block.type === "image") await updateBlock(block, { media_id: selectedMedia[0] || null });
      else { await Promise.all(added.map((m, i) => api(`/api/admin/stories/${id}/blocks/${block.id}/media`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ media_id: m, sort_order: block.media.length + i }) }))); await load(); }
      setMediaPicker(null); setSelectedMedia([]);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Failed to add media"); }
    finally { setWorking(false); }
  };

  if (loading) return <main className="min-h-screen bg-[#f7f5f0] px-8 pt-24 text-[#171717]"><p className="text-[10px] uppercase tracking-[.28em] opacity-40">Loading story editor…</p></main>;
  if (!story) return <main className="min-h-screen bg-[#f7f5f0] p-10"><h1 className="font-serif text-5xl">Story not found</h1><p className="mt-4 text-sm text-red-700">{message}</p></main>;

  return <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f0]/95 backdrop-blur-md"><div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 md:px-8"><div className="flex items-center gap-5"><button onClick={() => router.push("/admin/stories")} className="text-[10px] uppercase tracking-[.2em] opacity-50">← Stories</button><span className="h-4 w-px bg-black/10"/><span className="font-serif text-xl">Edit Post</span></div><div className="flex items-center gap-3"><span className="hidden text-[9px] uppercase tracking-[.18em] opacity-40 md:inline">{saving ? "Saving…" : message}</span><button onClick={() => setSettings(true)} className="border border-black/15 px-4 py-2 text-[9px] uppercase tracking-[.18em]">Post Settings</button><button onClick={() => void save({ published: 1 })} className="bg-[#171717] px-5 py-2 text-[9px] uppercase tracking-[.18em] text-white">Publish Post</button></div></div></header>
    <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8"><div className="mx-auto max-w-[900px]">
      <div className="mb-8 text-center"><div className="text-[10px] uppercase tracking-[.22em] opacity-45">{story.date || "No date"} <span className="mx-2">—</span> {story.category || "Click to select categories"}</div><h1 className="mt-4 font-serif text-5xl tracking-[-.045em] md:text-7xl">{story.title}</h1><button onClick={() => setSettings(true)} className="mt-4 text-[9px] uppercase tracking-[.2em] opacity-45 hover:opacity-100">Click to change cover image</button></div>
      <AddBar onClick={() => setPicker(0)} />
      {blocks.map((block, index) => <div key={block.id} onDragOver={(e) => e.preventDefault()} onDrop={() => void drop(index)}><BlockCard block={block} editing={editing === block.id} working={working} onEdit={() => setEditing(editing === block.id ? null : block.id)} onDuplicate={() => void duplicate(block, index)} onDelete={() => void remove(block)} onMedia={() => openMedia(block)} onUpdate={(patch) => void updateBlock(block, patch)} onDragStart={() => setDragId(block.id)} /><AddBar onClick={() => setPicker(index + 1)} /></div>)}
      <div className="mt-20 border-t border-black/10 pt-10"><button onClick={() => setSettings(true)} className="text-[9px] uppercase tracking-[.2em] opacity-45">Click to add tags</button><h3 className="mt-12 font-serif text-2xl">Related Posts</h3><div className="mt-6 border-t border-black/10 pt-6 text-[10px] uppercase tracking-[.18em] opacity-45">No related posts selected.</div></div>
    </div></section>
    {picker !== null && <BlockPicker index={picker} onClose={() => setPicker(null)} onSelect={(label) => void addBlock(label, picker)} />}
    {settings && <SettingsPanel story={story} destinations={destinations} media={media} onClose={() => setSettings(false)} onSave={save} />}
    {mediaPicker && <MediaPicker media={filteredMedia} selected={selectedMedia} query={mediaQuery} setQuery={setMediaQuery} toggle={(mid) => setSelectedMedia((s) => s.includes(mid) ? s.filter((x) => x !== mid) : [...s, mid])} close={() => setMediaPicker(null)} apply={() => void applyMedia()} />}
  </main>;
}

function AddBar({ onClick }: { onClick: () => void }) { return <button onClick={onClick} className="group flex w-full items-center justify-center py-3"><span className="h-px flex-1 bg-black/0 group-hover:bg-black/10"/><span className="mx-4 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-[#f7f5f0] text-lg font-light opacity-45 transition group-hover:scale-110 group-hover:opacity-100">+</span><span className="h-px flex-1 bg-black/0 group-hover:bg-black/10"/></button>; }

function BlockPicker({ index, onClose, onSelect }: { index: number; onClose: () => void; onSelect: (label: string) => void }) { return <div className="fixed inset-0 z-50 bg-black/25"><div className="absolute right-0 top-0 h-full w-full max-w-[760px] overflow-y-auto bg-[#f7f5f0] shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-[#f7f5f0]/95 px-7 py-6 backdrop-blur"><div><p className="text-[9px] uppercase tracking-[.25em] opacity-45">Insert at position {index + 1}</p><h2 className="mt-2 font-serif text-4xl">Add Block</h2></div><button onClick={onClose} className="text-2xl opacity-40">×</button></div><div className="grid gap-8 p-7 md:grid-cols-2">{BLOCKS.map((group) => <section key={group.group}><p className="mb-3 text-[9px] uppercase tracking-[.25em] opacity-45">{group.group}</p><div className="space-y-1">{group.items.map((item) => <button key={item} onClick={() => onSelect(item)} className="flex w-full items-center justify-between border-b border-black/8 px-3 py-4 text-left font-serif text-lg hover:bg-black/[.03]">{item}<span className="text-sm opacity-30">→</span></button>)}</div></section>)}</div></div></div>; }

function BlockCard({ block, editing, working, onEdit, onDuplicate, onDelete, onMedia, onUpdate, onDragStart }: { block: Block; editing: boolean; working: boolean; onEdit: () => void; onDuplicate: () => void; onDelete: () => void; onMedia: () => void; onUpdate: (patch: Partial<Block>) => void; onDragStart: () => void }) { return <article draggable onDragStart={onDragStart} className={`group relative border border-black/10 bg-white/30 transition ${editing ? "ring-1 ring-black/15" : "hover:border-black/20"}`}><div className="absolute right-3 top-3 z-10 flex items-center gap-1 bg-[#f7f5f0]/90 px-2 py-1 opacity-0 transition group-hover:opacity-100"><span className="mr-2 cursor-grab text-[10px] opacity-40">⋮⋮</span><button onClick={onEdit} className="px-2 py-1 text-[8px] uppercase tracking-[.15em]">Edit</button><button onClick={onDuplicate} disabled={working} className="px-2 py-1 text-[8px] uppercase tracking-[.15em]">Duplicate</button><button onClick={onDelete} disabled={working} className="px-2 py-1 text-[8px] uppercase tracking-[.15em] text-red-700">Delete</button></div><div className="p-7 md:p-10"><div className="mb-5 text-[8px] uppercase tracking-[.2em] opacity-35">{block.type} {block.eyebrow ? `· ${block.eyebrow}` : ""}</div>{block.type === "image" ? <ImageBlock block={block} onMedia={onMedia} /> : block.type === "gallery" ? <GalleryBlock block={block} onMedia={onMedia} /> : <TextBlock block={block} editing={editing} onUpdate={onUpdate} />}{editing && <div className="mt-7 flex flex-wrap gap-2 border-t border-black/10 pt-5"><button onClick={onMedia} className="border border-black/15 px-3 py-2 text-[8px] uppercase tracking-[.15em]">Choose Media</button>{block.type === "gallery" && <select value={block.gallery_layout} onChange={(e) => onUpdate({ gallery_layout: e.target.value as Layout })} className="border border-black/15 bg-transparent px-3 py-2 text-[8px] uppercase tracking-[.15em]"><option value="grid">Grid</option><option value="feature">Feature</option><option value="portrait-pair">Columns</option></select>}</div>}</div></article>; }

function TextBlock({ block, editing, onUpdate }: { block: Block; editing: boolean; onUpdate: (patch: Partial<Block>) => void }) { return <div>{editing ? <><input value={block.title || ""} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Enter a Heading" className="mb-4 w-full border-b border-black/15 bg-transparent py-2 font-serif text-4xl outline-none"/><textarea value={block.body || ""} onChange={(e) => onUpdate({ body: e.target.value })} placeholder="This is a paragraph. Enter your own text…" rows={6} className="w-full resize-none bg-transparent font-serif text-lg leading-8 outline-none" /></> : <><h2 className="font-serif text-4xl">{block.title || "Enter a Heading"}</h2><p className="mt-4 whitespace-pre-wrap font-serif text-lg leading-8 opacity-70">{block.body || "This is a paragraph. Click Edit and enter your own text."}</p></>}</div>; }
function ImageBlock({ block, onMedia }: { block: Block; onMedia: () => void }) { const image = block.media[0]; return image ? <div><img src={mediaUrl(image.path)} alt={image.alt || image.filename} className="mx-auto max-h-[620px] w-auto max-w-full object-contain"/><p className="mt-4 text-center text-[9px] uppercase tracking-[.18em] opacity-35">{image.filename}</p></div> : <button onClick={onMedia} className="flex min-h-[360px] w-full items-center justify-center border border-dashed border-black/15 text-[9px] uppercase tracking-[.2em] opacity-45 hover:opacity-100">Click to choose image</button>; }
function GalleryBlock({ block, onMedia }: { block: Block; onMedia: () => void }) { return block.media.length ? <div className={`grid gap-3 ${block.gallery_layout === "portrait-pair" ? "grid-cols-2" : block.gallery_layout === "feature" ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"}`}>{block.media.map((m) => <img key={m.id} src={mediaUrl(m.path)} alt={m.alt || m.filename} className="aspect-[4/3] h-full w-full object-cover"/>)}</div> : <button onClick={onMedia} className="flex min-h-[280px] w-full items-center justify-center border border-dashed border-black/15 text-[9px] uppercase tracking-[.2em] opacity-45 hover:opacity-100">Choose multiple images</button>; }

function SettingsPanel({ story, destinations, media, onClose, onSave }: { story: Story; destinations: Destination[]; media: Media[]; onClose: () => void; onSave: (patch?: Partial<Story>) => void }) { const [draft, setDraft] = useState(story); const update = <K extends keyof Story>(key: K, value: Story[K]) => setDraft((d) => ({ ...d, [key]: value })); return <div className="fixed inset-0 z-50 bg-black/25"><aside className="absolute right-0 top-0 h-full w-full max-w-[520px] overflow-y-auto bg-[#f7f5f0] shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-[#f7f5f0]/95 px-7 py-6 backdrop-blur"><div><p className="text-[9px] uppercase tracking-[.25em] opacity-45">Post Settings</p><h2 className="mt-2 font-serif text-4xl">Settings</h2></div><button onClick={onClose} className="text-2xl opacity-40">×</button></div><div className="space-y-10 p-7"><section><label className="text-[9px] uppercase tracking-[.2em] opacity-45">Post Name</label><input value={draft.title} onChange={(e) => update("title", e.target.value)} className="mt-3 w-full border-b border-black/15 bg-transparent py-3 font-serif text-3xl outline-none"/><label className="mt-7 block text-[9px] uppercase tracking-[.2em] opacity-45">Post Status</label><select value={draft.published ? "published" : "draft"} onChange={(e) => update("published", e.target.value === "published" ? 1 : 0)} className="mt-3 w-full border-b border-black/15 bg-transparent py-3 text-sm outline-none"><option value="draft">Draft</option><option value="published">Published</option></select><label className="mt-7 block text-[9px] uppercase tracking-[.2em] opacity-45">Published Date</label><input type="date" value={draft.date || ""} onChange={(e) => update("date", e.target.value || null)} className="mt-3 w-full border-b border-black/15 bg-transparent py-3 text-sm outline-none"/></section><section><p className="text-[9px] uppercase tracking-[.2em] opacity-45">Cover Image</p><button onClick={() => { const first = media[0]; if (first) update("cover_media_id", first.id); }} className="mt-3 flex h-36 w-full items-center justify-center border border-dashed border-black/15 text-[9px] uppercase tracking-[.2em] opacity-50">{draft.cover_media_id ? "Cover selected — click to change" : "Select from Media Library"}</button></section><section><label className="text-[9px] uppercase tracking-[.2em] opacity-45">Destination</label><select value={draft.destination_id || ""} onChange={(e) => update("destination_id", e.target.value || null)} className="mt-3 w-full border-b border-black/15 bg-transparent py-3 text-sm outline-none"><option value="">Select destination</option>{destinations.map((d) => <option key={d.id} value={d.id}>{d.name}{d.country_name ? ` — ${d.country_name}` : ""}</option>)}</select><label className="mt-7 block text-[9px] uppercase tracking-[.2em] opacity-45">Category</label><select value={draft.category || ""} onChange={(e) => update("category", e.target.value || null)} className="mt-3 w-full border-b border-black/15 bg-transparent py-3 text-sm outline-none"><option value="">Select category</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></section><section><label className="text-[9px] uppercase tracking-[.2em] opacity-45">URL Slug</label><div className="mt-3 flex border-b border-black/15"><input value={draft.slug} onChange={(e) => update("slug", e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"/><button onClick={() => update("slug", slugify(draft.title))} className="px-2 text-[8px] uppercase tracking-[.15em] opacity-45">Generate</button></div><label className="mt-7 block text-[9px] uppercase tracking-[.2em] opacity-45">Post Description</label><textarea value={draft.description || ""} onChange={(e) => update("description", e.target.value || null)} rows={5} className="mt-3 w-full border border-black/10 bg-white/30 p-4 font-serif text-lg outline-none"/><label className="mt-7 block text-[9px] uppercase tracking-[.2em] opacity-45">SEO Title</label><input value={draft.seo_title || ""} onChange={(e) => update("seo_title", e.target.value || null)} className="mt-3 w-full border-b border-black/15 bg-transparent py-3 text-sm outline-none"/><label className="mt-7 block text-[9px] uppercase tracking-[.2em] opacity-45">SEO Description</label><textarea value={draft.seo_description || ""} onChange={(e) => update("seo_description", e.target.value || null)} rows={4} className="mt-3 w-full border border-black/10 bg-white/30 p-4 text-sm outline-none"/></section><button onClick={() => { onSave(draft); onClose(); }} className="w-full bg-[#171717] py-4 text-[9px] uppercase tracking-[.2em] text-white">Save Settings</button></div></aside></div>; }

function MediaPicker({ media, selected, query, setQuery, toggle, close, apply }: { media: Media[]; selected: string[]; query: string; setQuery: (v: string) => void; toggle: (id: string) => void; close: () => void; apply: () => void }) { return <div className="fixed inset-0 z-[60] bg-black/40"><div className="absolute inset-x-0 bottom-0 top-8 mx-auto flex max-w-[1100px] flex-col bg-[#f7f5f0] shadow-2xl"><header className="flex items-center justify-between border-b border-black/10 px-6 py-5"><div><p className="text-[9px] uppercase tracking-[.25em] opacity-45">Media Library</p><h2 className="mt-2 font-serif text-3xl">Choose photos</h2></div><button onClick={close} className="text-2xl opacity-40">×</button></header><div className="border-b border-black/10 px-6 py-4"><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search photos…" className="w-full bg-transparent text-sm outline-none"/></div><div className="flex-1 overflow-y-auto p-6"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">{media.map((m) => { const checked = selected.includes(m.id); return <button key={m.id} onClick={() => toggle(m.id)} className={`relative aspect-square overflow-hidden border-2 ${checked ? "border-black" : "border-transparent"}`}><img src={mediaUrl(m.path)} alt={m.alt || m.filename} className="h-full w-full object-cover"/><span className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] ${checked ? "opacity-100" : "opacity-0"}`}>{checked ? "✓" : ""}</span></button>; })}</div>{!media.length && <p className="py-20 text-center text-[10px] uppercase tracking-[.2em] opacity-40">No media found</p>}</div><footer className="flex items-center justify-between border-t border-black/10 px-6 py-5"><span className="text-[9px] uppercase tracking-[.18em] opacity-45">{selected.length} selected</span><div className="flex gap-3"><button onClick={close} className="px-4 py-2 text-[9px] uppercase tracking-[.18em]">Cancel</button><button onClick={apply} disabled={!selected.length} className="bg-[#171717] px-5 py-2 text-[9px] uppercase tracking-[.18em] text-white disabled:opacity-30">Add Selected Photos</button></div></footer></div></div>; }
