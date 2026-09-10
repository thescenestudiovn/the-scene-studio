"use client";

import { useEffect, useMemo, useState } from "react";
import { mediaUrl } from "@/lib/media";
import type { Media, StoryBlock } from "../../editor/types";
import GridGalleryPickerModal from "./GridGalleryPickerModal";

const BASE = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const DEMO: Record<string, string> = {
  slideshow: `${BASE}photo-slider-slideshow.jpg`,
  carousel: `${BASE}photo-slider-carousel.jpg`,
};

type Props = { storyId: string; block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void };

function parseData(value: StoryBlock["data"]): Record<string, unknown> {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

type ManageProps = {
  open: boolean;
  media: Media[];
  ids: string[];
  onChange: (ids: string[]) => void;
  onCancel: () => void;
  onDone: () => void;
  onAdd: () => void;
};

function ManageImages({ open, media, ids, onChange, onCancel, onDone, onAdd }: ManageProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const items = ids.map(id => media.find(item => item.id === id)).filter((item): item is Media => Boolean(item));

  useEffect(() => {
    if (open) {
      setDragId(null);
      setOverId(null);
    }
  }, [open]);

  if (!open) return null;

  const move = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const next = [...ids];
    const from = next.indexOf(dragId);
    const to = next.indexOf(targetId);
    if (from < 0 || to < 0) return;
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    onChange(next);
    setDragId(null);
    setOverId(null);
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
    <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex shrink-0 items-center justify-between border-b border-[#ebe7e0] px-6 py-5">
        <div><p className="text-[10px] uppercase tracking-[.18em] text-[#8a857d]">Slider Gallery</p><h2 className="mt-1 font-serif text-2xl text-[#171717]">Manage images</h2></div>
        <button type="button" onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#77736c] hover:bg-[#f5f2ed]">×</button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
        <p className="mb-4 text-xs text-[#77736c]">Drag to change the order. Remove images here without deleting them from your media library.</p>
        {items.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{items.map((item, index) => <div key={item.id} draggable onDragStart={() => setDragId(item.id)} onDragOver={event => { event.preventDefault(); setOverId(item.id); }} onDrop={() => move(item.id)} onDragEnd={() => { setDragId(null); setOverId(null); }} className={`group relative overflow-hidden rounded-lg border bg-[#f3f0eb] ${overId === item.id ? "border-[#7d4f45] ring-2 ring-[#7d4f45]/15" : "border-[#e5dfd7]"}`}><img src={mediaUrl(item.path)} alt={item.alt ?? item.filename} className="aspect-[4/3] h-auto w-full object-cover"/><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 px-2.5 py-2 text-white"><span className="text-[11px]">{index + 1}</span><div className="flex items-center gap-2"><span className="cursor-grab text-sm opacity-80">≡</span><button type="button" onClick={() => onChange(ids.filter(id => id !== item.id))} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-sm hover:bg-white/25">×</button></div></div></div>)}</div> : <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[#ddd6cd] text-sm text-[#99938b]">No images in this slider.</div>}
        <button type="button" onClick={onAdd} className="mt-5 flex w-full items-center justify-center rounded-xl border border-dashed border-[#cfc7bd] px-4 py-4 text-sm text-[#5f5a53] transition hover:border-[#8f867b] hover:bg-[#faf8f4]">+ Add Images</button>
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-[#ebe7e0] px-6 py-4"><p className="text-xs text-[#77736c]">{ids.length} images</p><div className="flex gap-3"><button type="button" onClick={onCancel} className="rounded-full px-5 py-2.5 text-xs text-[#77736c] hover:bg-[#f5f2ed]">Cancel</button><button type="button" onClick={onDone} className="rounded-full bg-[#171717] px-6 py-2.5 text-xs text-white">Done</button></div></div>
    </div>
  </div>;
}

function SlideshowPreview({ media, onOpen }: { media: Media[]; onOpen: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(value => Math.min(value, Math.max(media.length - 1, 0)));
  }, [media.length]);

  useEffect(() => {
    if (media.length < 2) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % media.length), 3500);
    return () => window.clearInterval(timer);
  }, [media.length]);

  if (!media.length) return null;
  const current = media[index] ?? media[0];

  return <div className="relative overflow-hidden bg-[#e9e5de]">
    <img src={mediaUrl(current.path)} alt={current.alt ?? current.filename ?? ""} className="block h-[420px] w-full object-cover sm:h-[500px]" />
    <button type="button" aria-label="Manage slider images" onClick={onOpen} className="absolute inset-0 z-[1] h-full w-full cursor-pointer" />
    {media.length > 1 && <>
      <button type="button" aria-label="Previous image" onClick={event => { event.stopPropagation(); setIndex(value => (value - 1 + media.length) % media.length); }} className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg text-[#171717] shadow-sm backdrop-blur hover:bg-white">←</button>
      <button type="button" aria-label="Next image" onClick={event => { event.stopPropagation(); setIndex(value => (value + 1) % media.length); }} className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg text-[#171717] shadow-sm backdrop-blur hover:bg-white">→</button>
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-black/55 to-transparent px-5 pb-4 pt-10 text-white">
        <span className="text-[10px] uppercase tracking-[.16em]">{String(index + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}</span>
        <div className="flex gap-1.5">{media.map((item, itemIndex) => <button key={item.id} type="button" aria-label={`Go to image ${itemIndex + 1}`} onClick={event => { event.stopPropagation(); setIndex(itemIndex); }} className={`h-1.5 w-7 transition ${itemIndex === index ? "bg-white" : "bg-white/45"}`} />)}</div>
      </div>
    </>}
  </div>;
}

function CarouselPreview({ media, onOpen }: { media: Media[]; onOpen: () => void }) {
  const [index, setIndex] = useState(0);
  if (!media.length) return null;
  const visible = media.length > 1 ? [media[index % media.length], media[(index + 1) % media.length]] : [media[0]];
  return <div className="relative overflow-hidden bg-[#e9e5de]">
    <div className="grid grid-cols-2 gap-2 p-2">{visible.map(item => <img key={item.id} src={mediaUrl(item.path)} alt={item.alt ?? item.filename ?? ""} className="h-[330px] w-full object-cover sm:h-[400px]" />)}</div>
    <button type="button" aria-label="Manage carousel images" onClick={onOpen} className="absolute inset-0 z-[1] h-full w-full cursor-pointer" />
    {media.length > 2 && <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2"><button type="button" aria-label="Previous images" onClick={event => { event.stopPropagation(); setIndex(value => (value - 1 + media.length) % media.length); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85">←</button><button type="button" aria-label="Next images" onClick={event => { event.stopPropagation(); setIndex(value => (value + 1) % media.length); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85">→</button></div>}
  </div>;
}

export default function SliderGalleryEditor({ storyId, block, onChange }: Props) {
  const data = parseData(block.data);
  const blockMedia = Array.isArray(block.media) ? block.media : [];
  const ids = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string" && id.length > 0) : [];
  const [manageOpen, setManageOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<string[]>(ids);
  const [draftMedia, setDraftMedia] = useState<Media[]>(blockMedia);

  useEffect(() => {
    setDraftIds(ids);
    setDraftMedia(blockMedia);
    if (!ids.length || blockMedia.length) return;
    let cancelled = false;
    fetch("/api/admin/media")
      .then(response => response.json() as Promise<{ media?: Media[] }>)
      .then(result => {
        if (cancelled) return;
        const allMedia = Array.isArray(result.media) ? result.media : [];
        const selectedMedia = ids.map(id => allMedia.find(item => item.id === id)).filter((item): item is Media => Boolean(item));
        if (selectedMedia.length) setDraftMedia(selectedMedia);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [block.id, block.data, block.media]);

  const selected = useMemo(() => draftIds.map(id => draftMedia.find(item => item.id === id)).filter((item): item is Media => Boolean(item)), [draftIds, draftMedia]);
  const openManager = () => { setDraftIds(ids); setDraftMedia(blockMedia.length ? blockMedia : draftMedia); setManageOpen(true); };
  const save = async () => {
    const patch = { data: { ...data, collection_id: null, media_ids: draftIds }, variant: block.variant ?? "slideshow", media: draftMedia.filter(item => draftIds.includes(item.id)) };
    onChange(patch);
    setManageOpen(false);
    try {
      const response = await fetch(`/api/admin/stories/${storyId}/blocks/${block.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: patch.data, variant: patch.variant }) });
      if (!response.ok) throw new Error("Failed to save slider gallery");
      const result = await response.json() as { block?: StoryBlock };
      if (result.block) onChange(result.block);
    } catch (error) { console.error(error); }
  };

  const demo = DEMO[block.variant ?? "slideshow"] ?? DEMO.slideshow;
  const isCarousel = block.variant === "carousel";

  const handlePickerDone = (nextIds: string[], nextMedia: Media[]) => {
    setDraftIds(nextIds);
    setDraftMedia(current => {
      const map = new Map(current.map(item => [item.id, item]));
      for (const item of nextMedia) map.set(item.id, item);
      return Array.from(map.values());
    });
    setPickerOpen(false);
  };

  return <div className="w-full overflow-visible rounded-sm">
    <div className="relative">
      {selected.length ? (isCarousel ? <CarouselPreview media={selected} onOpen={openManager} /> : <SlideshowPreview media={selected} onOpen={openManager} />) : <div className="relative overflow-hidden bg-[#e9e5de]">
        <img src={demo} alt="" className="block h-auto w-full" />
        <button type="button" aria-label="Choose images for slider" onClick={openManager} className="absolute inset-0 z-[1] h-full w-full cursor-pointer" />
      </div>}
      <button type="button" onClick={event => { event.stopPropagation(); openManager(); }} className="absolute right-4 top-4 z-20 rounded-full bg-white/90 px-4 py-2 text-[10px] font-medium uppercase tracking-[.14em] text-[#171717] shadow-sm backdrop-blur hover:bg-white">{selected.length ? "Manage images" : "Choose images"}</button>
    </div>
    <ManageImages open={manageOpen} media={draftMedia} ids={draftIds} onChange={setDraftIds} onCancel={() => setManageOpen(false)} onDone={save} onAdd={() => setPickerOpen(true)} />
    <GridGalleryPickerModal open={pickerOpen} selectedIds={draftIds} onClose={() => setPickerOpen(false)} onDone={handlePickerDone} />
  </div>;
}
