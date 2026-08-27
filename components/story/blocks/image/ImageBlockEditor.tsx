"use client";

import { useMemo, useState } from "react";
import { mediaUrl } from "@/lib/media";
import type { StoryBlock } from "../../editor/types";
import MediaPickerModal from "./MediaPickerModal";

const BASE = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const PREVIEWS: Record<string, string> = { large: "image-large.jpg", medium: "image-medium.jpg", "full-width": "image-full.jpg", "columns-2": "image-columns-2.jpg", "columns-3": "image-columns-3.jpg", "columns-4": "image-columns-4.jpg" };
const LABELS: Record<string, string> = { large: "Large Image", medium: "Medium Image", "full-width": "Full Width Image", "columns-2": "Image Columns 2", "columns-3": "Image Columns 3", "columns-4": "Image Columns 4" };
const SINGLE_VARIANTS = ["medium", "large", "full-width"] as const;
const COLUMN_VARIANTS = ["columns-2", "columns-3", "columns-4"] as const;
const SINGLE_WIDTHS: Record<(typeof SINGLE_VARIANTS)[number], number> = { medium: 50, large: 70, "full-width": 100 };

type Props = { storyId: string; block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void };
function slotCount(variant: string) { return variant === "columns-2" ? 2 : variant === "columns-3" ? 3 : variant === "columns-4" ? 4 : 1; }
function isColumnVariant(variant: string): variant is (typeof COLUMN_VARIANTS)[number] { return COLUMN_VARIANTS.includes(variant as (typeof COLUMN_VARIANTS)[number]); }

export default function ImageBlockEditor({ storyId, block, onChange }: Props) {
  void storyId;
  const variant = block.variant ?? "large";
  const required = slotCount(variant);
  const data = block.data ?? {};
  const availableMedia = Array.isArray(block.media) ? block.media : [];
  const configuredIds = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
  const availableIds = useMemo(() => new Set(availableMedia.map(item => item.id)), [availableMedia]);
  const selectedIds = useMemo(() => configuredIds.filter(id => availableIds.has(id)), [configuredIds, availableIds]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const openPicker = (slot: number) => { setActiveSlot(slot); setPickerOpen(true); };
  const singleVariant = SINGLE_VARIANTS.includes(variant as (typeof SINGLE_VARIANTS)[number]) ? variant as (typeof SINGLE_VARIANTS)[number] : null;
  const cycleSingleVariant = () => { if (!singleVariant) return; const i = SINGLE_VARIANTS.indexOf(singleVariant); onChange({ variant: SINGLE_VARIANTS[(i + 1) % SINGLE_VARIANTS.length] }); };
  const cycleColumnVariant = () => { if (!isColumnVariant(variant)) return; const i = COLUMN_VARIANTS.indexOf(variant); onChange({ variant: COLUMN_VARIANTS[(i + 1) % COLUMN_VARIANTS.length] }); };
  const applySelection = (collectionId: string, mediaIds: string[]) => { const chosen = mediaIds[0]; if (!chosen) return; const nextIds = [...selectedIds]; nextIds[activeSlot] = chosen; onChange({ data: { ...data, collection_id: collectionId || null, media_ids: nextIds } }); setPickerOpen(false); };
  const renderSlot = (index: number) => { const mediaId = selectedIds[index]; const media = mediaId ? availableMedia.find(item => item.id === mediaId) : undefined; const demo = `${BASE}${PREVIEWS[variant] ?? PREVIEWS.large}`; let image = media ? <img src={mediaUrl(media.path)} alt="" className="block h-auto w-full" /> : <img src={demo} alt="" className="block h-auto w-full" />; if (isColumnVariant(variant) && !media) image = <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e9e5de]"><img src={demo} alt="" className="absolute top-0 h-full max-w-none" style={{ width: `${required * 100}%`, left: `-${index * 100}%` }} /></div>; return <div key={`${block.id}-${index}`} className="min-w-0"><button type="button" onClick={() => openPicker(index)} className="group block w-full overflow-hidden bg-[#e9e5de] text-left">{image}</button><button type="button" onClick={() => openPicker(index)} className="mt-2 text-[9px] uppercase tracking-[.14em] text-[#77736c] underline underline-offset-4">{media ? "Change image" : "Choose image"}</button></div>; };
  return <div className="relative overflow-visible rounded-sm border border-transparent focus-within:border-[#d9d3ca]"><div className="mb-2 flex items-center justify-between"><span className="text-[9px] uppercase tracking-[.16em] text-[#8a857d]">{LABELS[variant] ?? "Image"}</span><div className="flex items-center gap-2">{singleVariant && <button type="button" onClick={cycleSingleVariant} className="rounded-full border border-[#ded8d0] bg-white px-2.5 py-1 text-[9px] uppercase tracking-[.08em] text-[#625e57]">{singleVariant === "medium" ? "Medium · 50%" : singleVariant === "large" ? "Large · 70%" : "Full · 100%"}</button>}{isColumnVariant(variant) && <button type="button" onClick={cycleColumnVariant} className="rounded-full border border-[#ded8d0] bg-white px-2.5 py-1 text-[9px] uppercase tracking-[.08em] text-[#625e57]">{variant === "columns-2" ? "Columns 2" : variant === "columns-3" ? "Columns 3" : "Columns 4"}</button>}<span aria-hidden="true" className="text-[#aaa39a]">×</span></div></div>{singleVariant ? <div className="flex justify-center"><div style={{ width: `${SINGLE_WIDTHS[singleVariant]}%` }}>{renderSlot(0)}</div></div> : <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${required}, minmax(0, 1fr))` }}>{Array.from({ length: required }, (_, i) => renderSlot(i))}</div>}<MediaPickerModal open={pickerOpen} required={1} selectedIds={activeSlot < selectedIds.length && selectedIds[activeSlot] ? [selectedIds[activeSlot]] : []} collectionId={typeof data.collection_id === "string" ? data.collection_id : ""} onClose={() => setPickerOpen(false)} onDone={applySelection} /></div>;
}
