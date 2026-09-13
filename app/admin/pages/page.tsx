"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ContentBlockPicker, { type ContentBlockSelection } from "../../../components/story/ContentBlockPicker";
import MediaPickerModal from "../../../components/story/blocks/image/MediaPickerModal";
import { mediaUrl } from "../../../lib/media";

type Media = { id: string; path: string; filename?: string | null; alt?: string | null; collection_id?: string | null; width?: number | null; height?: number | null };
type Page = { id: string; title: string; slug: string; page_type: string; seo_title?: string | null; seo_description?: string | null };
type Block = { id: string; type: string; sort_order?: number; data: Record<string, unknown>; media: Media[] };
type PageResponse = { blocks?: Array<{ id: string; type: string; sort_order?: number; data: string | Record<string, unknown>; media?: Media[] }> };

const BLOCK_LABELS: Record<string, string> = { cover: "Homepage cover", text: "Text", image: "Image", content: "Video", links: "Links", blog: "Blog", contact: "Contact", social: "Social", others: "Other", flex: "Flex" };

function parseData(value: string | Record<string, unknown> | undefined) {
    if (!value) return {};
    if (typeof value !== "string") return value;
    try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {}; } catch { return {}; }
}

function text(value: unknown) { return typeof value === "string" ? value : ""; }
function imageCount(variant: string) { return variant === "columns-2" || variant === "text-columns-2" ? 2 : variant === "columns-3" || variant === "text-columns-3" ? 3 : variant === "columns-4" || variant === "text-columns-4" ? 4 : 1; }

