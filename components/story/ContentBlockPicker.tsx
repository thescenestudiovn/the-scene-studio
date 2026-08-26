"use client";

import { useEffect, useMemo, useState } from "react";
import { mediaUrl } from "@/lib/media";

export type TextBlockVariant =
  | "heading-1" | "heading-2" | "heading-3" | "wide" | "regular" | "narrow"
  | "columns-2" | "columns-3" | "columns-4";

export type ImageBlockVariant =
  | "large" | "medium" | "full-width" | "columns-2" | "columns-3" | "columns-4"
  | "grid-vertical" | "grid-horizontal" | "grid-square" | "grid-stacked"
  | "slideshow" | "carousel"
  | "text-overlay-large" | "text-overlay-medium" | "text-overlay-full"
  | "text-columns-2" | "text-columns-3" | "text-columns-4"
  | "text-below-large" | "text-below-medium" | "text-left-regular" | "text-right-regular"
  | "text-left-large" | "text-right-large";

export type ContentBlockSelection =
  | { category: "text"; variant: TextBlockVariant }
  | { category: "image"; variant: ImageBlockVariant; data: { collection_id: string; media_ids: string[] } };

type Collection = { id: string; title: string; slug: string; cover_path?: string | null; media_count?: number };
type Media = { id: string; path: string; filename: string | null; alt: string | null; width: number | null; height: number | null; sort_order: number };

const textBlocks: Array<{ variant: TextBlockVariant; label: string; description: string }> = [
  { variant: "heading-1", label: "Heading 1", description: "Large editorial heading" },
  { variant: "heading-2", label: "Heading 2", description: "Medium editorial heading" },
  { variant: "heading-3", label: "Heading 3", description: "Small editorial heading" },
  { variant: "wide", label: "Wide Text", description: "Wide editorial paragraph" },
  { variant: "regular", label: "Regular Text", description: "Regular reading width" },
  { variant: "narrow", label: "Narrow Text", description: "Narrow editorial column" },
  { variant: "columns-2", label: "Text Columns 2", description: "Two text columns" },
  { variant: "columns-3", label: "Text Columns 3", description: "Three text columns" },
  { variant: "columns-4", label: "Text Columns 4", description: "Four text columns" },
];

const imageGroups: Array<{ id: string; label: string }> = [
  { id: "images", label: "Images" },
  { id: "grids", label: "Grid Galleries" },
  { id: "sliders", label: "Slider Galleries" },
  { id: "image-text", label: "Images with Text" },
];

const imageBlocks: Record<string, Array<{ variant: ImageBlockVariant; label: string; preview: string }>> = {
  images: [
    ["large", "Large Image", "image-large.jpg"], ["medium", "Medium Image", "image-medium.jpg"], ["full-width", "Full Width Image", "image-full.jpg"],
    ["columns-2", "Image Columns 2", "image-columns-2.jpg"], ["columns-3", "Image Columns 3", "image-columns-3.jpg"], ["columns-4", "Image Columns 4", "image-columns-4.jpg"],
  ].map(([variant, label, preview]) => ({ variant: variant as ImageBlockVariant, label, preview: `https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/${preview}` })),
  grids: [
    ["grid-vertical", "Vertical Grid", "photo-grid-vertical.jpg"], ["grid-horizontal", "Horizontal Grid", "photo-grid-horizontal.jpg"], ["grid-square", "Square Grid", "photo-grid-square.jpg"], ["grid-stacked", "Stacked Grid", "photo-grid-stacked.jpg"],
  ].map(([variant, label, preview]) => ({ variant: variant as ImageBlockVariant, label, preview: `https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/${preview}` })),
  sliders: [
    ["slideshow", "Slideshow", "photo-slider-slideshow.jpg"], ["carousel", "Carousel", "photo-slider-carousel.jpg"],
  ].map(([variant, label, preview]) => ({ variant: variant as ImageBlockVariant, label, preview: `https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/${preview}` })),
  "image-text": [
    ["text-overlay-large", "Image with Text", "image-text-overlay-large.jpg"], ["text-overlay-medium", "Small Image with Text", "image-text-overlay-medium.jpg"], ["text-overlay-full", "Full Image with Text", "image-text-overlay-full.jpg"],
    ["text-columns-2", "Image with Text Columns 2", "image-columns-and-text-2.jpg"], ["text-columns-3", "Image with Text Columns 3", "image-columns-and-text-3.jpg"], ["text-columns-4", "Image with Text Columns 4", "image-columns-and-text-4.jpg"],
    ["text-below-large", "Image with Text", "image-text-below-large.jpg"], ["text-below-medium", "Small Image with Text", "image-text-below-medium.jpg"], ["text-left-regular", "Image with Text Left", "image-text-left-regular.jpg"], ["text-right-regular", "Image with Text Right", "image-text-right-regular.jpg"], ["text-left-large", "Large Image with Text Left", "image-text-left-large.jpg"], ["text-right-large", "Large Image with Text Right", "image-text-right-large.jpg"],
  ].map(([variant, label, preview]) => ({ variant: variant as ImageBlockVariant, label, preview: `https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/${preview}` })),
};

