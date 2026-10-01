"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ContentBlockPicker, { type ContentBlockSelection } from "../../../components/story/ContentBlockPicker";
import MediaPickerModal from "../../../components/story/blocks/image/MediaPickerModal";
import { mediaUrl } from "../../../lib/media";
import TextColumnsEditor from "../../../components/story/editor/TextColumnsEditor";
import ImageBlockEditor from "../../../components/story/blocks/image/ImageBlockEditor";
import ImageWithTextEditor from "../../../components/story/blocks/image/ImageWithTextEditor";
import GridGalleryEditor from "../../../components/story/blocks/gallery/GridGalleryEditor";
import VideoBlockEditor from "../../../components/story/blocks/video/VideoBlockEditor";
import type { StoryBlock } from "../../../components/story/editor/types";
import StoryContent from "../../../components/story/editor/StoryContent";
import sanitizeHtml from "sanitize-html";

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

const PAGE_LAYOUTS: Record<string, string[]> = {
    image: ["medium", "large", "full-width", "columns-2", "columns-3", "columns-4", "grid-vertical", "grid-horizontal", "grid-square", "grid-stacked", "slideshow", "carousel", "text-overlay-large", "text-overlay-medium", "text-overlay-full", "text-columns-2", "text-columns-3", "text-columns-4", "text-below-large", "text-below-medium", "text-left-regular", "text-right-regular", "text-left-large", "text-right-large"],
    text: ["heading-1", "heading-2", "heading-3", "wide", "regular", "narrow", "columns-2", "columns-3", "text-columns-4"],
    content: ["regular", "banner-video"],
};


function toStoryBlock(block: Block): StoryBlock {
    const data = block.data;
    return {
        id: block.id,
        type: block.type,
        variant: text(data.variant) || (block.type === "image" ? "large" : block.type === "text" ? "regular" : "regular"),
        sort_order: block.sort_order ?? 0,
        eyebrow: text(data.eyebrow) || null,
        title: text(data.title) || null,
        body: text(data.body) || null,
        media: block.media as unknown as StoryBlock["media"],
        data,
    };
}

function pageLayoutLabel(variant: string) {
    const labels: Record<string, string> = {
        medium: "Medium · 50%", large: "Large · 70%", "full-width": "Full · 100%",
        "columns-2": "Columns 2", "columns-3": "Columns 3", "columns-4": "Columns 4",
        "grid-vertical": "Vertical Grid", "grid-horizontal": "Horizontal Grid", "grid-square": "Square Grid", "grid-stacked": "Stacked Grid",
        slideshow: "Slideshow", carousel: "Carousel",
        "text-overlay-large": "Image with Text · Large", "text-overlay-medium": "Image with Text · Medium", "text-overlay-full": "Image with Text · Full",
        "text-columns-2": "Image with Text · Columns 2", "text-columns-3": "Image with Text · Columns 3", "text-columns-4": "Image with Text · Columns 4",
        "text-below-large": "Image with Text · Below Large", "text-below-medium": "Image with Text · Below Medium",
        "text-left-regular": "Image with Text · Left", "text-right-regular": "Image with Text · Right",
        "text-left-large": "Image with Text · Left Large", "text-right-large": "Image with Text · Right Large",
        "heading-1": "Heading 1", "heading-2": "Heading 2", "heading-3": "Heading 3",
        wide: "Wide Text", regular: "Regular Text", narrow: "Narrow Text", "banner-video": "YouTube Video",
    };
    return labels[variant] ?? variant;
}

