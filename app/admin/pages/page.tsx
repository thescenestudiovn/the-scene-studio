"use client";

import Link from "next/link";
import Footer from "../../components/Footer";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ContentBlockPicker, { type ContentBlockSelection } from "../../../components/story/ContentBlockPicker";
import MediaPickerModal from "../../../components/story/blocks/image/MediaPickerModal";
import { mediaUrl } from "../../../lib/media";
import TextColumnsEditor from "../../../components/story/editor/TextColumnsEditor";
import ImageBlockEditor from "../../../components/story/blocks/image/ImageBlockEditor";
import ImageWithTextEditor from "../../../components/story/blocks/image/ImageWithTextEditor";
import GridGalleryEditor from "../../../components/story/blocks/gallery/GridGalleryEditor";
import VideoBlockEditor from "../../../components/story/blocks/video/VideoBlockEditor";
import ContentBlockEditor from "../../../components/story/blocks/content/ContentBlockEditor";
import ContentBlockView from "../../../components/story/blocks/content/ContentBlockView";
import type { StoryBlock } from "../../../components/story/editor/types";
import StoryContent from "../../../components/story/editor/StoryContent";
import sanitizeHtml from "../../../lib/sanitizeHtml";

type Media = { id: string; path: string; filename?: string | null; alt?: string | null; collection_id?: string | null; width?: number | null; height?: number | null };
type Page = { id: string; title: string; slug: string; page_type: string; seo_title?: string | null; seo_description?: string | null; homepage?: number; menu_order?: number; menu_visibility?: "visible" | "hidden" | "footer"; page_status?: "online" | "offline" | "password" };
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
    text: ["heading", "paragraph", "columns"], // Text is grouped; layout lives in data.layout
    content: ["banner-1","banner-2","banner-3","banner-headline","banner-media","banner-slider-1","info-1","info-2","info-3","testimonial-1","testimonial-2","testimonial-3","pricing-1","pricing-2","pricing-3","faq-1","faq-2","faq-3","quote-1","quote-2","quote-3","banner-video"],
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
        "banner-1":"Banner 1","banner-2":"Banner 2","banner-3":"Banner 3","banner-headline":"Banner · Headline","banner-media":"Banner · Media","banner-slider-1":"Banner · Slider",
        "info-1":"Info 1","info-2":"Info 2","info-3":"Info 3","testimonial-1":"Testimonial 1","testimonial-2":"Testimonial 2","testimonial-3":"Testimonial 3",
        "pricing-1":"Pricing 1","pricing-2":"Pricing 2","pricing-3":"Pricing 3","faq-1":"FAQ 1","faq-2":"FAQ 2","faq-3":"FAQ 3","quote-1":"Quote 1","quote-2":"Quote 2","quote-3":"Quote 3",
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
        <div className={`relative overflow-hidden bg-[#ebe7df] ${text(data.variant) === "cover-contained" ? "mx-auto max-w-5xl" : "w-full"}`}>
            <div className="aspect-[16/7]">
                {image ? (
                    <div className="relative h-full w-full">
                        <img src={mediaUrl(image.path)} alt={image.alt || image.filename || ""} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => setPickerOpen(true)} className="absolute right-4 top-4 bg-white/95 px-4 py-2 text-[9px] uppercase tracking-[0.14em] text-[#171717] shadow-sm hover:bg-white">Change cover image</button>
                    </div>
                ) : (
                    <button type="button" onClick={() => setPickerOpen(true)} className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.14em] text-[#8a857d]">Choose cover image</button>
                )}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white"><p className="text-[10px] uppercase tracking-[0.16em]">{text(data.eyebrow) || "Homepage"}</p><p className="mt-2 font-serif text-3xl">{text(data.title) || "Cover title"}</p></div>
        </div>
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
    if (block.type === "content") {
        if (variant === "banner-video") return <VideoBlockEditor block={toStoryBlock(block)} onChange={updateFromStory} onSave={updateFromStory} />;
        return <ContentBlockEditor block={toStoryBlock(block)} onChange={updateFromStory} />;
    }
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
    if (block.type === "content" && variant !== "banner-video") return <ContentBlockView variant={variant} data={data} media={media} />;
    if (block.type === "links") return <div className="mx-auto max-w-6xl border-t border-[#d8d3ca] px-6 py-8 md:px-10"><p className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">{eyebrow || "Links"}</p><h2 className="mt-2 font-serif text-3xl">{title || "Link collection"}</h2></div>;
    return <div className="mx-auto max-w-6xl px-6 py-8 md:px-10"><p className="text-[10px] uppercase tracking-[0.16em] text-[#77736c]">{BLOCK_LABELS[block.type] ?? block.type} · {variant}</p>{title && <h2 className="mt-3 font-serif text-3xl">{title}</h2>}{body && <p className="mt-3 text-sm leading-7 text-[#77736c]">{body}</p>}</div>;
}