const categories = [["text", "Text"], ["image", "Image"], ["content", "Content"], ["links", "Links"], ["blog", "Blog"], ["video", "Video"], ["contact", "Contact"], ["social", "Social"], ["others", "Others"], ["flex", "Flex Block"]] as const;

type Props = { open: boolean; onClose: () => void; onSelect: (selection: ContentBlockSelection) => void };

function TextPreview({ variant }: { variant: TextBlockVariant }) {
  const sample = "The Scene Studio";
  if (variant === "heading-1") return <div className="text-[30px] leading-[1.05] tracking-[-0.04em]">{sample}</div>;
  if (variant === "heading-2") return <div className="text-[24px] leading-[1.1] tracking-[-0.03em]">{sample}</div>;
  if (variant === "heading-3") return <div className="text-[19px] leading-[1.15] tracking-[-0.02em]">{sample}</div>;
  if (variant === "columns-2") return <div className="grid grid-cols-2 gap-4 text-[11px] leading-5 text-[#6f6b64]"><span>Love stories, beautifully told.</span><span>Moments made to last.</span></div>;
  if (variant === "columns-3") return <div className="grid grid-cols-3 gap-3 text-[10px] leading-4 text-[#6f6b64]"><span>Love stories.</span><span>Beautiful moments.</span><span>Timeless memories.</span></div>;
  if (variant === "columns-4") return <div className="grid grid-cols-4 gap-2 text-[9px] leading-4 text-[#6f6b64]"><span>Love.</span><span>Stories.</span><span>Wanderlust.</span><span>Always.</span></div>;
  const width = variant === "wide" ? "max-w-full" : variant === "narrow" ? "max-w-[55%]" : "max-w-[78%]";
  return <p className={`${width} text-[12px] leading-5 text-[#6f6b64]`}>Love stories, beautifully told through honest moments, thoughtful details and the places that mean something to you.</p>;
}

