"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MediaPickerModal from "../image/MediaPickerModal";
import { mediaUrl } from "../../../../lib/media";
import type { Media, StoryBlock } from "../../editor/types";
import ContentBlockView from "./ContentBlockView";

type Props = { block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void };
type SitePage = { slug: string; title: string };

function text(value: unknown) { return typeof value === "string" ? value : ""; }
function list(value: unknown) { return Array.isArray(value) ? value.map(item => item && typeof item === "object" ? item as Record<string, unknown> : {}) : []; }

const BANNER_VARIANTS = ["banner-1", "banner-2", "banner-3"];

function mediaFromResponse(value: unknown): Media | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<Media>;
  return typeof item.id === "string" && typeof item.path === "string" && typeof item.filename === "string"
    ? item as Media
    : null;
}

async function imageDimensions(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("Could not read image"));
      image.src = url;
    });
    return dimensions;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function bannerTintValue(value: unknown) {
  const raw = Number(value);
  return Number.isFinite(raw) ? Math.max(0, Math.min(0.7, raw)) : 0.25;
}

function BannerBlockEditor({ block, onChange }: Props) {
  const data = block.data ?? {};
  const variant = block.variant ?? text(data.variant) ?? "banner-1";
  const media = block.media ?? [];
  const selectedIds = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
  const maxImages = variant === "banner-slider-1" ? 3 : 1;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pages, setPages] = useState<SitePage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/pages", { cache: "no-store" })
      .then(response => response.json() as Promise<{ pages?: SitePage[] }>)
      .then(result => {
        if (active) setPages(Array.isArray(result.pages) ? result.pages : []);
      })
      .catch(() => { if (active) setPages([]); });
    return () => { active = false; };
  }, []);

  const selectedMedia = useMemo(() => selectedIds
    .map(id => media.find(item => item.id === id))
    .filter((item): item is Media => Boolean(item))
    .slice(0, maxImages), [media, maxImages, selectedIds]);

  const update = (key: string, value: unknown) => {
    onChange({
      data: {
        ...data,
        [key]: value,
        variant,
      },
      ...(key === "title" ? { title: text(value) } : {}),
      ...(key === "body" ? { body: text(value) } : {}),
    });
  };

  const applyMedia = (ids: string[], records: Media[]) => {
    onChange({
      data: {
        ...data,
        variant,
        media_ids: ids.slice(0, maxImages),
      },
      media: records.slice(0, maxImages) as StoryBlock["media"],
    });
  };

  async function upload(files: FileList | File[]) {
    const incoming = Array.from(files).slice(0, Math.max(0, maxImages - selectedMedia.length));
    if (!incoming.length) return;
    setUploading(true);
    try {
      const uploaded: Media[] = [];
      for (const file of incoming) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error(`${file.name}: JPEG, PNG or WebP only`);
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name}: maximum 5 MB`);
        const { width, height } = await imageDimensions(file);
        const form = new FormData();
        form.append("file", file);
        form.append("alt", file.name.replace(/\\.[^/.]+$/, ""));
        form.append("width", String(width));
        form.append("height", String(height));
        const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
        const result = await response.json() as { success?: boolean; error?: string; media?: unknown };
        if (!response.ok || !result.success) throw new Error(result.error || `Failed to upload ${file.name}`);
        const record = mediaFromResponse(result.media);
        if (record) uploaded.push(record);
      }
      const records = [...selectedMedia, ...uploaded].slice(0, maxImages);
      applyMedia(records.map(item => item.id), records);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const backgroundType = text(data.background_type) || (variant === "banner-2" ? "image" : "image");
  const bannerSize = text(data.banner_size) || "large";
  const tint = bannerTintValue(data.background_tint);
  const buttonUrl = text(data.button_url);
  const selectedPage = pages.some(page => `/${page.slug}` === buttonUrl) ? buttonUrl : "";
  const pageMode = selectedPage ? selectedPage : buttonUrl ? "__custom__" : "";

  return <div className="grid gap-5">
    <ContentBlockView variant={variant} data={data} media={media} />

    <div className="grid gap-6 border border-[#d8d3ca] bg-[#fbfaf7] p-5">
      <div className="grid gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Banner</p>
          <p className="mt-1 text-xs text-[#77736c]">{variant.replace(/-/g, " ")}</p>
        </div>

        <section>
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#5f5a52]">Content</div>
          <div className="grid gap-4">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Background type</p>
              <div className="grid grid-cols-2 border border-[#d8d3ca] bg-white">
                {["image", "video"].map(type => <button key={type} type="button" onClick={() => update("background_type", type)} className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] ${backgroundType === type ? "bg-[#171717] text-white" : "text-[#77736c] hover:bg-[#f5f2ed]"}`}>{type === "image" ? "Image" : "Video"}</button>)}
              </div>
            </div>

            {backgroundType === "image" ? <div className="grid gap-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Image</p>
              <div
                className={`relative overflow-hidden border border-dashed bg-white transition ${dragOver ? "border-[#171717] bg-[#f5f2ed]" : "border-[#cfc8bf]"}`}
                onDragOver={event => { event.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={event => { event.preventDefault(); setDragOver(false); void upload(event.dataTransfer.files); }}
              >
                {selectedMedia[0] ? (
                  <div className="relative aspect-[16/7]">
                    <img src={`https://media.thescenestudio.asia/${selectedMedia[0].path}`} alt={selectedMedia[0].alt || selectedMedia[0].filename} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 bg-black/55 p-3">
                      <span className="truncate text-[10px] text-white">{selectedMedia[0].filename}</span>
                      <button type="button" onClick={() => setPickerOpen(true)} className="shrink-0 bg-white px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[#171717]">Replace</button>
                    </div>
                  </div>
                ) : <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
                  <p className="text-sm text-[#77736c]">Drag photo here</p>
                  <p className="mt-1 text-[11px] text-[#aaa49a]">Or upload photo from:</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={() => setPickerOpen(true)} className="border border-[#d8d3ca] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.13em] hover:border-[#171717]">Gallery</button>
                    <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="border border-[#d8d3ca] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.13em] hover:border-[#171717] disabled:opacity-50">My Computer</button>
                  </div>
                </div>}
                <input ref={inputRef} hidden type="file" multiple={maxImages > 1} accept="image/jpeg,image/png,image/webp" onChange={event => void upload(event.target.files ?? [])} />
              </div>
              {variant === "banner-slider-1" && <p className="text-[10px] text-[#99938b]">Select up to 3 images for this slider.</p>}
            </div> : <div className="grid gap-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Video URL</p>
              <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="YouTube URL" value={text(data.video_url)} onChange={e => update("video_url", e.target.value)} />
            </div>}

            <div className="grid gap-3">
              <label className="grid gap-2"><span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Title</span><input className="border border-[#d8d3ca] bg-white p-3 text-sm" value={text(data.title)} onChange={e => update("title", e.target.value)} /></label>
              <label className="grid gap-2"><span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Subtitle</span><textarea className="min-h-24 border border-[#d8d3ca] bg-white p-3 text-sm" value={text(data.subtitle || data.body)} onChange={e => onChange({ data: { ...data, variant, subtitle: e.target.value, body: e.target.value }, body: e.target.value })} /></label>
              <label className="grid gap-2"><span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Button text</span><input className="border border-[#d8d3ca] bg-white p-3 text-sm" value={text(data.button_text)} onChange={e => update("button_text", e.target.value)} /></label>
              <div className="grid gap-2">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Button URL</span>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <select value={pageMode} onChange={event => { const value = event.target.value; update("button_url", value === "__custom__" ? "" : value); }} className="border border-[#d8d3ca] bg-white p-3 text-sm">
                    <option value="">No link</option>
                    {pages.map(page => <option key={page.slug} value={`/${page.slug}`}>{page.title}</option>)}
                    <option value="__custom__">Custom URL</option>
                  </select>
                  {pageMode === "__custom__" && <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="https://..." value={buttonUrl} onChange={e => update("button_url", e.target.value)} />}
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#625e57]"><input type="checkbox" checked={Boolean(data.button_new_window)} onChange={e => update("button_new_window", e.target.checked)} /> Open link in new window</label>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e3ded6] pt-5">
          <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[#5f5a52]">Options</div>
          <div className="grid gap-4">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Banner size</p>
              <div className="grid grid-cols-3 border border-[#d8d3ca] bg-white">
                {["large", "medium", "small"].map(size => <button key={size} type="button" onClick={() => update("banner_size", size)} className={`px-3 py-2.5 text-[10px] uppercase tracking-[0.14em] ${bannerSize === size ? "bg-[#171717] text-white" : "text-[#77736c] hover:bg-[#f5f2ed]"}`}>{size}</button>)}
              </div>
            </div>
            <label className="grid gap-2">
              <div className="flex items-center justify-between gap-3"><span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Background tint</span><span className="text-[10px] text-[#8a857d]">{Math.round(tint * 100)}%</span></div>
              <input type="range" min="0" max="70" value={Math.round(tint * 100)} onChange={e => update("background_tint", Number(e.target.value) / 100)} />
            </label>
          </div>
        </section>
      </div>
    </div>

    <MediaPickerModal
      open={pickerOpen}
      required={maxImages}
      selectedIds={selectedIds.slice(0, maxImages)}
      collectionId=""
      onClose={() => setPickerOpen(false)}
      onDone={(_collectionId, ids, selectedMedia) => {
        applyMedia(ids, selectedMedia as unknown as Media[]);
        setPickerOpen(false);
      }}
    />
  </div>;
}

export default function ContentBlockEditor({ block, onChange }: Props) {
  const data = block.data ?? {};
  const variant = block.variant ?? text(data.variant) ?? "banner-1";
  const media = block.media ?? [];
  const selectedIds = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
  const [pickerOpen, setPickerOpen] = useState(false);
  const items = useMemo(() => list(data.items), [data.items]);
  const update = (key: string, value: unknown) => onChange({ data: { ...data, [key]: value }, ...(key === "title" ? { title: text(value) } : {}), ...(key === "body" ? { body: text(value) } : {}) });
  const updateItem = (index: number, patch: Record<string, unknown>) => update("items", items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const hasImage = ["info-1", "info-2", "testimonial-2"].includes(variant);
  const needsButton = variant.startsWith("banner");

  if (BANNER_VARIANTS.includes(variant)) return <BannerBlockEditor block={block} onChange={onChange} />;

  return <div className="grid gap-5">
    <ContentBlockView variant={variant} data={data} media={media} />
    <div className="grid gap-3 border border-[#d8d3ca] bg-[#fbfaf7] p-5">
      <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">Content · {variant}</p>
      <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Eyebrow" value={text(data.eyebrow)} onChange={e=>update("eyebrow",e.target.value)} />
      <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Heading" value={text(data.title)} onChange={e=>update("title",e.target.value)} />
      <textarea className="min-h-24 border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Description" value={text(data.body)} onChange={e=>update("body",e.target.value)} />
      {variant.startsWith("testimonial") || variant.startsWith("quote") ? <><textarea className="min-h-28 border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Quote" value={text(data.quote)} onChange={e=>update("quote",e.target.value)} /><input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Author" value={text(data.author)} onChange={e=>update("author",e.target.value)} /><input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Role" value={text(data.role)} onChange={e=>update("role",e.target.value)} /></> : null}
      {hasImage && <button type="button" className="justify-self-start border border-[#171717] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.14em]" onClick={()=>setPickerOpen(true)}>{selectedIds.length ? "Change image" : "Choose image"}</button>}
      {(variant.startsWith("info") || variant.startsWith("pricing") || variant.startsWith("faq") || variant === "banner-slider-1") && <div className="grid gap-3">{items.map((item,index)=><div key={index} className="grid gap-2 border-t border-[#e3ded6] pt-3">
        {variant.startsWith("faq") ? <><input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Question" value={text(item.question)} onChange={e=>updateItem(index,{question:e.target.value})}/><textarea className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Answer" value={text(item.answer)} onChange={e=>updateItem(index,{answer:e.target.value})}/></> : <><input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Title" value={text(item.title)} onChange={e=>updateItem(index,{title:e.target.value})}/>{variant.startsWith("pricing")&&<input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Price" value={text(item.price)} onChange={e=>updateItem(index,{price:e.target.value})}/>}<textarea className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder={variant.startsWith("pricing") ? "Description" : "Text"} value={text(item.text)} onChange={e=>updateItem(index,{text:e.target.value})}/>{variant.startsWith("pricing")&&<input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Features, separated by commas" value={text(item.features)} onChange={e=>updateItem(index,{features:e.target.value})}/>}</>}
      </div>)}</div>}
    </div>
    {hasImage && <MediaPickerModal open={pickerOpen} required={1} selectedIds={selectedIds.slice(0,1)} collectionId="" onClose={()=>setPickerOpen(false)} onDone={(_collectionId, ids, selectedMedia)=>{ onChange({ data: {...data, media_ids: ids.slice(0,1)}, media: selectedMedia as unknown as StoryBlock["media"] }); setPickerOpen(false); }} />}
  </div>;
}
