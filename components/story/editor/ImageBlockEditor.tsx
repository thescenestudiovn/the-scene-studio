"use client";

import { useEffect, useMemo, useState } from "react";
import { mediaUrl } from "@/lib/media";
import type { Media, StoryBlock } from "./types";

const BASE = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const PREVIEWS: Record<string, string> = {
  large: "image-large.jpg", medium: "image-medium.jpg", "full-width": "image-full.jpg",
  "columns-2": "image-columns-2.jpg", "columns-3": "image-columns-3.jpg", "columns-4": "image-columns-4.jpg",
  "grid-vertical": "photo-grid-vertical.jpg", "grid-horizontal": "photo-grid-horizontal.jpg", "grid-square": "photo-grid-square.jpg", "grid-stacked": "photo-grid-stacked.jpg",
  slideshow: "photo-slider-slideshow.jpg", carousel: "photo-slider-carousel.jpg",
  "text-overlay-large": "image-text-overlay-large.jpg", "text-overlay-medium": "image-text-overlay-medium.jpg", "text-overlay-full": "image-text-overlay-full.jpg",
  "text-columns-2": "image-columns-and-text-2.jpg", "text-columns-3": "image-columns-and-text-3.jpg", "text-columns-4": "image-columns-and-text-4.jpg",
  "text-below-large": "image-text-below-large.jpg", "text-below-medium": "image-text-below-medium.jpg", "text-left-regular": "image-text-left-regular.jpg", "text-right-regular": "image-text-right-regular.jpg", "text-left-large": "image-text-left-large.jpg", "text-right-large": "image-text-right-large.jpg",
};

const labels: Record<string, string> = {
  large: "Large Image", medium: "Medium Image", "full-width": "Full Width Image", "columns-2": "Image Columns 2", "columns-3": "Image Columns 3", "columns-4": "Image Columns 4",
  "grid-vertical": "Vertical Grid", "grid-horizontal": "Horizontal Grid", "grid-square": "Square Grid", "grid-stacked": "Stacked Grid", slideshow: "Slideshow", carousel: "Carousel",
  "text-overlay-large": "Image with Text", "text-overlay-medium": "Small Image with Text", "text-overlay-full": "Full Image with Text", "text-columns-2": "Image with Text Columns 2", "text-columns-3": "Image with Text Columns 3", "text-columns-4": "Image with Text Columns 4", "text-below-large": "Image with Text", "text-below-medium": "Small Image with Text", "text-left-regular": "Image with Text Left", "text-right-regular": "Image with Text Right", "text-left-large": "Large Image with Text Left", "text-right-large": "Large Image with Text Right",
};

type Collection = { id: string; title: string; slug: string; media_count?: number };

type Props = { storyId: string; block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void };

function slotCount(variant: string) {
  if (["columns-2", "text-columns-2"].includes(variant)) return 2;
  if (["columns-3", "text-columns-3"].includes(variant)) return 3;
  if (["columns-4", "text-columns-4"].includes(variant)) return 4;
  return 1;
}

