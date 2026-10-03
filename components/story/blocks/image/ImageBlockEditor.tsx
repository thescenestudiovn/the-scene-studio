"use client";

import { useMemo, useState } from "react";
import { mediaUrl } from "@/lib/media";
import type { StoryBlock } from "../../editor/types";
import MediaPickerModal from "./MediaPickerModal";
import SliderGalleryEditor from "../gallery/SliderGalleryEditor";

const BASE = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const PREVIEWS: Record<string, string> = { large: "image-large.jpg", medium: "image-medium.jpg", "full-width": "image-full.jpg", "columns-1": "image-columns-2.jpg", "columns-2": "image-columns-2.jpg", "columns-3": "image-columns-3.jpg", "columns-4": "image-columns-4.jpg" };
const LABELS: Record<string, string> = { large: "Large Image", medium: "Medium Image", "full-width": "Full Width Image", "columns-1": "Image Columns 1", "columns-2": "Image Columns 2", "columns-3": "Image Columns 3", "columns-4": "Image Columns 4" };
const SINGLE_VARIANTS = ["medium", "large", "full-width"] as const;
const COLUMN_VARIANTS = ["columns-2", "columns-3", "columns-4"] as const;
const SINGLE_WIDTHS: Record<(typeof SINGLE_VARIANTS)[number], number> = { medium: 50, large: 70, "full-width": 100 };

type Props = { storyId: string; block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void };
function slotCount(variant: string) { return variant === "columns-2" ? 2 : variant === "columns-3" ? 3 : variant === "columns-4" ? 4 : 1; }
function isColumnVariant(variant: string): variant is (typeof COLUMN_VARIANTS)[number] { return COLUMN_VARIANTS.includes(variant as (typeof COLUMN_VARIANTS)[number]); }


function clampPercent(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

function FocalPointDialog({ media, value, onClose, onSave }: { media: StoryBlock["media"][number]; value: string; onClose: () => void; onSave: (value: string) => void }) {
  const [point, setPoint] = useState(value || "50% 50%");
  const parts = point.split(" ").map(item => Number.parseFloat(item));
  const x = Number.isFinite(parts[0]) ? parts[0] : 50;
  const y = Number.isFinite(parts[1]) ? parts[1] : 50;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-6">
    <div className="w-full max-w-4xl bg-[#f7f4ee] p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Set focal</p><p className="mt-1 text-sm">{media.filename}</p></div><button type="button" onClick={onClose} className="text-lg leading-none text-[#6f6a62]" aria-label="Close">×</button></div>
      <div className="relative mx-auto max-h-[68vh] w-full cursor-crosshair overflow-hidden bg-[#e9e5de]" onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); setPoint(`${clampPercent(((event.clientX - rect.left) / rect.width) * 100)}% ${clampPercent(((event.clientY - rect.top) / rect.height) * 100)}%`); }}>
        <img src={mediaUrl(media.path)} alt={media.alt ?? ""} className="block max-h-[68vh] w-full object-contain" />
        <span className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/30 shadow-[0_0_0_1px_rgba(0,0,0,.35)]" style={{ left: `${x}%`, top: `${y}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between"><button type="button" onClick={() => setPoint("50% 50%")} className="text-[9px] uppercase tracking-[0.14em] text-[#77736c] underline underline-offset-4">Reset</button><div className="flex gap-2"><button type="button" onClick={onClose} className="border border-[#d8d3ca] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.14em]">Cancel</button><button type="button" onClick={() => onSave(point)} className="border border-[#171717] bg-[#171717] px-4 py-2 text-[9px] uppercase tracking-[0.14em] text-white">Set focal point</button></div></div>
    </div>
  </div>;
}

