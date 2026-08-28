"use client";

import { useEffect, useMemo, useState } from "react";
import { mediaUrl } from "@/lib/media";
import type { Media } from "../../editor/types";

type Collection = { id: string; title: string };
type Props = { open: boolean; selectedIds: string[]; onClose: () => void; onDone: (mediaIds: string[], media: Media[]) => void };

export default function GridGalleryPickerModal({ open, selectedIds, onClose, onDone }: Props) {
  const [media, setMedia] = useState<Media[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [collectionId, setCollectionId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected(selectedIds);
    setLoading(true);
    Promise.all([
      fetch("/api/admin/media").then(response => response.json() as Promise<{ media?: Media[] }>),
      fetch("/api/admin/collections").then(response => response.json() as Promise<{ collections?: Collection[] }>),
    ])
      .then(([mediaResult, collectionResult]) => {
        setMedia(Array.isArray(mediaResult.media) ? mediaResult.media : []);
        setCollections(Array.isArray(collectionResult.collections) ? collectionResult.collections : []);
      })
      .catch(() => { setMedia([]); setCollections([]); })
      .finally(() => setLoading(false));
  }, [open, selectedIds]);

  const visibleMedia = useMemo(() => collectionId ? media.filter(item => item.collection_id === collectionId) : media, [collectionId, media]);
  if (!open) return null;

  const toggle = (id: string) => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const done = () => {
    const selectedMedia = selected.map(id => media.find(item => item.id === id)).filter((item): item is Media => Boolean(item));
    onDone(selected, selectedMedia);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#ebe7e0] px-6 py-5"><div><p className="text-[10px] uppercase tracking-[.18em] text-[#8a857d]">Grid Gallery</p><h2 className="mt-1 font-serif text-2xl text-[#171717]">Add images</h2></div><button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#77736c] hover:bg-[#f5f2ed]">×</button></div>
        <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-[#ebe7e0] px-6 py-3"><button type="button" onClick={() => setCollectionId("")} className={`rounded-full px-3 py-1.5 text-xs ${!collectionId ? "bg-[#171717] text-white" : "bg-[#f5f2ed] text-[#625e57]"}`}>All media</button>{collections.map(collection => <button key={collection.id} type="button" onClick={() => setCollectionId(collection.id)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${collectionId === collection.id ? "bg-[#171717] text-white" : "bg-[#f5f2ed] text-[#625e57]"}`}>{collection.title}</button>)}</div>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">{loading ? <div className="flex h-48 items-center justify-center text-sm text-[#99938b]">Loading media…</div> : visibleMedia.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">{visibleMedia.map(item => { const isSelected = selected.includes(item.id); return <button key={item.id} type="button" onClick={() => toggle(item.id)} className={`group relative overflow-hidden rounded-lg border bg-[#f3f0eb] ${isSelected ? "border-[#171717] ring-2 ring-[#171717]/15" : "border-[#e5dfd7]"}`}><img src={mediaUrl(item.path)} alt={item.alt ?? item.filename} className="aspect-square h-auto w-full object-cover"/><span className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs ${isSelected ? "bg-[#171717] text-white" : "bg-white/85 text-[#77736c]"}`}>{isSelected ? "✓" : ""}</span></button>; })}</div> : <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[#ddd6cd] text-sm text-[#99938b]">No media found.</div>}</div>
        <div className="flex shrink-0 items-center justify-between border-t border-[#ebe7e0] px-6 py-4"><p className="text-xs text-[#77736c]">{selected.length} selected</p><div className="flex gap-3"><button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-xs text-[#77736c] hover:bg-[#f5f2ed]">Cancel</button><button type="button" disabled={!selected.length} onClick={done} className="rounded-full bg-[#171717] px-6 py-2.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-40">Done</button></div></div>
      </div>
    </div>
  );
}
