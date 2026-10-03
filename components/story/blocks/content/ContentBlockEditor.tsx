"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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


function clampPercent(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

function FocalPointDialog({ media, value, onClose, onSave }: { media: Media; value: string; onClose: () => void; onSave: (value: string) => void }) {
  const [point, setPoint] = useState(value || "50% 50%");
  const parts = point.split(" ").map(item => Number.parseFloat(item));
  const x = Number.isFinite(parts[0]) ? parts[0] : 50;
  const y = Number.isFinite(parts[1]) ? parts[1] : 50;
  if (typeof document === "undefined") return null;
  return createPortal(
    <div data-admin-modal className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-6" onMouseDown={event => event.stopPropagation()}>
    <div className="w-full max-w-4xl bg-[#f7f4ee] p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Set focal</p><p className="mt-1 text-sm">{media.filename}</p></div><button type="button" onClick={onClose} className="text-lg leading-none text-[#6f6a62]" aria-label="Close">×</button></div>
      <div className="relative mx-auto max-h-[68vh] w-full cursor-crosshair overflow-hidden bg-[#e9e5de]" onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); setPoint(`${clampPercent(((event.clientX - rect.left) / rect.width) * 100)}% ${clampPercent(((event.clientY - rect.top) / rect.height) * 100)}%`); }}>
        <img src={mediaUrl(media.path)} alt={media.alt ?? ""} className="block max-h-[68vh] w-full object-contain" />
        <span className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/30 shadow-[0_0_0_1px_rgba(0,0,0,.35)]" style={{ left: `${x}%`, top: `${y}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between"><button type="button" onClick={() => setPoint("50% 50%")} className="text-[9px] uppercase tracking-[0.14em] text-[#77736c] underline underline-offset-4">Reset</button><div className="flex gap-2"><button type="button" onClick={onClose} className="border border-[#d8d3ca] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.14em]">Cancel</button><button type="button" onClick={() => onSave(point)} className="border border-[#171717] bg-[#171717] px-4 py-2 text-[9px] uppercase tracking-[0.14em] text-white">Set focal point</button></div></div>
    </div>

    </div>,
    document.body,
  );
}