export default function ContentBlockPicker({ open, onClose, onSelect }: Props) {
  const [category, setCategory] = useState<(typeof categories)[number][0]>("text");
  const [imageGroup, setImageGroup] = useState("images");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionId, setCollectionId] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    if (!open || category !== "image") return;
    setLoadingCollections(true);
    fetch("/api/admin/collections", { cache: "no-store" }).then(response => response.json() as Promise<{ collections?: Collection[] }>).then(data => setCollections(data.collections ?? [])).catch(() => setCollections([])).finally(() => setLoadingCollections(false));
  }, [open, category]);

  useEffect(() => {
    if (!collectionId) { setMedia([]); setSelectedMedia([]); return; }
    setLoadingMedia(true);
    fetch(`/api/admin/media?collection_id=${encodeURIComponent(collectionId)}`, { cache: "no-store" }).then(response => response.json() as Promise<{ media?: Media[] }>).then(data => setMedia(data.media ?? [])).catch(() => setMedia([])).finally(() => setLoadingMedia(false));
  }, [collectionId]);

  const currentImages = useMemo(() => imageBlocks[imageGroup] ?? [], [imageGroup]);
  const requiredCount = imageGroup === "images" ? (currentImages.find(item => item.variant === imageBlocks.images.find(x => x.variant === currentImages.find(y => y.variant === currentImages[0]?.variant)?.variant)?.variant)?.variant ? 1 : 1) : 1;

  if (!open) return null;

  function selectImageBlock(variant: ImageBlockVariant) {
    if (!collectionId) { window.alert("Choose a Collection first."); return; }
    if (selectedMedia.length === 0) { window.alert("Choose at least one image from the Collection."); return; }
    onSelect({ category: "image", variant, data: { collection_id: collectionId, media_ids: selectedMedia } });
  }

  return <div className="fixed inset-0 z-[100] flex bg-[#f8f7f4] text-[#27251f]">
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-[#ddd9d0] bg-white">
      <div className="flex h-[72px] items-center justify-between border-b border-[#e5e1d9] px-6"><span className="text-[11px] font-medium uppercase tracking-[0.18em]">Blocks</span><button type="button" onClick={onClose} className="text-xl leading-none text-[#77736c]">×</button></div>
      <nav className="overflow-y-auto p-3">{categories.map(([id, label]) => <button key={id} type="button" onClick={() => setCategory(id)} className={`mb-1 flex w-full items-center rounded-md px-4 py-3 text-left text-sm ${category === id ? "bg-[#efede8] font-medium" : "text-[#77736c] hover:bg-[#f5f3ef]"}`}>{label}</button>)}</nav>
    </aside>
    <main className="min-w-0 flex-1 overflow-y-auto">
      <header className="sticky top-0 z-10 border-b border-[#ddd9d0] bg-[#f8f7f4]/95 px-10 py-7 backdrop-blur"><div className="text-[11px] uppercase tracking-[0.18em] text-[#8a867e]">Add content block</div><h1 className="mt-2 font-serif text-3xl">{categories.find(([id]) => id === category)?.[1]}</h1></header>
      <div className="mx-auto max-w-6xl px-10 py-10">
        {category === "text" && <div className="grid grid-cols-3 gap-6">{textBlocks.map(block => <button key={block.variant} type="button" onClick={() => onSelect({ category: "text", variant: block.variant })} className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)]"><div className="flex min-h-[190px] items-center border-b border-[#eeeae3] px-7 py-8"><div className="w-full"><TextPreview variant={block.variant}/></div></div><div className="px-6 py-5"><div className="text-sm font-medium">{block.label}</div><div className="mt-1 text-xs text-[#8a867e]">{block.description}</div></div></button>)}</div>}
        {category === "image" && <div className="space-y-8">
          <section className="rounded-xl border border-[#ddd9d0] bg-white p-5"><div className="grid gap-4 md:grid-cols-[1fr_1.5fr]"><label><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a867e]">Collection</span><select value={collectionId} onChange={e => setCollectionId(e.target.value)} className="h-11 w-full border border-[#cfc9bf] bg-[#faf8f4] px-3 text-sm outline-none"><option value="">{loadingCollections ? "Loading collections…" : "Choose a collection"}</option>{collections.map(item => <option key={item.id} value={item.id}>{item.title} {item.media_count != null ? `(${item.media_count} photos)` : ""}</option>)}</select></label><div><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a867e]">Images</span><p className="text-sm text-[#77736c]">{loadingMedia ? "Loading photos…" : `${selectedMedia.length} selected`}</p></div></div>{collectionId && <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">{media.map(item => { const selected = selectedMedia.includes(item.id); return <button key={item.id} type="button" onClick={() => setSelectedMedia(current => selected ? current.filter(id => id !== item.id) : [...current, item.id])} className={`relative aspect-square overflow-hidden border-2 ${selected ? "border-[#7d4f45]" : "border-transparent"}`}><img src={mediaUrl(item.path)} alt={item.alt ?? item.filename ?? "Collection image"} className="h-full w-full object-cover"/>{selected && <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7d4f45] text-xs text-white">✓</span>}</button>})}</div>}</section>
          {imageGroups.map(group => <section key={group.id}><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.18em] text-[#8a867e]">{group.label}</p><p className="mt-1 text-xs text-[#77736c]">Choose a layout using the selected Collection images.</p></div></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{(imageBlocks[group.id] ?? []).map(block => <button key={block.variant} type="button" onClick={() => selectImageBlock(block.variant)} className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)]"><div className="aspect-[16/10] overflow-hidden bg-[#e8e4dc]"><img src={block.preview} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"/></div><div className="px-5 py-4 text-sm font-medium">{block.label}</div></button>)}</div></section>)}
        </div>}
        {!['text','image'].includes(category) && <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-[#ccc7bd] bg-white text-sm text-[#8a867e]">{categories.find(([id]) => id === category)?.[1]} blocks will be added here.</div>}
      </div>
    </main>
  </div>;
}
