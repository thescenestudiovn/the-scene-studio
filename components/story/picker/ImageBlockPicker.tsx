"use client";

import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/media";
import type { ContentBlockSelection, ImageBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };
type Collection = { id: string; title: string; slug: string; media_count?: number };
type Media = { id: string; path: string; filename: string | null; alt: string | null; width: number | null; height: number | null; sort_order: number };

type Group = { id: string; label: string; items: Array<[ImageBlockVariant, string, string]> };
const base = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const groups: Group[] = [
  { id: "images", label: "Images", items: [["large","Large Image","image-large.jpg"],["medium","Medium Image","image-medium.jpg"],["full-width","Full Width Image","image-full.jpg"],["columns-2","Image Columns 2","image-columns-2.jpg"],["columns-3","Image Columns 3","image-columns-3.jpg"],["columns-4","Image Columns 4","image-columns-4.jpg"]] },
  { id: "grids", label: "Grid Galleries", items: [["grid-vertical","Vertical Grid","photo-grid-vertical.jpg"],["grid-horizontal","Horizontal Grid","photo-grid-horizontal.jpg"],["grid-square","Square Grid","photo-grid-square.jpg"],["grid-stacked","Stacked Grid","photo-grid-stacked.jpg"]] },
  { id: "sliders", label: "Slider Galleries", items: [["slideshow","Slideshow","photo-slider-slideshow.jpg"],["carousel","Carousel","photo-slider-carousel.jpg"]] },
  { id: "image-text", label: "Images with Text", items: [["text-overlay-large","Image with Text","image-text-overlay-large.jpg"],["text-overlay-medium","Small Image with Text","image-text-overlay-medium.jpg"],["text-overlay-full","Full Image with Text","image-text-overlay-full.jpg"],["text-columns-2","Image with Text Columns 2","image-columns-and-text-2.jpg"],["text-columns-3","Image with Text Columns 3","image-columns-and-text-3.jpg"],["text-columns-4","Image with Text Columns 4","image-columns-and-text-4.jpg"],["text-below-large","Image with Text","image-text-below-large.jpg"],["text-below-medium","Small Image with Text","image-text-below-medium.jpg"],["text-left-regular","Image with Text Left","image-text-left-regular.jpg"],["text-right-regular","Image with Text Right","image-text-right-regular.jpg"],["text-left-large","Large Image with Text Left","image-text-left-large.jpg"],["text-right-large","Large Image with Text Right","image-text-right-large.jpg"]] },
];

export default function ImageBlockPicker({ onSelect }: Props) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionId, setCollectionId] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch("/api/admin/collections", { cache: "no-store" }).then(r => r.json() as Promise<{ collections?: Collection[] }>).then(d => setCollections(d.collections ?? [])).catch(() => setCollections([])); }, []);
  useEffect(() => {
    if (!collectionId) { setMedia([]); setSelected([]); return; }
    setLoading(true); fetch(`/api/admin/media?collection_id=${encodeURIComponent(collectionId)}`, { cache: "no-store" }).then(r => r.json() as Promise<{ media?: Media[] }>).then(d => setMedia(d.media ?? [])).catch(() => setMedia([])).finally(() => setLoading(false));
  }, [collectionId]);

  const choose = (variant: ImageBlockVariant) => {
    if (!collectionId || selected.length === 0) { window.alert("Choose a Collection and at least one image first."); return; }
    onSelect({ category: "image", variant, data: { collection_id: collectionId, media_ids: selected } });
  };

  return <div className="space-y-9">
    <section className="rounded-xl border border-[#ddd9d0] bg-white p-5">
      <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a867e]">Collection</span><select value={collectionId} onChange={e => setCollectionId(e.target.value)} className="h-11 w-full border border-[#cfc9bf] bg-[#faf8f4] px-3 text-sm outline-none"><option value="">Choose a collection</option>{collections.map(c => <option key={c.id} value={c.id}>{c.title}{c.media_count != null ? ` (${c.media_count} photos)` : ""}</option>)}</select></label>
      {collectionId && <div className="mt-5"><div className="mb-3 flex justify-between text-xs text-[#77736c]"><span>{loading ? "Loading photos…" : `${selected.length} selected`}</span><button type="button" onClick={() => setSelected([])} className="underline">Clear</button></div><div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">{media.map(item => { const active = selected.includes(item.id); return <button key={item.id} type="button" onClick={() => setSelected(current => active ? current.filter(id => id !== item.id) : [...current, item.id])} className={`relative aspect-square overflow-hidden border-2 ${active ? "border-[#7d4f45]" : "border-transparent"}`}><img src={mediaUrl(item.path)} alt={item.alt ?? item.filename ?? "Collection image"} className="h-full w-full object-cover"/>{active && <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7d4f45] text-xs text-white">✓</span>}</button>; })}</div></div>}
    </section>
    {groups.map(group => <section key={group.id}><div className="mb-4"><p className="text-[10px] uppercase tracking-[0.18em] text-[#8a867e]">{group.label}</p><p className="mt-1 text-xs text-[#77736c]">Choose a layout using the selected Collection images.</p></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{group.items.map(([variant,label,preview]) => <button key={variant} type="button" onClick={() => choose(variant)} className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]"><div className="aspect-[16/10] overflow-hidden bg-[#e8e4dc]"><img src={`${base}${preview}`} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"/></div><div className="px-5 py-4 text-sm font-medium">{label}</div></button>)}</div></section>)}
  </div>;
}