function AltTextDialog({ media, onClose, onSave }: { media: Media; onClose: () => void; onSave: (value: string) => void }) {
  const [value, setValue] = useState(media.alt ?? "");
  if (typeof document === "undefined") return null;
  return createPortal(
    <div data-admin-modal className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-6" onMouseDown={event => event.stopPropagation()}>
    <div className="w-full max-w-lg bg-[#f7f4ee] p-6 shadow-2xl">
      <div className="flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Alt text</p><p className="mt-1 text-sm">{media.filename}</p></div><button type="button" onClick={onClose} className="text-lg leading-none text-[#6f6a62]" aria-label="Close">×</button></div>
      <textarea value={value} onChange={event => setValue(event.target.value)} autoFocus className="mt-5 min-h-28 w-full resize-y border border-[#d8d3ca] bg-white p-3 text-sm outline-none focus:border-[#171717]" placeholder="Describe this image for accessibility" />
      <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="border border-[#d8d3ca] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.14em]">Cancel</button><button type="button" onClick={() => onSave(value.trim())} className="border border-[#171717] bg-[#171717] px-4 py-2 text-[9px] uppercase tracking-[0.14em]">Save alt text</button></div>
    </div>

    </div>,
    document.body,
  );
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
  const maxImages = 1;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [focalOpen, setFocalOpen] = useState(false);
  const [altOpen, setAltOpen] = useState(false);
  const focalPoint = text(data.focal_point) || "50% 50%";
  const inputRef = useRef<HTMLInputElement>(null);
  const [eyebrowDraft, setEyebrowDraft] = useState(() => text(data.eyebrow));

  useEffect(() => {
    setEyebrowDraft(text(data.eyebrow));
  }, [block.id]);

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

  const updateFocal = (value: string) => {
    onChange({ data: { ...data, variant, focal_point: value } });
    setFocalOpen(false);
  };

  const updateAltText = async (value: string) => {
    const current = selectedMedia[0];
    if (!current) return;
    const updated = { ...current, alt: value || null };
    onChange({ media: [updated] });
    try {
      await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.id,
          collection_id: updated.collection_id ?? null,
          type: updated.type ?? "image",
          path: updated.path,
          filename: updated.filename,
          alt: updated.alt ?? null,
          width: updated.width ?? null,
          height: updated.height ?? null,
          sort_order: updated.sort_order ?? 0,
        }),
      });
    } catch (error) {
      console.error("Failed to update banner image alt text:", error);
    }
    setAltOpen(false);
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
  const bannerRatio = text(data.banner_ratio) || "16:9";
  const tint = bannerTintValue(data.background_tint);
  const buttonUrl = text(data.button_url);
  const selectedPage = pages.some(page => `/${page.slug}` === buttonUrl) ? buttonUrl : "";
  const pageMode = selectedPage ? selectedPage : buttonUrl ? "__custom__" : "";

  return <div className="grid gap-5">
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
                  <div className="group relative aspect-[16/7] overflow-hidden bg-[#e9e5de]">
                    <img src={mediaUrl(selectedMedia[0].path)} alt={selectedMedia[0].alt || selectedMedia[0].filename} className="h-full w-full object-cover" style={{ objectPosition: focalPoint }} />
                    <div className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-white opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                      <div className="mb-1 text-[8px] uppercase tracking-[0.16em] text-white/60">Image</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                        <button type="button" onClick={() => setPickerOpen(true)} className="text-[9px] uppercase tracking-[0.08em] hover:text-white/70">Change Image</button>
                        <button type="button" onClick={() => setFocalOpen(true)} className="text-[9px] uppercase tracking-[0.08em] hover:text-white/70">Set Focal</button>
                        <button type="button" onClick={() => setAltOpen(true)} className="text-[9px] uppercase tracking-[0.08em] hover:text-white/70">Alt Text</button>
                      </div>
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
              <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Banner ratio</p>
              <div className="grid grid-cols-3 border border-[#d8d3ca] bg-white">
                {["3:2", "16:9", "21:9"].map(ratio => <button key={ratio} type="button" onClick={() => update("banner_ratio", ratio)} className={`px-3 py-2.5 text-[10px] uppercase tracking-[0.14em] ${bannerRatio === ratio ? "bg-[#171717] text-white" : "text-[#77736c] hover:bg-[#f5f2ed]"}`}>{ratio}</button>)}
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

    {focalOpen && selectedMedia[0] && <FocalPointDialog media={selectedMedia[0]} value={focalPoint} onClose={() => setFocalOpen(false)} onSave={updateFocal} />}
    {altOpen && selectedMedia[0] && <AltTextDialog media={selectedMedia[0]} onClose={() => setAltOpen(false)} onSave={updateAltText} />}
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