function nextPageLayout(block: Block) {
    const layouts = PAGE_LAYOUTS[block.type];
    if (!layouts) return null;
    const current = text(block.data.variant) || (block.type === "image" ? "large" : block.type === "text" ? "regular" : "regular");
    const index = layouts.indexOf(current);
    return layouts[(index >= 0 ? index + 1 : 0) % layouts.length];
}

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
    const variant = text(data.variant) || (block.type === "image" ? "large" : block.type === "text" ? "regular" : "regular");
    const updateFromStory = (patch: Partial<StoryBlock>) => {
        const nextData = patch.data && typeof patch.data === "object" ? patch.data as Record<string, unknown> : data;
        const nextVariant = typeof patch.variant === "string" ? patch.variant : text(nextData.variant) || variant;
        onChange({
            data: { ...nextData, variant: nextVariant },
            media: patch.media ? patch.media as unknown as Block["media"] : undefined,
        });
    };
    if (block.type === "cover") return <CoverEditor block={block} onChange={onChange} />;
    if (block.type === "image") {
        const storyBlock = toStoryBlock(block);
        if (variant.startsWith("grid-")) return <GridGalleryEditor storyId="" block={storyBlock} onChange={updateFromStory} />;
        if (variant.startsWith("text-")) return <ImageWithTextEditor storyId="" block={storyBlock} onChange={updateFromStory} />;
        return <ImageBlockEditor storyId="" block={storyBlock} onChange={updateFromStory} />;
    }
    if (block.type === "text") {
        const storyBlock = toStoryBlock(block);
        const isColumns = ["columns-1", "columns-2", "columns-3", "columns-4", "text-columns-2", "text-columns-3", "text-columns-4"].includes(variant);
        if (isColumns) return <TextColumnsEditor block={storyBlock} onChange={updateFromStory} />;
        return <div className="space-y-3"><input className="w-full border border-[#d8d3ca] p-3 text-sm" placeholder="Eyebrow / label" value={text(data.eyebrow)} onChange={event => onChange({ data: { ...data, eyebrow: event.target.value } })} /><input className="w-full border border-[#d8d3ca] p-3 text-sm" placeholder="Title" value={text(data.title)} onChange={event => onChange({ data: { ...data, title: event.target.value } })} /><div className="border border-transparent"><div className="px-2 pb-2 text-[9px] uppercase tracking-[0.14em] text-[#8a857d]">{pageLayoutLabel(variant)}</div><div className="border border-[#d8d3ca]"><textarea className="min-h-40 w-full resize-y p-4 text-sm leading-7 outline-none" placeholder="Text content" value={text(data.body)} onChange={event => onChange({ data: { ...data, body: event.target.value } })} /></div></div></div>;
    }
    if (block.type === "content" && variant === "banner-video") return <VideoBlockEditor block={toStoryBlock(block)} onChange={updateFromStory} onSave={updateFromStory} />;
    return <div className="grid gap-3"><input className="w-full border border-[#d8d3ca] p-3 text-sm" placeholder={block.type === "content" ? "Video title" : "Title"} value={text(data.title)} onChange={event => onChange({ data: { ...data, title: event.target.value } })} /><textarea className="min-h-32 w-full border border-[#d8d3ca] p-3 text-sm leading-6" placeholder="Description" value={text(data.body)} onChange={event => onChange({ data: { ...data, body: event.target.value } })} />{block.type === "content" && <input className="w-full border border-[#d8d3ca] p-3 text-sm" placeholder="YouTube URL" value={text(data.youtube_url)} onChange={event => onChange({ data: { ...data, youtube_url: event.target.value } })} />}</div>;
}