export default function ImageBlockEditor({ storyId, block, onChange }: Props) {
  const variant = block.variant ?? "large";
  const required = slotCount(variant);
  const data = block.data ?? {};
  const selectedIds = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
  const demo = `${BASE}${PREVIEWS[variant] ?? PREVIEWS.large}`;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionId, setCollectionId] = useState(typeof data.collection_id === "string" ? data.collection_id : "");
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pickerOpen || collections.length) return;
    fetch("/api/admin/collections", { cache: "no-store" }).then(r => r.json() as Promise<{ collections?: Collection[] }>).then(d => setCollections(d.collections ?? [])).catch(() => setCollections([]));
  }, [pickerOpen, collections.length]);

  useEffect(() => {
    if (!pickerOpen || !collectionId) { setMedia([]); return; }
    setLoading(true);
    fetch(`/api/admin/media?collection_id=${encodeURIComponent(collectionId)}`, { cache: "no-store" })
      .then(r => r.json() as Promise<{ media?: Media[] }>).then(d => setMedia(d.media ?? [])).catch(() => setMedia([])).finally(() => setLoading(false));
  }, [pickerOpen, collectionId]);

  const selectedMedia = useMemo(() => selectedIds.map(id => media.find(item => item.id === id)).filter((item): item is Media => Boolean(item)), [media, selectedIds]);

  const saveSelection = (ids: string[]) => onChange({ data: { ...data, collection_id: collectionId || null, media_ids: ids } });
  const choose = (id: string) => {
    if (required === 1) { saveSelection([id]); setPickerOpen(false); return; }
    const next = selectedIds.includes(id) ? selectedIds.filter(value => value !== id) : [...selectedIds, id].slice(0, required);
    saveSelection(next);
  };

  const renderImages = () => {
    const ids = selectedIds.length ? selectedIds : Array.from({ length: required }, (_, i) => `demo-${i}`);
    if (variant === "large" || variant === "medium" || variant === "full-width") return <img src={selectedMedia[0] ? mediaUrl(selectedMedia[0].path) : demo} alt="" className="h-auto max-h-[720px] w-full object-cover" />;
    if (variant.startsWith("columns-") || variant.startsWith("text-columns-")) return <div className={`grid grid-cols-${required} gap-3 max-[640px]:grid-cols-1`}>{ids.map((id, i) => { const item = selectedMedia[i]; return <button key={id} type="button" onClick={() => setPickerOpen(true)} className="group relative min-w-0 overflow-hidden bg-[#e9e5de] text-left"><img src={item ? mediaUrl(item.path) : demo} alt="" className="aspect-[4/5] h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]" />{!item && <span className="absolute bottom-3 left-3 bg-black/55 px-2 py-1 text-[9px] uppercase tracking-[.14em] text-white">Choose image</span>}</button>; })}</div>;
    return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{ids.map((id, i) => { const item = selectedMedia[i]; return <button key={id} type="button" onClick={() => setPickerOpen(true)} className="group relative aspect-[4/3] overflow-hidden bg-[#e9e5de]"><img src={item ? mediaUrl(item.path) : demo} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]" /></button>; })}</div>;
  };

  return <div className="relative overflow-visible rounded-sm border border-transparent focus-within:border-[#d9d3ca]">
    <div className="mb-2 flex items-center justify-between gap-3"><span className="text-[9px] uppercase tracking-[.16em] text-[#8a857d]">{labels[variant] ?? "Image"}</span><button type="button" onClick={() => setPickerOpen(true)} className="text-[9px] uppercase tracking-[.14em] text-[#77736c] underline underline-offset-4 hover:text-[#171717]">{selectedIds.length ? "Change images" : "Choose from collection"}</button></div>
    {renderImages()}
    {(variant.startsWith("text-") || ["text-overlay-large", "text-overlay-medium", "text-overlay-full", "text-below-large", "text-below-medium", "text-left-regular", "text-right-regular", "text-left-large", "text-right-large"].includes(variant)) && <div className="mt-3 border border-[#e0dbd2] bg-white px-5 py-4"><p className="font-serif text-2xl">Image with text</p><p className="mt-1 text-sm leading-6 text-[#77736c]">Add a short story or description alongside this image.</p></div>}
    {pickerOpen && <div className="absolute left-0 right-0 top-full z-50 mt-3 rounded-xl border border-[#d9d3ca] bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,.14)]"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.16em] text-[#8a857d]">Select images</p><p className="mt-1 text-xs text-[#77736c]">{required === 1 ? "Choose 1 image" : `Choose ${required} images`}</p></div><button type="button" onClick={() => setPickerOpen(false)} className="text-lg text-[#77736c]">×</button></div><select value={collectionId} onChange={e => { setCollectionId(e.target.value); onChange({ data: { ...data, collection_id: e.target.value || null, media_ids: [] } }); }} className="mb-4 h-10 w-full border border-[#d9d3ca] bg-[#faf8f4] px-3 text-sm"><option value="">Choose a collection</option>{collections.map(c => <option key={c.id} value={c.id}>{c.title}{c.media_count != null ? ` (${c.media_count})` : ""}</option>)}</select>{collectionId && <div className="grid max-h-[360px] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5">{loading ? <p className="col-span-full py-8 text-center text-xs text-[#77736c]">Loading photos…</p> : media.map(item => { const active = selectedIds.includes(item.id); return <button key={item.id} type="button" onClick={() => choose(item.id)} className={`relative aspect-square overflow-hidden border-2 ${active ? "border-[#7d4f45]" : "border-transparent"}`}><img src={mediaUrl(item.path)} alt={item.alt ?? item.filename} className="h-full w-full object-cover" />{active && <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7d4f45] text-xs text-white">✓</span>}</button>; })}</div>}<div className="mt-4 flex justify-between border-t border-[#eee9e2] pt-3"><span className="text-xs text-[#77736c]">{selectedIds.length}/{required} selected</span><button type="button" onClick={() => setPickerOpen(false)} className="text-xs underline underline-offset-4">Done</button></div></div>}
  </div>;
}