function InfoBlockEditor({ block, onChange }: Props) {
  const data = block.data ?? {};
  const variant = block.variant ?? text(data.variant) ?? "info-1";
  const media = block.media ?? [];
  const selectedIds = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [focalOpen, setFocalOpen] = useState(false);
  const [altOpen, setAltOpen] = useState(false);
  const focalPoint = text(data.focal_point) || "50% 50%";
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedMedia = useMemo(() => selectedIds
    .map(id => media.find(item => item.id === id))
    .filter((item): item is Media => Boolean(item))
    .slice(0, 1), [media, selectedIds]);

  const update = (key: string, value: unknown) => {
    onChange({
      data: { ...data, [key]: value, variant },
      ...(key === "title" ? { title: text(value) } : {}),
      ...(key === "body" ? { body: text(value) } : {}),
    });
  };

  const applyMedia = (ids: string[], records: Media[]) => {
    onChange({
      data: { ...data, variant, media_ids: ids.slice(0, 1), focal_point: "50% 50%" },
      media: records.slice(0, 1) as StoryBlock["media"],
    });
  };

  const updateFocal = (value: string) => {
    onChange({ data: { ...data, variant, focal_point: value } });
    setFocalOpen(false);
  };

  const updateAltText = async (value: string) => {
    const current = selectedMedia[0];
    if (!current) return;
    const updated = { ...current, alt: value || null };
    onChange({
      data: { ...data, variant, image_alt: value },
      media: [updated],
    });
    try {
      await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.id,
          collection_id: updated.collection_id ?? null,
          type: updated.type ?? "image",
          path: updated.path,
          filename: updated.filename,
          alt: updated.alt ?? null,
          width: updated.width ?? null,
          height: updated.height ?? null,
          sort_order: updated.sort_order ?? 0,
        }),
      });
    } catch (error) {
      console.error("Failed to update info image alt text:", error);
    }
    setAltOpen(false);
  };

  async function upload(files: FileList | File[]) {
    const incoming = Array.from(files).slice(0, Math.max(0, 1 - selectedMedia.length));
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
      const records = [...selectedMedia, ...uploaded].slice(0, 1);
      applyMedia(records.map(item => item.id), records);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return <div className="grid gap-5">
    <div className="grid gap-6 border border-[#d8d3ca] bg-[#fbfaf7] p-5">
      <div>
        <p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Info</p>
        <p className="mt-1 text-xs text-[#77736c]">Choose a layout variant</p>
        <div className="mt-3 grid grid-cols-3 border border-[#d8d3ca] bg-white">
          {["info-1", "info-2", "info-3"].map(nextVariant => (
            <button
              key={nextVariant}
              type="button"
              onClick={() => onChange({
                variant: nextVariant,
                data: { ...data, variant: nextVariant },
              })}
              className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] ${variant === nextVariant ? "bg-[#171717] text-white" : "text-[#77736c] hover:bg-[#f5f2ed]"}`}
            >
              {nextVariant.replace("info-", "Info ")}
            </button>
          ))}
        </div>
      </div>

      <section>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#5f5a52]">Content</div>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Image</p>
            <div
              className={`relative overflow-hidden border border-dashed bg-white transition ${dragOver ? "border-[#171717] bg-[#f5f2ed]" : "border-[#cfc8bf]"}`}
              onDragOver={event => { event.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={event => { event.preventDefault(); setDragOver(false); void upload(event.dataTransfer.files); }}
            >
              {selectedMedia[0] ? (
                <div className="group relative aspect-[16/7] overflow-hidden bg-[#e9e5de]">
                  <img
                    src={mediaUrl(selectedMedia[0].path)}
                    alt={selectedMedia[0].alt || selectedMedia[0].filename}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: focalPoint }}
                  />
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
                    <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="border border-[#d8d3ca] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.13em] hover:border-[#171717] disabled:opacity-50">My Computer</button>
                  </div>
                </div>
              )}
              <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event => void upload(event.target.files ?? [])} />
            </div>
          </div>

          <label className="grid gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Eyebrow</span>
            <input aria-label="Eyebrow" className="border border-[#d8d3ca] bg-white p-3 text-sm outline-none focus:border-[#99938a]" value={eyebrowDraft} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()} onChange={e => { const value = e.target.value; setEyebrowDraft(value); update("eyebrow", value); }} />
          </label>
          <label className="grid gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Title</span>
            <input className="border border-[#d8d3ca] bg-white p-3 text-sm" value={text(data.title)} onChange={e => update("title", e.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Subtitle</span>
            <input className="border border-[#d8d3ca] bg-white p-3 text-sm" value={text(data.subtitle)} onChange={e => update("subtitle", e.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Description</span>
            <textarea className="min-h-24 border border-[#d8d3ca] bg-white p-3 text-sm" value={text(data.body)} onChange={e => update("body", e.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Button text</span>
            <input className="border border-[#d8d3ca] bg-white p-3 text-sm" value={text(data.button_text)} onChange={e => update("button_text", e.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Button URL</span>
            <input className="border border-[#d8d3ca] bg-white p-3 text-sm" value={text(data.button_url)} onChange={e => update("button_url", e.target.value)} />
          </label>
        </div>
      </section>
    </div>

    {focalOpen && selectedMedia[0] && <FocalPointDialog media={selectedMedia[0]} value={focalPoint} onClose={() => setFocalOpen(false)} onSave={updateFocal} />}
    {altOpen && selectedMedia[0] && <AltTextDialog media={selectedMedia[0]} onClose={() => setAltOpen(false)} onSave={updateAltText} />}
    <MediaPickerModal
      open={pickerOpen}
      required={1}
      selectedIds={selectedIds.slice(0, 1)}
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
  const hasImage = ["info-1", "info-2", "info-3", "testimonial-2"].includes(variant);
  const needsButton = variant.startsWith("banner");

  if (BANNER_VARIANTS.includes(variant)) return <BannerBlockEditor block={block} onChange={onChange} />;
  if (variant.startsWith("info")) return <InfoBlockEditor block={block} onChange={onChange} />;

  return <div className="grid gap-5">
    <ContentBlockView variant={variant} data={data} media={media} />
    <div className="grid gap-3 border border-[#d8d3ca] bg-[#fbfaf7] p-5">
      <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">Content · {variant}</p>
      <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Eyebrow" value={text(data.eyebrow)} onChange={e=>update("eyebrow",e.target.value)} />
      <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Heading" value={text(data.title)} onChange={e=>update("title",e.target.value)} />
      <textarea className="min-h-24 border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Description" value={text(data.body)} onChange={e=>update("body",e.target.value)} />
      {variant.startsWith("info") && <>
        <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Subtitle / small label" value={text(data.subtitle)} onChange={e=>update("subtitle",e.target.value)} />
        <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Button text" value={text(data.button_text)} onChange={e=>update("button_text",e.target.value)} />
        <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Button URL" value={text(data.button_url)} onChange={e=>update("button_url",e.target.value)} />
      </>}
      {variant.startsWith("testimonial") || variant.startsWith("quote") ? <><textarea className="min-h-28 border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Quote" value={text(data.quote)} onChange={e=>update("quote",e.target.value)} /><input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Author" value={text(data.author)} onChange={e=>update("author",e.target.value)} /><input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Role" value={text(data.role)} onChange={e=>update("role",e.target.value)} /></> : null}
      {hasImage && <button type="button" className="justify-self-start border border-[#171717] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.14em]" onClick={()=>setPickerOpen(true)}>{selectedIds.length ? "Change image" : "Choose image"}</button>}
      {(variant.startsWith("pricing") || variant.startsWith("faq")) && <div className="grid gap-3">{items.map((item,index)=><div key={index} className="grid gap-2 border-t border-[#e3ded6] pt-3">
        {variant.startsWith("faq") ? <><input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Question" value={text(item.question)} onChange={e=>updateItem(index,{question:e.target.value})}/><textarea className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Answer" value={text(item.answer)} onChange={e=>updateItem(index,{answer:e.target.value})}/></> : <><input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Title" value={text(item.title)} onChange={e=>updateItem(index,{title:e.target.value})}/>{variant.startsWith("pricing")&&<input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Price" value={text(item.price)} onChange={e=>updateItem(index,{price:e.target.value})}/>}<textarea className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder={variant.startsWith("pricing") ? "Description" : "Text"} value={text(item.text)} onChange={e=>updateItem(index,{text:e.target.value})}/>{variant.startsWith("pricing")&&<input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Features, separated by commas" value={text(item.features)} onChange={e=>updateItem(index,{features:e.target.value})}/>}</>}
      </div>)}</div>}
    </div>
    {hasImage && <MediaPickerModal open={pickerOpen} required={1} selectedIds={selectedIds.slice(0,1)} collectionId="" onClose={()=>setPickerOpen(false)} onDone={(_collectionId, ids, selectedMedia)=>{ onChange({ data: {...data, media_ids: ids.slice(0,1)}, media: selectedMedia as unknown as StoryBlock["media"] }); setPickerOpen(false); }} />}
  </div>;
}