function AltTextDialog({ media, onClose, onSave }: { media: StoryBlock["media"][number]; onClose: () => void; onSave: (value: string) => void }) {
  const [value, setValue] = useState(media.alt ?? "");
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-6">
    <div className="w-full max-w-lg bg-[#f7f4ee] p-6 shadow-2xl">
      <div className="flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Alt text</p><p className="mt-1 text-sm">{media.filename}</p></div><button type="button" onClick={onClose} className="text-lg leading-none text-[#6f6a62]" aria-label="Close">×</button></div>
      <textarea value={value} onChange={event => setValue(event.target.value)} autoFocus className="mt-5 min-h-28 w-full resize-y border border-[#d8d3ca] bg-white p-3 text-sm outline-none focus:border-[#171717]" placeholder="Describe this image for accessibility" />
      <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="border border-[#d8d3ca] bg-white px-4 py-2 text-[9px] uppercase tracking-[0.14em]">Cancel</button><button type="button" onClick={() => onSave(value.trim())} className="border border-[#171717] bg-[#171717] px-4 py-2 text-[9px] uppercase tracking-[0.14em] text-white">Save alt text</button></div>
    </div>
  </div>;
}

export default function ImageBlockEditor({ storyId, block, onChange }: Props) {
  const variant = block.variant ?? "large";
  if (variant === "slideshow" || variant === "carousel") return <SliderGalleryEditor storyId={storyId} block={block} onChange={onChange} />;
  const required = slotCount(variant);
  const rawData = block.data;
  const data: Record<string, unknown> = typeof rawData === "string" ? (() => { try { const parsed = JSON.parse(rawData); return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {}; } catch { return {}; } })() : (rawData && typeof rawData === "object" ? rawData as Record<string, unknown> : {});
  const availableMedia = Array.isArray(block.media) ? block.media : [];
  const configuredIds = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string" && id.length > 0) : [];
  const availableIds = useMemo(() => new Set(availableMedia.map(item => item.id)), [availableMedia]);
  const selectedIds = useMemo(() => configuredIds.filter(id => availableIds.has(id)), [configuredIds, availableIds]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const [focalOpen, setFocalOpen] = useState(false);
  const [focalSlot, setFocalSlot] = useState(0);
  const [altOpen, setAltOpen] = useState(false);
  const [altSlot, setAltSlot] = useState(0);
  const focalPoints = Array.isArray(data.focal_points) ? data.focal_points.map(value => typeof value === "string" ? value : "50% 50%") : [];
  const focalFor = (slot: number) => focalPoints[slot] || "50% 50%";
  const openPicker = (slot: number) => { setActiveSlot(slot); setPickerOpen(true); };
  const singleVariant = SINGLE_VARIANTS.includes(variant as (typeof SINGLE_VARIANTS)[number]) ? variant as (typeof SINGLE_VARIANTS)[number] : null;
  const cycleSingleVariant = () => { if (!singleVariant) return; const i = SINGLE_VARIANTS.indexOf(singleVariant); onChange({ variant: SINGLE_VARIANTS[(i + 1) % SINGLE_VARIANTS.length] }); };
  const cycleColumnVariant = () => { if (!isColumnVariant(variant)) return; const i = COLUMN_VARIANTS.indexOf(variant); onChange({ variant: COLUMN_VARIANTS[(i + 1) % COLUMN_VARIANTS.length] }); };
  const applySelection = (collectionId: string, mediaIds: string[], selectedMedia: StoryBlock["media"]) => {
    const chosen = mediaIds[0]; if (!chosen) return;
    const nextIds = [...configuredIds]; nextIds[activeSlot] = chosen;
    const nextMedia = [...availableMedia];
    for (const item of selectedMedia ?? []) if (!nextMedia.some(media => media.id === item.id)) nextMedia.push(item);
    const patch: Partial<StoryBlock> = { data: { ...data, collection_id: collectionId || null, media_ids: nextIds }, media: nextMedia };
    onChange(patch);
    void fetch(`/api/admin/stories/${storyId}/blocks/${block.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: patch.data }) });
    setPickerOpen(false);
  };
  const updateFocal = (slot: number, value: string) => {
    const nextFocal = Array.from({ length: required }, (_, index) => focalFor(index));
    nextFocal[slot] = value;
    onChange({ data: { ...data, focal_points: nextFocal } });
    setFocalOpen(false);
  };
  const updateAltText = async (slot: number, value: string) => {
    const mediaId = selectedIds[slot];
    const current = mediaId ? availableMedia.find(item => item.id === mediaId) : undefined;
    if (!current) return;
    const updated = { ...current, alt: value || null };
    onChange({ media: availableMedia.map(item => item.id === current.id ? updated : item) });
    try {
      await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.id, collection_id: updated.collection_id ?? null, type: updated.type ?? "image",
          path: updated.path, filename: updated.filename, alt: updated.alt ?? null,
          width: updated.width ?? null, height: updated.height ?? null, sort_order: updated.sort_order ?? 0,
        }),
      });
    } catch (error) { console.error("Failed to update image alt text:", error); }
    setAltOpen(false);
  };

  const renderSlot = (index: number) => {
    const mediaId = selectedIds[index];
    const media = mediaId ? availableMedia.find(item => item.id === mediaId) : undefined;
    const demo = `${BASE}${PREVIEWS[variant] ?? PREVIEWS.large}`;
    const focal = focalFor(index);
    const image = media
      ? <img src={mediaUrl(media.path)} alt={media.alt ?? ""} className="block h-auto w-full object-cover" style={{ objectPosition: focal }} />
      : <img src={demo} alt="" className="block h-auto w-full" />;
    if (isColumnVariant(variant) && !media) return <div key={`${block.id}-${index}`} className="min-w-0"><div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e9e5de]"><img src={demo} alt="" className="absolute top-0 h-full max-w-none" style={{ width: `${required * 100}%`, left: `-${index * 100}%` }} /></div><button type="button" onClick={() => openPicker(index)} className="mt-2 text-[9px] uppercase tracking-[.14em] text-[#77736c] underline underline-offset-4">Choose image</button></div>;
    return <div key={`${block.id}-${index}`} className="min-w-0">
      <div className="group relative overflow-hidden bg-[#e9e5de]">
        <button type="button" onClick={() => openPicker(index)} className="block w-full overflow-hidden text-left">{image}</button>
        {media && <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-white opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          <div className="mb-1.5 text-[8px] uppercase tracking-[0.16em] text-white/60">Image</div>
          <div className="pointer-events-auto flex flex-wrap gap-x-3 gap-y-1.5">
            <button type="button" onClick={() => openPicker(index)} className="text-[9px] uppercase tracking-[0.08em] hover:text-white/70">Change Image</button>
            <button type="button" onClick={() => { setFocalSlot(index); setFocalOpen(true); }} className="text-[9px] uppercase tracking-[0.08em] hover:text-white/70">Set Focal</button>
            <button type="button" onClick={() => { setAltSlot(index); setAltOpen(true); }} className="text-[9px] uppercase tracking-[0.08em] hover:text-white/70">Alt Text</button>
          </div>
        </div>}
      </div>
    </div>;
  };

  return <div className="relative overflow-visible rounded-sm border border-transparent focus-within:border-[#d9d3ca]">
    <div className="mb-2 flex items-center justify-between"><span className="text-[9px] uppercase tracking-[.16em] text-[#8a857d]">{LABELS[variant] ?? "Image"}</span><div className="flex items-center gap-2">
      {singleVariant && <button type="button" onClick={cycleSingleVariant} className="rounded-full border border-[#ded8d0] bg-white px-2.5 py-1 text-[9px] uppercase tracking-[.08em] text-[#625e57]">{singleVariant === "medium" ? "Medium · 50%" : singleVariant === "large" ? "Large · 70%" : "Full · 100%"}</button>}
      {isColumnVariant(variant) && <button type="button" onClick={cycleColumnVariant} className="rounded-full border border-[#ded8d0] bg-white px-2.5 py-1 text-[9px] uppercase tracking-[.08em] text-[#625e57]">{variant === "columns-2" ? "Columns 2" : variant === "columns-3" ? "Columns 3" : "Columns 4"}</button>}
      <span aria-hidden="true" className="text-[#aaa39a]">×</span>
    </div></div>
    {singleVariant ? <div className="flex justify-center"><div style={{ width: `${SINGLE_WIDTHS[singleVariant]}%` }}>{renderSlot(0)}</div></div> : <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${required}, minmax(0, 1fr))` }}>{Array.from({ length: required }, (_, i) => renderSlot(i))}</div>}
    {focalOpen && selectedIds[focalSlot] && (() => { const item = availableMedia.find(media => media.id === selectedIds[focalSlot]); return item ? <FocalPointDialog media={item} value={focalFor(focalSlot)} onClose={() => setFocalOpen(false)} onSave={value => updateFocal(focalSlot, value)} /> : null; })()}
    {altOpen && selectedIds[altSlot] && (() => { const item = availableMedia.find(media => media.id === selectedIds[altSlot]); return item ? <AltTextDialog media={item} onClose={() => setAltOpen(false)} onSave={value => void updateAltText(altSlot, value)} /> : null; })()}
    <MediaPickerModal open={pickerOpen} required={1} selectedIds={activeSlot < selectedIds.length && selectedIds[activeSlot] ? [selectedIds[activeSlot]] : []} collectionId={typeof data.collection_id === "string" ? data.collection_id : ""} onClose={() => setPickerOpen(false)} onDone={applySelection} />
  </div>;
}