function PageBlockPreview({ block }: { block: Block }) {
    const data = block.data;
    const variant = text(data.variant) || block.type;
    const selectedIds = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
    const media = selectedIds.map(id => block.media.find(item => item.id === id)).filter((item): item is Media => Boolean(item));
    const title = text(data.title);
    const eyebrow = text(data.eyebrow);
    const body = text(data.body);
    const safeBody = sanitizeHtml(body);

    if (block.type === "cover") return <div className={`relative mx-auto aspect-[16/7] overflow-hidden bg-[#ddd8cf] ${variant === "cover-contained" ? "max-w-5xl" : "w-full"}`}>
        {media[0] && <img src={mediaUrl(media[0].path)} alt={media[0].alt || title} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10"><p className="text-[10px] uppercase tracking-[0.16em]">{eyebrow || "Homepage"}</p><h2 className="mt-2 font-serif text-3xl">{title || "Cover title"}</h2>{body && <p className="mt-2 max-w-xl text-sm">{body}</p>}</div>
    </div>;
    if (block.type === "image") return <div className="mx-auto max-w-6xl">
        {(eyebrow || title) && <div className="mb-5">{eyebrow && <p className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">{eyebrow}</p>}{title && <h2 className="mt-2 font-serif text-3xl">{title}</h2>}</div>}
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(imageCount(variant), 4)}, minmax(0, 1fr))` }}>{Array.from({ length: imageCount(variant) }, (_, index) => <div key={index} className="aspect-[4/3] overflow-hidden bg-[#ebe7df]">{media[index] && <img src={mediaUrl(media[index].path)} alt={media[index].alt || media[index].filename || ""} className="h-full w-full object-cover" />}</div>)}</div>
    </div>;
    if (block.type === "text") {
        const columns = Array.isArray(data.columns) ? data.columns.map(item => typeof item === "object" && item !== null && "content" in item ? String((item as { content?: unknown }).content ?? "") : String(item ?? "")) : [];
        const count = variant === "columns-2" ? 2 : variant === "columns-3" ? 3 : variant === "columns-4" ? 4 : 1;
        return <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">{eyebrow && <p className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">{eyebrow}</p>}{title && <h2 className="mt-3 font-serif text-4xl">{title}</h2>}{count > 1 ? <div className={`mt-5 grid gap-6 ${count === 2 ? "md:grid-cols-2" : count === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>{Array.from({ length: count }, (_, index) => <div key={index} className="min-w-0 text-sm leading-7 text-[#77736c]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(columns[index] ?? "") }} />)}</div> : body && <div className="mt-5 text-sm leading-7 text-[#77736c]" dangerouslySetInnerHTML={{ __html: safeBody }} />}</div>;
    }
    if (block.type === "content") return <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-2 md:px-10"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">{eyebrow || "Content"}</p><h2 className="mt-3 font-serif text-4xl">{title || "Video title"}</h2></div><div className="text-sm leading-7 text-[#77736c]">{body || text(data.youtube_url) || "Add content details"}</div></div>;
    if (block.type === "links") return <div className="mx-auto max-w-6xl border-t border-[#d8d3ca] px-6 py-8 md:px-10"><p className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">{eyebrow || "Links"}</p><h2 className="mt-2 font-serif text-3xl">{title || "Link collection"}</h2></div>;
    return <div className="mx-auto max-w-6xl px-6 py-8 md:px-10"><p className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">{BLOCK_LABELS[block.type] ?? block.type} · {variant}</p>{title && <h2 className="mt-3 font-serif text-3xl">{title}</h2>}{body && <p className="mt-3 text-sm leading-7 text-[#77736c]">{body}</p>}</div>;
}

function AddPageBlockTrigger({ onClick }: { onClick: () => void }) {
    return <div className="group relative h-8 w-full" aria-label="Insert block">
        <button type="button" onClick={onClick} aria-label="Add block" title="Add block" className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100">
            <span className="absolute left-0 right-0 h-px bg-[#bdb7ad]" aria-hidden="true" />
            <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#bdb7ad] bg-[#f7f5f0] text-sm font-light leading-none text-[#5f5a52] transition-transform group-hover:scale-105">+</span>
        </button>
    </div>;
}

function PageBlockDragHandle({ disabled, onDragStart, onDragEnd }: { disabled?: boolean; onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void; onDragEnd: () => void }) {
    return <button type="button" draggable={!disabled} disabled={disabled} aria-label={disabled ? "Homepage cover stays first" : "Drag to reorder block"} title={disabled ? "Homepage cover stays first" : "Drag to reorder"} onDragStart={onDragStart} onDragEnd={onDragEnd} onMouseDown={event => event.stopPropagation()} className="flex h-7 w-7 cursor-grab items-center justify-center bg-[#f5f2ec] text-[#77736c] hover:bg-white active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40">
        <svg aria-hidden="true" width="14" height="16" viewBox="0 0 14 16" fill="none"><circle cx="4" cy="3" r="1" fill="currentColor" /><circle cx="10" cy="3" r="1" fill="currentColor" /><circle cx="4" cy="8" r="1" fill="currentColor" /><circle cx="10" cy="8" r="1" fill="currentColor" /><circle cx="4" cy="13" r="1" fill="currentColor" /><circle cx="10" cy="13" r="1" fill="currentColor" /></svg>
    </button>;
}

function AdminPagesContent() {
    const [page, setPage] = useState<Page | null>(null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const openPage = useCallback(async (item: Page) => {
        setMessage("");
        const response = await fetch(`/api/pages/${item.slug}`, { cache: "no-store" });
        const data = await response.json() as PageResponse;
        const loaded = (data.blocks ?? []).map(block => ({ id: block.id, type: block.type, sort_order: block.sort_order, data: parseData(block.data), media: block.media ?? [] }));
        setPage(item);
        if (item.page_type === "home") {
            const cover = loaded.find(block => block.type === "cover") ?? { id: crypto.randomUUID(), type: "cover", data: { variant: "cover-full" }, media: [] };
            setBlocks([cover, ...loaded.filter(block => block.id !== cover.id)]);
        } else {
            setBlocks(loaded);
        }
    }, []);

    const loadPages = useCallback(async () => {
        setLoading(true);
        const response = await fetch("/api/admin/pages", { cache: "no-store" });
        const data = await response.json() as { pages?: Page[] };
        const loadedPages = data.pages ?? [];
        const initialPage = loadedPages.find(item => item.page_type === "home") ?? loadedPages[0];
        if (initialPage) await openPage(initialPage);
        setLoading(false);
    }, [openPage]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void loadPages(); }, 0);
        return () => window.clearTimeout(timer);
    }, [loadPages]);

    function addBlock(selection: ContentBlockSelection, afterBlockId?: string) {
        const variant = selection.variant;
        const data = selection.category === "image"
            ? { ...selection.data, variant }
            : selection.category === "content"
                ? { ...selection.data, variant }
                : { variant };
        const newBlock: Block = { id: crypto.randomUUID(), type: selection.category, data, media: [] };
        setBlocks(current => {
            const afterIndex = afterBlockId ? current.findIndex(block => block.id === afterBlockId) : -1;
            const index = afterIndex >= 0 ? afterIndex + 1 : current.length;
            return [...current.slice(0, index), newBlock, ...current.slice(index)];
        });
    }

    function updateBlock(id: string, patch: Partial<Block>) {
        setBlocks(current => current.map(block => block.id === id ? { ...block, ...patch } : block));
    }

    function updateStoryBlock(block: StoryBlock, patch: Partial<StoryBlock>) {
        const dataPatch = patch.data && typeof patch.data === "object" ? patch.data as Record<string, unknown> : {};
        setBlocks(current => current.map(item => item.id === block.id ? {
            ...item,
            ...(patch.type ? { type: patch.type } : {}),
            data: {
                ...item.data,
                ...dataPatch,
                ...(patch.variant !== undefined ? { variant: patch.variant } : {}),
                ...(patch.eyebrow !== undefined ? { eyebrow: patch.eyebrow } : {}),
                ...(patch.title !== undefined ? { title: patch.title } : {}),
                ...(patch.body !== undefined ? { body: patch.body } : {}),
            },
            ...(patch.media ? { media: patch.media as unknown as Media[] } : {}),
        } : item));
    }

    function deleteBlock(blockId: string) {
        setBlocks(current => current.filter(block => block.id !== blockId));
    }

    function storyBlocks() {
        return blocks.filter(block => block.type !== "cover").map(toStoryBlock);
    }

    function handleStoryBlocksChange(next: StoryBlock[]) {
        const cover = blocks.find(block => block.type === "cover");
        const nextBlocks: Block[] = next.map(block => ({
            id: block.id,
            type: block.type,
            sort_order: block.sort_order,
            data: {
                ...block.data,
                variant: block.variant,
                eyebrow: block.eyebrow,
                title: block.title,
                body: block.body,
            },
            media: (block.media ?? []) as unknown as Media[],
        }));
        setBlocks(cover ? [cover, ...nextBlocks] : nextBlocks);
    }

    async function save() { if (!page || saving) return; setSaving(true); setMessage(""); try { const response = await fetch("/api/admin/pages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: page.id, title: page.title, seo_title: page.seo_title, seo_description: page.seo_description, blocks: blocks.map((block, index) => ({ id: block.id, type: block.type, sort_order: index, data: block.data })) }) }); const data = await response.json() as { success?: boolean; error?: string }; if (!response.ok || !data.success) throw new Error(data.error || "Could not save page"); setMessage("Page saved."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save page"); } finally { setSaving(false); } }

    if (loading) return <main className="min-h-[calc(100dvh-64px)] bg-[#f7f5f0] p-12 text-[#171717]">Loading pages…</main>;
    return <main className="min-h-[calc(100dvh-64px)] bg-[#f0eee8] text-[#171717]">
        <div className="flex min-h-[calc(100dvh-64px)] flex-col lg:flex-row">
            <section className="min-w-0 flex-1">
                <div className="sticky top-16 z-30 flex min-h-[68px] items-center justify-between gap-4 border-b border-[#d8d3ca] bg-[#f7f5f0]/95 px-4 backdrop-blur sm:px-6">
                    <div className="min-w-0"><p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Page builder</p><h1 className="truncate text-sm font-medium">{page?.title ?? "Choose a page"}</h1></div>
                    {page && <div className="flex shrink-0 items-center gap-2">
                        <details className="group relative"><summary className="cursor-pointer list-none border border-[#d8d3ca] px-3 py-2.5 text-[9px] uppercase tracking-[0.12em]">SEO</summary><div className="absolute right-0 top-full z-50 mt-2 grid w-[min(84vw,360px)] gap-3 border border-[#d8d3ca] bg-[#fbfaf7] p-4 shadow-lg"><input className="min-w-0 border border-[#d8d3ca] bg-white p-2.5 text-xs" placeholder="SEO title" value={page.seo_title ?? ""} onChange={event => setPage({ ...page, seo_title: event.target.value })} /><textarea className="min-h-20 min-w-0 border border-[#d8d3ca] bg-white p-2.5 text-xs" placeholder="SEO description" value={page.seo_description ?? ""} onChange={event => setPage({ ...page, seo_description: event.target.value })} /></div></details>
                        <Link href={`/${page.slug}`} target="_blank" rel="noreferrer" className="border border-[#d8d3ca] px-3 py-2.5 text-[9px] uppercase tracking-[0.12em]">Preview</Link>
                        <button type="button" onClick={() => void save()} disabled={saving} className="bg-[#171717] px-4 py-2.5 text-[9px] uppercase tracking-[0.12em] text-white disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
                    </div>}
                </div>
                {message && <p className="border-b border-[#d8d3ca] bg-white px-5 py-3 text-xs text-[#666158]">{message}</p>}
                {page ? <div className="overflow-x-auto p-3 sm:p-6 lg:p-8">
                    <div className="mx-auto min-h-[70vh] max-w-[1440px] bg-white shadow-[0_8px_32px_rgba(35,31,26,0.08)]">
                        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#eeeae3] px-5 sm:px-8">
                            <Link href="/" target="_blank" className="shrink-0 text-[10px] font-medium uppercase tracking-[0.18em]">The Scene Studio</Link>
                            <nav className="flex min-w-0 items-center gap-3 overflow-x-auto text-[9px] text-[#77736c] sm:gap-6 sm:text-[10px]">
                                <Link href="/" target="_blank">Home</Link><Link href="/about" target="_blank">About</Link><Link href="/stories" target="_blank">Stories</Link><Link href="/gallery" target="_blank">Gallery</Link><Link href="/contact" target="_blank">Contact</Link>
                            </nav>
                        </div>
                        <div className="px-5 py-8 sm:px-8 lg:px-10">
                            {blocks.find(block => block.type === "cover") && <div className="mb-8 border-b border-[#eeeae3] pb-8"><CoverEditor block={blocks.find(block => block.type === "cover")!} onChange={patch => updateBlock(blocks.find(block => block.type === "cover")!.id, patch)} /></div>}
                            <StoryContent
                                storyId={undefined}
                                blocks={storyBlocks()}
                                onBlocksChange={handleStoryBlocksChange}
                                onDelete={deleteBlock}
                                onUpdate={updateStoryBlock}
                                onAddBlock={addBlock}
                            />
                        </div>
                    </div>
                </div> : <div className="grid min-h-[60vh] place-items-center px-6 text-center"><div><p className="font-serif text-3xl">Your pages will appear here</p><p className="mt-3 text-sm text-[#77736c]">Select a page from the left panel to edit its content.</p></div></div>}
            </section>
        </div>
    </main>;
}

export default function AdminPagesPage() {
    return <AdminPagesContent />;
}