type MenuSlide = {
    id: string;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonUrl: string;
    openNewWindow: boolean;
    media?: Media;
    focalX: number;
    focalY: number;
    altText: string;
    tint: number;
};

function MenuSlideFocalDialog({ slide, onClose, onSave }: { slide: MenuSlide; onClose: () => void; onSave: (x: number, y: number) => void }) {
    const [point, setPoint] = useState(`${slide.focalX}% ${slide.focalY}%`);
    const parts = point.split(" ").map(value => Number.parseFloat(value));
    const x = Number.isFinite(parts[0]) ? parts[0] : 50;
    const y = Number.isFinite(parts[1]) ? parts[1] : 50;
    if (typeof document === "undefined") return null;
    return createPortal(<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-6"><div className="w-full max-w-4xl bg-[#f7f4ee] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Set focal</p><p className="mt-1 text-sm">{slide.media?.filename || "Image"}</p></div><button type="button" onClick={onClose} className="text-lg">×</button></div>
        {slide.media ? <div className="relative mx-auto max-h-[68vh] w-full cursor-crosshair overflow-hidden bg-[#e9e5de]" onClick={event => { const rect=event.currentTarget.getBoundingClientRect(); const clamp=(v:number)=>Math.max(0,Math.min(100,Math.round(v))); setPoint(`${clamp(((event.clientX-rect.left)/rect.width)*100)}% ${clamp(((event.clientY-rect.top)/rect.height)*100)}%`); }}>
            <img src={mediaUrl(slide.media.path)} alt={slide.altText} className="block max-h-[68vh] w-full object-contain" /><span className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/30" style={{left:`${x}%`,top:`${y}%`}} />
        </div> : <div className="grid h-64 place-items-center bg-[#e9e5de] text-[9px] uppercase tracking-[0.12em] text-[#8a857d]">Choose image first</div>}
        <div className="mt-4 flex items-center justify-between"><button type="button" onClick={()=>setPoint("50% 50%")} className="text-[9px] uppercase tracking-[0.14em] underline">Reset</button><div className="flex gap-2"><button type="button" onClick={onClose} className="border border-[#d8d3ca] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.14em]">Cancel</button><button type="button" onClick={()=>onSave(x,y)} className="bg-[#171717] px-4 py-2 text-[9px] uppercase tracking-[0.14em] text-white">Set focal point</button></div></div>
    </div></div>, document.body);
}

function MenuSlideAltDialog({ slide, onClose, onSave }: { slide: MenuSlide; onClose: () => void; onSave: (value: string) => void }) {
    const [value,setValue]=useState(slide.altText);
    if (typeof document==="undefined") return null;
    return createPortal(<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-6"><div className="w-full max-w-lg bg-[#f7f4ee] p-6 shadow-2xl">
        <div className="flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Alt text</p><p className="mt-1 text-sm">{slide.media?.filename || "Image"}</p></div><button type="button" onClick={onClose} className="text-lg">×</button></div>
        <textarea value={value} onChange={e=>setValue(e.target.value)} autoFocus className="mt-5 min-h-28 w-full border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Describe this image for accessibility" />
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="border border-[#d8d3ca] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.14em]">Cancel</button><button type="button" onClick={()=>onSave(value.trim())} className="bg-[#171717] px-4 py-2 text-[9px] uppercase tracking-[0.14em] text-white">Save alt text</button></div>
    </div></div>, document.body);
}

function SiteMenuBlock() {
    const [style, setStyle] = useState<1 | 2 | 3 | 4>(1);
    const [siteLogo, setSiteLogo] = useState("");
    useEffect(() => {
        let active = true;
        fetch("/api/admin/site-settings", { cache: "no-store" })
            .then(async response => {
                if (!response.ok) return null;
                const data = await response.json() as { settings?: { logo?: string } };
                return data.settings?.logo ?? "";
            })
            .then(logo => {
                if (active) setSiteLogo(logo || "");
            })
            .catch(() => {
                if (active) setSiteLogo("");
            });
        return () => { active = false; };
    }, []);
    const [display, setDisplay] = useState<"logo" | "name" | "both">("both");
    const [menuSettingsOpen, setMenuSettingsOpen] = useState(false);
    const [slideSettingsOpen, setSlideSettingsOpen] = useState(false);
    const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
    const [autoPlay, setAutoPlay] = useState(true);
    const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
    const [pages, setPages] = useState<Array<{ slug: string; title: string }>>([]);
    useEffect(() => { fetch("/api/admin/pages", { cache: "no-store" }).then(async response => response.ok ? await response.json() : null).then(data => { if (Array.isArray(data?.pages)) setPages(data.pages.filter((page: unknown): page is { slug: string; title: string } => typeof page === "object" && page !== null && typeof (page as { slug?: unknown }).slug === "string" && typeof (page as { title?: unknown }).title === "string")); }).catch(() => {}); }, []);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [focalOpen, setFocalOpen] = useState(false);
    const [altOpen, setAltOpen] = useState(false);
    const [slides, setSlides] = useState<MenuSlide[]>([
        { id: "slide-1", title: "Photography is Poetry", subtitle: "", buttonText: "", buttonUrl: "", openNewWindow: false, focalX: 50, focalY: 50, altText: "", tint: 25 },
        { id: "slide-2", title: "New slide", subtitle: "", buttonText: "", buttonUrl: "", openNewWindow: false, focalX: 50, focalY: 50, altText: "", tint: 25 },
    ]);

    const selectedSlide = slides.find(slide => slide.id === selectedSlideId) ?? null;
    const pageMode = selectedSlide?.buttonUrl && pages.some(page => "/" + page.slug === selectedSlide.buttonUrl) ? selectedSlide.buttonUrl : selectedSlide?.buttonUrl ? "__custom__" : "";
    const uploadSlideImage = async (files: FileList | File[]) => {
        const file = Array.from(files)[0];
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { window.alert("JPEG, PNG or WebP only"); return; }
        if (file.size > 5 * 1024 * 1024) { window.alert("Maximum 5 MB"); return; }
        setUploading(true);
        try {
            const objectUrl = URL.createObjectURL(file);
            const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
                image.onerror = () => reject(new Error("Could not read image"));
                image.src = objectUrl;
            });
            URL.revokeObjectURL(objectUrl);
            const form = new FormData();
            form.append("file", file);
            form.append("alt", file.name.replace(/\\.[^/.]+$/, ""));
            form.append("width", String(dimensions.width));
            form.append("height", String(dimensions.height));
            const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
            const result = await response.json() as { success?: boolean; error?: string; media?: Media };
            if (!response.ok || !result.success || !result.media) throw new Error(result.error || "Upload failed");
            updateSlide({ media: result.media });
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };
    const updateSlide = (patch: Partial<MenuSlide>) => {
        if (!selectedSlideId) return;
        setSlides(current => current.map(slide => slide.id === selectedSlideId ? { ...slide, ...patch } : slide));
    };
    const moveSlide = (index: number, direction: -1 | 1) => {
        setSlides(current => {
            const next = index + direction;
            if (next < 0 || next >= current.length) return current;
            const copy = [...current];
            [copy[index], copy[next]] = [copy[next], copy[index]];
            return copy;
        });
    };
    const deleteSlide = (id: string) => {
        setSlides(current => current.filter(slide => slide.id !== id));
        if (selectedSlideId === id) {
            setSelectedSlideId(null);
            setSlideSettingsOpen(false);
        }
    };
    const addSlide = () => {
        const id = crypto.randomUUID();
        setSlides(current => [...current, { id, title: "New slide", subtitle: "", buttonText: "", buttonUrl: "", openNewWindow: false, focalX: 50, focalY: 50, altText: "", tint: 25 }]);
    };
    const openSlide = (id: string) => {
        setSelectedSlideId(id);
        setSlideSettingsOpen(true);
        setMenuSettingsOpen(false);
    };

    const logoMarkup = siteLogo ? (
        <img src={mediaUrl(siteLogo)} alt="The Scene Studio" className="max-h-8 max-w-[140px] object-contain" />
    ) : (
        <span className="text-[10px] uppercase tracking-[0.12em] text-[#8a857d]">Logo</span>
    );
    const menuText = display === "logo" ? logoMarkup : display === "name" ? "The Scene Studio" : (
        <span className="flex items-center gap-3">
            {logoMarkup}
            <span>The Scene Studio</span>
        </span>
    );
    const previewSlide = slides[previewSlideIndex] ?? slides[0];
    const bg = previewSlide?.media ? mediaUrl(previewSlide.media.path) : "";
    const menuFrameClass = style === 3 ? "aspect-video w-full" : style === 4 ? "aspect-[3/2] w-full" : "min-h-[120px] w-full";
    const menuFrameStyle = style >= 3 && bg ? {
        backgroundImage: "linear-gradient(rgba(0,0,0," + ((previewSlide?.tint ?? 25) / 100) + "),rgba(0,0,0," + ((previewSlide?.tint ?? 25) / 100) + ")),url(" + bg + ")",
        backgroundSize: "cover",
        backgroundPosition: (previewSlide?.focalX ?? 50) + "% " + (previewSlide?.focalY ?? 50) + "%",
    } : undefined;

    return <>
        <section className={"group relative overflow-hidden border border-[#d8d3ca] bg-[#fbfaf7] " + (style >= 3 ? "text-white" : "")}>
            <div className={"relative overflow-hidden " + menuFrameClass} style={menuFrameStyle}>
                <div className={"relative z-10 flex items-center justify-between gap-6 px-5 py-5 sm:px-8 " + (style === 2 ? "absolute inset-x-0 top-0" : "")}>
                    {(style === 2 || style === 4) ? <>
                        <nav className="flex flex-1 items-center gap-4 text-[9px] uppercase tracking-[0.12em]"><span>Home</span><span>About</span><span>Portfolio</span></nav>
                        <div className="flex w-28 shrink-0 flex-col items-center text-center">
                            {(display === "logo" || display === "both") && (siteLogo ? <img src={mediaUrl(siteLogo)} alt="The Scene Studio" className="max-h-8 max-w-[110px] object-contain" /> : <span className="text-[10px] uppercase tracking-[0.12em] text-[#8a857d]">Logo</span>)}
                            {(display === "name" || display === "both") && <span className={display === "both" ? "mt-2 text-[9px] uppercase tracking-[0.12em]" : "text-[9px] uppercase tracking-[0.12em]"}>The Scene Studio</span>}
                        </div>
                        <nav className="flex flex-1 justify-end gap-4 text-[9px] uppercase tracking-[0.12em]"><span>Blog</span><span>Film</span><span>Contact</span></nav>
                    </> : <>
                        <div className="shrink-0 text-[10px] font-medium uppercase tracking-[0.15em]">{menuText}</div>
                        <nav className="flex min-w-0 items-center justify-end gap-3 overflow-x-auto text-[9px] uppercase tracking-[0.12em] sm:gap-5"><span>Home</span><span>About</span><span>Portfolio</span><span>Blog</span><span>Film</span><span>Contact</span></nav>
                    </>}
                </div>
                {style >= 3 ? (
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center text-white sm:p-10">
                        <div className="max-w-2xl">
                            <p className="font-serif text-2xl sm:text-4xl">{previewSlide?.title || "Slide title"}</p>
                            {previewSlide?.subtitle ? <p className="mt-2 text-sm sm:text-base">{previewSlide.subtitle}</p> : null}
                            {previewSlide?.buttonText ? <a href={previewSlide.buttonUrl || "#"} target={previewSlide.openNewWindow ? "_blank" : undefined} rel={previewSlide.openNewWindow ? "noreferrer" : undefined} className="mt-5 inline-flex border border-white px-5 py-2 text-[9px] uppercase tracking-[0.14em]">{previewSlide.buttonText}</a> : null}
                        </div>
                        {slides.length >= 2 ? (
                            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 text-[9px] uppercase tracking-[0.12em]">
                                <button type="button" aria-label="Previous slide" onClick={() => setPreviewSlideIndex(current => (current - 1 + slides.length) % slides.length)} className="hover:opacity-70">←</button>
                                <span>{String(previewSlideIndex + 1).padStart(2, "0")} {" / "} {String(slides.length).padStart(2, "0")}</span>
                                <button type="button" aria-label="Next slide" onClick={() => setPreviewSlideIndex(current => (current + 1) % slides.length)} className="hover:opacity-70">→</button>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
            <div className="pointer-events-none absolute right-3 top-3 z-30 flex gap-1 opacity-0 transition-opacity duration-150 hover:opacity-100 group-hover:opacity-100">
                <button type="button" onClick={() => setStyle(current => current === 4 ? 1 : (current + 1) as 1 | 2 | 3 | 4)} aria-label="Switch menu style" title="Switch menu style" className="pointer-events-auto flex h-7 items-center border border-[#d8d3ca] bg-[#fbfaf7]/95 px-2 text-[8px] uppercase tracking-[0.1em] shadow-sm hover:bg-white">Switch</button>
                <button type="button" onClick={() => setMenuSettingsOpen(true)} aria-label="Menu settings" title="Menu settings" className="pointer-events-auto flex h-7 w-7 items-center justify-center border border-[#d8d3ca] bg-[#fbfaf7]/95 text-sm shadow-sm hover:bg-white">⚙</button>
            </div>
        </section>

        {(menuSettingsOpen || slideSettingsOpen) && <div className="fixed inset-y-0 left-0 z-[100] w-[min(390px,92vw)] overflow-y-auto border-r border-[#d8d3ca] bg-[#f7f5f0] p-5 shadow-2xl">
            {slideSettingsOpen && selectedSlide ? <>
                <div className="mb-6 flex items-center justify-between border-b border-[#d8d3ca] pb-4">
                    <button type="button" onClick={() => { setSlideSettingsOpen(false); setMenuSettingsOpen(true); }} className="text-[9px] uppercase tracking-[0.14em]">← Header Slider</button>
                    <button type="button" onClick={() => setSlideSettingsOpen(false)} className="text-lg">×</button>
                </div>
                <p className="mb-5 text-[10px] uppercase tracking-[0.16em] text-[#77736c]">Header Slider &gt; Slide</p>
                <div className="space-y-5">
                    <div>
                        <label className="mb-2 block text-[9px] uppercase tracking-[0.14em]">Image</label>
                        <div className="grid gap-3">
                            <p className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Image</p>
                            <div
                                className={"relative overflow-hidden border border-dashed bg-white transition " + (dragOver ? "border-[#171717] bg-[#f5f2ed]" : "border-[#cfc8bf]")}
                                onDragOver={event => { event.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={event => { event.preventDefault(); setDragOver(false); void uploadSlideImage(event.dataTransfer.files); }}
                            >
                                {selectedSlide.media ? (
                                    <div className="group relative aspect-[16/7] overflow-hidden bg-[#e9e5de]">
                                        <img src={mediaUrl(selectedSlide.media.path)} alt={selectedSlide.media.alt || selectedSlide.media.filename || selectedSlide.altText} className="h-full w-full object-cover" style={{ objectPosition: selectedSlide.focalX + "% " + selectedSlide.focalY + "%" }} />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-white opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                                            <div className="mb-1 text-[8px] uppercase tracking-[0.16em] text-white/60">Image</div>
                                            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                                                <button type="button" onClick={() => setPickerOpen(true)} className="text-[9px] uppercase tracking-[0.08em] hover:text-white/70">Change Image</button>
                                                <button type="button" onClick={() => setFocalOpen(true)} className="text-[9px] uppercase tracking-[0.08em] hover:text-white/70">Set Focal</button>
                                                <button type="button" onClick={() => setAltOpen(true)} className="text-[9px] uppercase tracking-[0.08em] hover:text-white/70">Alt Text</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
                                        <p className="text-sm text-[#77736c]">Drag photo here</p>
                                        <p className="mt-1 text-[11px] text-[#aaa49a]">Or upload photo from:</p>
                                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                                            <button type="button" onClick={() => setPickerOpen(true)} className="border border-[#d8d3ca] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.13em] hover:border-[#171717]">Gallery</button>
                                            <button type="button" onClick={() => document.getElementById("menu-slide-upload")?.click()} disabled={uploading} className="border border-[#d8d3ca] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.13em] hover:border-[#171717] disabled:opacity-50">My Computer</button>
                                        </div>
                                    </div>
                                )}
                                <input id="menu-slide-upload" hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event => void uploadSlideImage(event.target.files ?? [])} />
                            </div>
                        </div>
                    </div>
                    <label className="block text-[9px] uppercase tracking-[0.14em]">Title<input className="mt-2 w-full border border-[#d8d3ca] bg-white p-3 text-sm" value={selectedSlide.title} onChange={e => updateSlide({ title: e.target.value })} /></label>
                    <label className="block text-[9px] uppercase tracking-[0.14em]">Subtitle<input className="mt-2 w-full border border-[#d8d3ca] bg-white p-3 text-sm" value={selectedSlide.subtitle} onChange={e => updateSlide({ subtitle: e.target.value })} /></label>
                    <label className="block text-[9px] uppercase tracking-[0.14em]">Button text<input className="mt-2 w-full border border-[#d8d3ca] bg-white p-3 text-sm" value={selectedSlide.buttonText} onChange={e => updateSlide({ buttonText: e.target.value })} /></label>
                    <div className="grid gap-2">
                        <span className="text-[9px] uppercase tracking-[0.14em]">Button URL</span>
                        <select value={pageMode} onChange={event => { const value = event.target.value; updateSlide({ buttonUrl: value === "__custom__" ? "" : value }); }} className="border border-[#d8d3ca] bg-white p-3 text-sm">
                            <option value="">No link</option>
                            {pages.map(page => <option key={page.slug} value={"/" + page.slug}>{page.title}</option>)}
                            <option value="__custom__">Custom URL</option>
                        </select>
                        {pageMode === "__custom__" && <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="https://..." value={selectedSlide.buttonUrl} onChange={e => updateSlide({ buttonUrl: e.target.value })} />}
                    </div>
                    <label className="flex items-center gap-2 text-[10px]"><input type="checkbox" checked={selectedSlide.openNewWindow} onChange={e => updateSlide({ openNewWindow: e.target.checked })} /> Open link in new window</label>
                    <label className="block text-[9px] uppercase tracking-[0.14em]">Background Tint<input type="range" min="0" max="100" value={selectedSlide.tint} onChange={e => updateSlide({ tint: Number(e.target.value) })} className="mt-2 w-full" /></label>
                </div>
            </> : <>
                <div className="mb-6 flex items-center justify-between border-b border-[#d8d3ca] pb-4"><p className="text-[10px] uppercase tracking-[0.16em]">Site Menu Settings</p><button type="button" onClick={() => setMenuSettingsOpen(false)} className="text-lg">×</button></div>
                <div className="space-y-7">
                    <div>
                        <p className="mb-3 text-[9px] uppercase tracking-[0.14em]">Menu Style</p>
                        <div className="grid grid-cols-2 gap-2">{([1,2,3,4] as const).map(item => <button key={item} type="button" onClick={() => setStyle(item)} className={"border px-3 py-2 text-[9px] uppercase tracking-[0.12em] " + (style === item ? "border-[#171717] bg-[#171717] text-white" : "border-[#d8d3ca] bg-white")}>Style {item}</button>)}</div>
                    </div>
                    <div>
                        <p className="mb-3 text-[9px] uppercase tracking-[0.14em]">Logo / Studio Name</p>
                        <div className="space-y-2">{[["logo","Chỉ logo"],["name","Chỉ tên studio"],["both","Logo + tên studio"]].map(([value,label]) => <label key={value} className="flex items-center gap-2 text-xs"><input type="radio" name="menu-display" checked={display === value} onChange={() => setDisplay(value as typeof display)} /> {label}</label>)}</div>
                    </div>
                    {style >= 3 && <div>
                        <p className="mb-3 text-[9px] uppercase tracking-[0.14em]">Slides</p>
                        <div className="space-y-3">{slides.map((slide, index) => <div key={slide.id} className="border border-[#d8d3ca] bg-white p-2">
                            <button type="button" onClick={() => openSlide(slide.id)} className="relative block aspect-[16/7] w-full overflow-hidden bg-[#ebe7df] text-left">
                                {slide.media && <img src={mediaUrl(slide.media.path)} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                                <span className="absolute inset-0 bg-black/25" />
                                <span className="absolute inset-x-3 bottom-3 text-xs text-white">{slide.title}</span>
                            </button>
                            <div className="mt-2 flex items-center justify-end gap-2"><button type="button" disabled={index === 0} onClick={() => moveSlide(index,-1)} className="text-xs disabled:opacity-30">↑</button><button type="button" disabled={index === slides.length-1} onClick={() => moveSlide(index,1)} className="text-xs disabled:opacity-30">↓</button><button type="button" onClick={() => deleteSlide(slide.id)} className="text-xs">🗑</button></div>
                        </div>)}</div>
                        <button type="button" onClick={addSlide} className="mt-3 border border-[#d8d3ca] px-3 py-2 text-[9px] uppercase tracking-[0.12em]">+ Add New</button>
                        <div className="mt-6 border-t border-[#d8d3ca] pt-5"><p className="mb-3 text-[9px] uppercase tracking-[0.14em]">Options</p><label className="flex items-center justify-between text-xs">Auto play slides<input type="checkbox" checked={autoPlay} onChange={e => setAutoPlay(e.target.checked)} /></label></div>
                    </div>}
                </div>
            </>}
        </div>}
        <MediaPickerModal collectionId="" open={pickerOpen} required={1} selectedIds={selectedSlide?.media ? [selectedSlide.media.id] : []} onClose={() => setPickerOpen(false)} onDone={(_collectionId, mediaIds, media) => {
            if (selectedSlideId) {
                const chosen = media.find(item => item.id === mediaIds[0]);
                updateSlide({ media: chosen });
            }
            setPickerOpen(false);
        }} />
        {focalOpen && selectedSlide?.media && <MenuSlideFocalDialog slide={selectedSlide} onClose={() => setFocalOpen(false)} onSave={(x,y) => { updateSlide({ focalX:x, focalY:y }); setFocalOpen(false); }} />}
        {altOpen && selectedSlide?.media && <MenuSlideAltDialog slide={selectedSlide} onClose={() => setAltOpen(false)} onSave={value => { updateSlide({ altText:value }); setAltOpen(false); }} />}
    </>;
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

function AdminPagesContent({ initialSlug = "home" }: { initialSlug?: string }) {
    const [page, setPage] = useState<Page | null>(null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [sitePages, setSitePages] = useState<Page[]>([]);
    const [blockPickerOpen, setBlockPickerOpen] = useState(false);
    const [insertAfterBlockId, setInsertAfterBlockId] = useState<string | undefined>(undefined);

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
            setBlocks(loaded.filter(block => block.type !== "cover"));
        }
    }, []);

    const loadPages = useCallback(async () => {
        setLoading(true);
        const response = await fetch("/api/admin/pages", { cache: "no-store" });
        const data = await response.json() as { success?: boolean; pages?: Page[]; error?: string };
        if (!response.ok || !data.success) {
            setMessage(data.error || "Failed to load pages");
            setLoading(false);
            return;
        }
        const loadedPages = data.pages ?? [];
        setSitePages(loadedPages.filter(item => item.menu_visibility === "visible" && item.page_status !== "offline"));
        const initialPage =
            loadedPages.find(item => item.slug === initialSlug) ??
            (initialSlug === "home" ? loadedPages.find(item => item.page_type === "home") : undefined);
        if (initialPage) await openPage(initialPage);
        else setMessage("Page not found: " + initialSlug);
        setLoading(false);
    }, [openPage]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void loadPages(); }, 0);
        return () => window.clearTimeout(timer);
    }, [loadPages]);

    function openBlockPicker(afterBlockId?: string) { setInsertAfterBlockId(afterBlockId); setBlockPickerOpen(true); }

    function addBlock(selection: ContentBlockSelection) { const afterBlockId = insertAfterBlockId; setBlockPickerOpen(false);
        const variant = selection.variant;
        const layout = selection.category === "text" && typeof selection.data?.layout === "string" ? selection.data.layout : variant;
        const textDefaults: Record<string, string> = {
            "heading-1": "Heading 1",
            "heading-2": "Heading 2",
            "heading-3": "Heading 3",
            wide: "This is a sample wide text. Tell your story with thoughtful words, meaningful details, and the moments that make this story yours.",
            regular: "This is a sample regular text. Replace this copy with the story, memories, and details you want your readers to discover.",
            narrow: "This is a sample narrow text. A more intimate reading width works beautifully for personal stories, reflections, and meaningful details.",
        };
        const columnDefaults: Record<string, string[]> = {
            "columns-2": [
                "This is the first column. Add your story, a meaningful detail, or a short reflection here.",
                "This is the second column. Continue the story with another detail, memory, or thought here.",
            ],
            "columns-3": [
                "First column sample text. Add a short story or detail here.",
                "Second column sample text. Add another meaningful moment here.",
                "Third column sample text. Finish this section with another thought here.",
            ],
            "columns-4": [
                "First column sample text.",
                "Second column sample text.",
                "Third column sample text.",
                "Fourth column sample text.",
            ],
        };
        const columns = selection.category === "text" && variant === "columns" ? columnDefaults[layout] : undefined;
        const data = selection.category === "image"
            ? { ...selection.data, variant }
            : selection.category === "content"
                ? { ...selection.data, variant }
                : selection.category === "contact"
                    ? {
                        ...selection.data,
                        variant,
                        ...(variant === "form-with-image-left" || variant === "form-with-image-right"
                            ? { image_url: "https://assets-pw.pixieset.com/classic-themes/theme-images/sample_photos/sample-9_LG.jpg" }
                            : {}),
                    }
                : selection.category === "map"
                    ? { ...selection.data, variant }
                    : {
                        variant,
                        ...(selection.category === "text" ? { layout } : {}),
                        ...(columns
                            ? { columns: columns.map(content => ({ content })) }
                            : { body: textDefaults[layout] ?? "This is sample text. Replace this content with your story." }),
                    };
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
                ...(block.variant ? { variant: block.variant } : {}),
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
                        <SiteMenuBlock />
                        <div className="px-5 py-8 sm:px-8 lg:px-10">
                            {blocks.find(block => block.type === "cover") && <div className="mb-8 border-b border-[#eeeae3] pb-8"><CoverEditor block={blocks.find(block => block.type === "cover")!} onChange={patch => updateBlock(blocks.find(block => block.type === "cover")!.id, patch)} /></div>}
                            <StoryContent
                                storyId=""
                                blocks={storyBlocks()}
                                onBlocksChange={handleStoryBlocksChange}
                                onDelete={deleteBlock}
                                onUpdate={updateStoryBlock}
                                onAddBlock={openBlockPicker}
                            />
                        </div>
                        <Footer />
                    </div>
                </div> : <div className="grid min-h-[60vh] place-items-center px-6 text-center"><div><p className="font-serif text-3xl">Your pages will appear here</p><p className="mt-3 text-sm text-[#77736c]">Select a page from the left panel to edit its content.</p></div></div>}
            </section>
        </div>
        <ContentBlockPicker open={blockPickerOpen} onClose={() => setBlockPickerOpen(false)} onSelect={addBlock} />
    </main>;
}

export default function AdminPagesPage({ initialSlug = "home" }: { initialSlug?: string }) {
    return <AdminPagesContent initialSlug={initialSlug} />;
}