function CoverEditor({ block, onChange }: { block: Block; onChange: (patch: Partial<Block>) => void }) {
    const data = block.data;
    const [pickerOpen, setPickerOpen] = useState(false);
    const selectedIds = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
    const image = block.media.find(item => item.id === selectedIds[0]);
    const update = (key: string, value: string) => onChange({ data: { ...data, [key]: value } });
    return <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">Homepage cover</span><select value={text(data.variant) || "cover-full"} onChange={event => onChange({ data: { ...data, variant: event.target.value } })} className="border border-[#d8d3ca] bg-white px-3 py-2 text-[10px] uppercase tracking-[0.12em]"><option value="cover-full">Full width</option><option value="cover-contained">Contained in content</option></select></div>
        <div className={`relative overflow-hidden bg-[#ebe7df] ${text(data.variant) === "cover-contained" ? "mx-auto max-w-5xl" : "w-full"}`}><div className="aspect-[16/7]">{image ? <img src={mediaUrl(image.path)} alt={image.alt || image.filename || ""} className="h-full w-full object-cover" /> : <button type="button" onClick={() => setPickerOpen(true)} className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.14em] text-[#8a857d]">Choose cover image</button>}</div><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white"><p className="text-[10px] uppercase tracking-[0.16em]">{text(data.eyebrow) || "Homepage"}</p><p className="mt-2 font-serif text-3xl">{text(data.title) || "Cover title"}</p></div></div>
        <input className="w-full border border-[#d8d3ca] p-3 text-sm" placeholder="Eyebrow / label" value={text(data.eyebrow)} onChange={event => update("eyebrow", event.target.value)} />
        <input className="w-full border border-[#d8d3ca] p-3 text-sm" placeholder="Cover title" value={text(data.title)} onChange={event => update("title", event.target.value)} />
        <textarea className="min-h-20 w-full border border-[#d8d3ca] p-3 text-sm" placeholder="Cover description" value={text(data.body)} onChange={event => update("body", event.target.value)} />
        <MediaPickerModal open={pickerOpen} required={1} selectedIds={selectedIds.slice(0, 1)} collectionId={text(data.collection_id)} onClose={() => setPickerOpen(false)} onDone={(collectionId, mediaIds, media) => { onChange({ data: { ...data, collection_id: collectionId || null, media_ids: mediaIds.slice(0, 1) }, media }); setPickerOpen(false); }} />
    </div>;
}

function PageBlockEditor({ block, onChange }: { block: Block; onChange: (patch: Partial<Block>) => void }) {
    const data = block.data;
    const variant = text(data.variant) || block.type;
    const [pickerOpen, setPickerOpen] = useState(false);
    const update = (key: string, value: string) => onChange({ data: { ...data, [key]: value } });
    const selectedIds = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
    const count = imageCount(variant);
    const selectedMedia = selectedIds.map(id => block.media.find(item => item.id === id)).filter((item): item is Media => Boolean(item));
    if (block.type === "cover") return <CoverEditor block={block} onChange={onChange} />;
    if (block.type === "image") return <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">{variant}</span><button type="button" onClick={() => setPickerOpen(true)} className="border border-[#171717] bg-[#171717] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-white">{selectedMedia.length ? "Change images" : "Choose images"}</button></div>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(count, 4)}, minmax(0, 1fr))` }}>{Array.from({ length: count }, (_, index) => { const item = selectedMedia[index]; return <div key={index} className="aspect-[4/3] overflow-hidden bg-[#ebe7df]">{item ? <img src={mediaUrl(item.path)} alt={item.alt || item.filename || ""} className="h-full w-full object-cover" /> : <button type="button" onClick={() => setPickerOpen(true)} className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.14em] text-[#8a857d]">Add image</button>}</div>; })}</div>
        <input className="w-full border border-[#d8d3ca] p-3 text-sm" placeholder="Eyebrow / label" value={text(data.eyebrow)} onChange={event => update("eyebrow", event.target.value)} />
        <input className="w-full border border-[#d8d3ca] p-3 text-sm" placeholder="Title" value={text(data.title)} onChange={event => update("title", event.target.value)} />
        <MediaPickerModal open={pickerOpen} required={count} selectedIds={selectedIds} collectionId={text(data.collection_id)} onClose={() => setPickerOpen(false)} onDone={(collectionId, mediaIds, media) => { onChange({ data: { ...data, collection_id: collectionId || null, media_ids: mediaIds }, media }); setPickerOpen(false); }} />
    </div>;
    return <div className="grid gap-3">
        <input className="w-full border border-[#d8d3ca] p-3 text-sm" placeholder="Eyebrow / label" value={text(data.eyebrow)} onChange={event => update("eyebrow", event.target.value)} />
        <input className="w-full border border-[#d8d3ca] p-3 text-sm" placeholder={block.type === "content" ? "Video title" : "Title"} value={text(data.title)} onChange={event => update("title", event.target.value)} />
        {(block.type === "text" || block.type === "content") && <textarea className="min-h-32 w-full border border-[#d8d3ca] p-3 text-sm leading-6" placeholder={block.type === "content" ? "Description" : "Text content"} value={text(data.body)} onChange={event => update("body", event.target.value)} />}
        {block.type === "content" && <input className="w-full border border-[#d8d3ca] p-3 text-sm" placeholder="YouTube URL" value={text(data.youtube_url)} onChange={event => update("youtube_url", event.target.value)} />}
        {block.type !== "text" && block.type !== "content" && <textarea className="min-h-24 w-full border border-[#d8d3ca] p-3 text-sm leading-6" placeholder="Block data (optional)" value={text(data.body)} onChange={event => update("body", event.target.value)} />}
    </div>;
}

export default function AdminPagesPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [page, setPage] = useState<Page | null>(null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<{ id: string; side: "before" | "after" } | null>(null);

    async function loadPages() { setLoading(true); const response = await fetch("/api/admin/pages", { cache: "no-store" }); const data = await response.json() as { pages?: Page[] }; setPages(data.pages ?? []); setLoading(false); }
    useEffect(() => { const timer = window.setTimeout(() => { void loadPages(); }, 0); return () => window.clearTimeout(timer); }, []);

    async function openPage(item: Page) { setMessage(""); const response = await fetch(`/api/pages/${item.slug}`, { cache: "no-store" }); const data = await response.json() as PageResponse; const loaded = (data.blocks ?? []).map(block => ({ id: block.id, type: block.type, sort_order: block.sort_order, data: parseData(block.data), media: block.media ?? [] })); setPage(item); if (item.page_type === "home") { const cover = loaded.find(block => block.type === "cover") ?? { id: crypto.randomUUID(), type: "cover", data: { variant: "cover-full" }, media: [] }; setBlocks([cover, ...loaded.filter(block => block.id !== cover.id)]); } else setBlocks(loaded); }
    function addBlock(selection: ContentBlockSelection) { const variant = selection.variant; const data = selection.category === "image" ? { ...selection.data, variant } : selection.category === "content" ? { ...selection.data, variant } : { variant }; setBlocks(current => [...current, { id: crypto.randomUUID(), type: selection.category, data, media: [] }]); setPickerOpen(false); }
    function updateBlock(id: string, patch: Partial<Block>) { setBlocks(current => current.map(block => block.id === id ? { ...block, ...patch } : block)); }
    function moveBlock(index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= blocks.length) return; const next = [...blocks];[next[index], next[target]] = [next[target], next[index]]; if (page?.page_type !== "home" || next[0]?.type === "cover") setBlocks(next); }
    function dropBlock(targetId: string, side: "before" | "after") { if (!draggingId || draggingId === targetId) return; const current = blocks.findIndex(block => block.id === draggingId); const target = blocks.findIndex(block => block.id === targetId); if (current < 0 || target < 0) return; const dragged = blocks[current]; const next = blocks.filter(block => block.id !== draggingId); let index = next.findIndex(block => block.id === targetId); if (side === "after") index += 1; next.splice(Math.max(0, index), 0, dragged); if (page?.page_type !== "home" || next[0]?.type === "cover") setBlocks(next); setDraggingId(null); setDropPosition(null); }
    async function save() { if (!page || saving) return; setSaving(true); setMessage(""); try { const response = await fetch("/api/admin/pages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: page.id, title: page.title, seo_title: page.seo_title, seo_description: page.seo_description, blocks: blocks.map((block, index) => ({ id: block.id, type: block.type, sort_order: index, data: block.data })) }) }); const data = await response.json() as { success?: boolean; error?: string }; if (!response.ok || !data.success) throw new Error(data.error || "Could not save page"); setMessage("Page saved."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save page"); } finally { setSaving(false); } }

    if (loading) return <main className="min-h-screen bg-[#f7f5f0] p-12 text-[#171717]">Loading pages…</main>;
    if (!page) return <main className="min-h-screen bg-[#f7f5f0] px-6 py-12 text-[#171717]"><div className="mx-auto max-w-6xl"><Link href="/admin" className="text-xs uppercase tracking-[0.16em] text-[#77736c]">← Admin</Link><h1 className="mt-8 font-serif text-5xl">Pages</h1><p className="mt-3 text-sm text-[#77736c]">Build Home and About from the same content blocks used by Stories.</p><div className="mt-10 grid gap-4 md:grid-cols-2">{pages.map(item => <button type="button" key={item.id} onClick={() => void openPage(item)} className="border border-[#d8d3ca] bg-white p-6 text-left"><p className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">{item.page_type}</p><h2 className="mt-3 font-serif text-3xl">{item.title}</h2><p className="mt-2 text-xs text-[#77736c]">/{item.slug}</p></button>)}</div></div></main>;
    return <main className="min-h-screen bg-[#f7f5f0] px-6 py-8 text-[#171717] md:px-10"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-center justify-between gap-4"><button type="button" onClick={() => setPage(null)} className="text-xs uppercase tracking-[0.16em] text-[#77736c]">← Pages</button><div className="flex gap-2"><a href={`/${page.slug}`} target="_blank" rel="noreferrer" className="border border-[#d8d3ca] px-4 py-3 text-[10px] uppercase tracking-[0.14em]">Preview</a><button type="button" onClick={() => void save()} disabled={saving} className="bg-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white disabled:opacity-50">{saving ? "Saving…" : "Save page"}</button></div></div><div className="mt-8 border-b border-[#d8d3ca] pb-8"><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">Page Builder</p><h1 className="mt-3 font-serif text-5xl">{page.title}</h1><p className="mt-2 text-sm text-[#77736c]">/{page.slug}</p>{message && <p className="mt-4 text-sm text-[#77736c]">{message}</p>}</div><section className="mt-8 border border-[#d8d3ca] bg-white p-6"><h2 className="font-serif text-2xl">SEO</h2><div className="mt-5 grid gap-4"><input className="border border-[#d8d3ca] p-3 text-sm" placeholder="SEO title" value={page.seo_title ?? ""} onChange={event => setPage({ ...page, seo_title: event.target.value })} /><textarea className="min-h-20 border border-[#d8d3ca] p-3 text-sm" placeholder="SEO description" value={page.seo_description ?? ""} onChange={event => setPage({ ...page, seo_description: event.target.value })} /></div></section><section className="mt-10"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-[#77736c]">Content</p><h2 className="mt-2 font-serif text-3xl">Page blocks</h2></div><button type="button" onClick={() => setPickerOpen(true)} className="bg-[#171717] px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-white">Add block</button></div><div className="mt-6 space-y-4">{blocks.map((block, index) => <article key={block.id} onDragOver={event => { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); setDropPosition({ id: block.id, side: event.clientY < rect.top + rect.height / 2 ? "before" : "after" }); }} onDrop={event => { event.preventDefault(); if (dropPosition) dropBlock(block.id, dropPosition.side); }} className={`border bg-white p-5 ${dropPosition?.id === block.id ? "border-[#171717]" : "border-[#d8d3ca]"}`}><div className="mb-5 flex items-center justify-between gap-4"><div className="flex items-center gap-3"><button type="button" draggable onDragStart={() => setDraggingId(block.id)} onDragEnd={() => { setDraggingId(null); setDropPosition(null); }} aria-label="Drag to reorder block" className="cursor-grab border border-[#d8d3ca] px-3 py-2 text-xs text-[#77736c] active:cursor-grabbing">⠿</button><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">Block {index + 1}</p><h3 className="mt-1 font-serif text-2xl">{BLOCK_LABELS[block.type] ?? block.type} <span className="font-sans text-xs text-[#77736c]">· {text(block.data.variant) || block.type}</span></h3></div></div><div className="flex gap-2"><button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} className="border border-[#d8d3ca] px-3 py-2 text-xs disabled:opacity-30">↑</button><button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} className="border border-[#d8d3ca] px-3 py-2 text-xs disabled:opacity-30">↓</button><button type="button" onClick={() => setBlocks(current => current.filter(item => item.id !== block.id))} disabled={page.page_type === "home" && block.type === "cover"} className="border border-[#d8d3ca] px-3 py-2 text-xs disabled:opacity-30">×</button></div></div><PageBlockEditor block={block} onChange={patch => updateBlock(block.id, patch)} /></article>)}</div>{blocks.length === 0 && <div className="mt-6 border border-dashed border-[#c9c3b9] bg-white p-12 text-center text-sm text-[#77736c]">No blocks yet. Add the first content block.</div>}</section></div><ContentBlockPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addBlock} /></main>;
}