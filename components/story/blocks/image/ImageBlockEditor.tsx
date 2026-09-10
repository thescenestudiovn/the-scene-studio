"use client";

import { useMemo, useState } from "react";
import { mediaUrl } from "@/lib/media";
import type { StoryBlock } from "../../editor/types";
import MediaPickerModal from "./MediaPickerModal";

const BASE = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const PREVIEWS: Record<string, string> = { large: "image-large.jpg", medium: "image-medium.jpg", "full-width": "image-full.jpg", "columns-1": "image-columns-2.jpg", "columns-2": "image-columns-2.jpg", "columns-3": "image-columns-3.jpg", "columns-4": "image-columns-4.jpg" };
const LABELS: Record<string, string> = { large: "Large Image", medium: "Medium Image", "full-width": "Full Width Image", "columns-1": "Image Columns 1", "columns-2": "Image Columns 2", "columns-3": "Image Columns 3", "columns-4": "Image Columns 4" };
const COLUMN_VARIANTS = ["columns-1", "columns-2", "columns-3"] as const;

type Props = { storyId: string; block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void };
function slotCount(variant: string) { return variant === "columns-1" ? 1 : variant === "columns-2" ? 2 : variant === "columns-3" ? 3 : variant === "columns-4" ? 4 : 1; }
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
  const applySelection = (collectionId: string, mediaIds: string[]) => { const chosen = mediaIds[0]; if (!chosen) return; const nextIds = [...selectedIds]; nextIds[activeSlot] = chosen; onChange({ data: { ...data, collection_id: collectionId || null, media_ids: nextIds } }); setPickerOpen(false); };
  const renderSlot = (index: number) => { const mediaId = selectedIds[index]; const media = mediaId ? availableMedia.find(item => item.id === mediaId) : undefined; const demo = `${BASE}${PREVIEWS[variant] ?? PREVIEWS.large}`; let image = media ? <img src={mediaUrl(media.path)} alt="" className="block h-auto w-full" /> : <img src={demo} alt="" className="block h-auto w-full" />; if (isColumnVariant(variant) && !media) image = <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e9e5de]"><img src={demo} alt="" className="absolute top-0 h-full max-w-none" style={{ width: `${required * 100}%`, left: `-${index * 100}%` }} /></div>; return <div key={`${block.id}-${index}`} className="min-w-0"><button type="button" onClick={() => openPicker(index)} className="group block w-full overflow-hidden bg-[#e9e5de] text-left">{image}</button><button type="button" onClick={() => openPicker(index)} className="mt-2 text-[9px] uppercase tracking-[.14em] text-[#77736c] underline underline-offset-4">{media ? "Change image" : "Choose image"}</button></div>; };
  return <div className="relative overflow-visible rounded-sm border border-transparent focus-within:border-[#d9d3ca]"><div className="mb-2"><span className="text-[9px] uppercase tracking-[.16em] text-[#8a857d]">{LABELS[variant] ?? "Image"}</span></div>{variant === "medium" ? <div className="flex justify-center"><div style={{ width: "50%" }}>{renderSlot(0)}</div></div> : variant === "large" ? <div className="flex justify-center"><div style={{ width: "70%" }}>{renderSlot(0)}</div></div> : variant === "full-width" || variant === "columns-1" ? <div className={variant === "columns-1" ? "grid grid-cols-1 gap-3" : ""}>{renderSlot(0)}</div> : <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${required}, minmax(0, 1fr))` }}>{Array.from({ length: required }, (_, i) => renderSlot(i))}</div>}<MediaPickerModal open={pickerOpen} required={1} selectedIds={activeSlot < selectedIds.length && selectedIds[activeSlot] ? [selectedIds[activeSlot]] : []} collectionId={typeof data.collection_id === "string" ? data.collection_id : ""} onClose={() => setPickerOpen(false)} onDone={applySelection} /></div>;
}
