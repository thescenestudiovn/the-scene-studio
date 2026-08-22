"use client";

import { useMemo } from "react";
import { mediaUrl } from "../../../../lib/media";

type Media = { id: string; path: string; filename: string; alt: string | null };
type Item = { title: string; description: string; text: string };
export type ImageTextLayout = "overlay" | "2-columns" | "3-columns" | "4-columns" | "caption" | "small-caption" | "image-text" | "text-image";

export type ImageTextData = { layout: ImageTextLayout; items: Item[] };

const LAYOUTS: Array<{ id: ImageTextLayout; title: string; description: string; count: number }> = [
  { id: "overlay", title: "Text Overlay", description: "Text over a full-bleed image with contrast overlay.", count: 1 },
  { id: "2-columns", title: "2 Columns", description: "Two images with matching text content.", count: 2 },
  { id: "3-columns", title: "3 Columns", description: "Three images with matching text content.", count: 3 },
  { id: "4-columns", title: "4 Columns", description: "Four images with matching text content.", count: 4 },
  { id: "caption", title: "Image + Caption", description: "Large image with editorial text underneath.", count: 1 },
  { id: "small-caption", title: "Small Image + Caption", description: "Smaller image with caption underneath.", count: 1 },
  { id: "image-text", title: "Image + Text", description: "Image beside the editorial content.", count: 1 },
  { id: "text-image", title: "Text + Image", description: "Editorial content beside the image, reversed.", count: 1 },
];

const emptyItem = (): Item => ({ title: "", description: "", text: "" });
export const defaultImageTextData = (): ImageTextData => ({ layout: "image-text", items: [emptyItem()] });

export function parseImageTextData(value: unknown): ImageTextData {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    const data = parsed as Partial<ImageTextData> | null;
    const layout = LAYOUTS.some(item => item.id === data?.layout) ? data!.layout! : "image-text";
    const items = Array.isArray(data?.items) ? data.items.map(item => ({ title: String(item?.title ?? ""), description: String(item?.description ?? ""), text: String(item?.text ?? "") })) : [];
    return { layout, items: items.length ? items : [emptyItem()] };
  } catch {
    return defaultImageTextData();
  }
}

export function getImageTextLayout(layout: ImageTextLayout) {
  return LAYOUTS.find(item => item.id === layout) ?? LAYOUTS[6];
}

export default function ImageTextBlock({
  data,
  media,
  onChange,
  onAddPhotos,
  onRemovePhoto,
}: {
  data: unknown;
  media: Media[];
  onChange: (data: ImageTextData) => void;
  onAddPhotos: () => void;
  onRemovePhoto: (mediaId: string) => void;
}) {
  const config = parseImageTextData(data);
  const layout = getImageTextLayout(config.layout);
  const items = useMemo(() => Array.from({ length: layout.count }, (_, index) => config.items[index] ?? emptyItem()), [config.items, layout.count]);

  function setLayout(layoutId: ImageTextLayout) {
    const next = getImageTextLayout(layoutId);
    onChange({ layout: layoutId, items: Array.from({ length: next.count }, (_, index) => config.items[index] ?? emptyItem()) });
  }

  function updateItem(index: number, field: keyof Item, value: string) {
    const next = items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item);
    onChange({ layout: config.layout, items: next });
  }

  return <div className="mt-7 border-t border-[#e7e2da] pt-6">
    <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {LAYOUTS.map(option => <button key={option.id} type="button" onClick={() => setLayout(option.id)} className={`border p-4 text-left transition ${config.layout === option.id ? "border-[#171717] bg-[#f0ece5]" : "border-[#ddd7cd] bg-[#faf8f4] hover:border-[#999286]"}`}>
        <span className="block text-[11px] font-medium uppercase tracking-[0.12em]">{option.title}</span>
        <span className="mt-2 block text-xs leading-5 text-[#817b72]">{option.description}</span>
      </button>)}
    </div>

    <div className="mb-6 border border-[#e0dbd3] bg-[#faf8f4] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div><p className="text-[10px] uppercase tracking-[0.18em] text-[#8a857d]">Photos</p><p className="mt-1 text-xs text-[#77736c]">{media.length}/{layout.count} image slots used</p></div>
        <button type="button" onClick={onAddPhotos} className="border border-[#171717] bg-[#171717] px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-white">Choose from Collection</button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: layout.count }, (_, index) => {
          const image = media[index];
          return <div key={index} className="relative aspect-[4/3] overflow-hidden bg-[#e5e0d8]">
            {image ? <><img src={mediaUrl(image.path)} alt={image.alt ?? image.filename} className="h-full w-full object-contain bg-[#eee9e1]"/><button type="button" onClick={() => onRemovePhoto(image.id)} className="absolute right-2 top-2 bg-black/75 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.12em] text-white">Remove</button></> : <button type="button" onClick={onAddPhotos} className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.14em] text-[#9a948a]">+ Add photo</button>}
          </div>;
        })}
      </div>
    </div>

    <div className="border border-[#d9d3ca] bg-white p-5 lg:p-7">
      <div className="mb-5 flex items-center justify-between"><p className="text-[10px] uppercase tracking-[0.18em] text-[#8a857d]">Editorial Preview</p><span className="text-[10px] uppercase tracking-[0.14em] text-[#aaa49a]">{layout.title}</span></div>
      <div className={config.layout === "overlay" ? "relative min-h-[360px] overflow-hidden bg-[#222]" : config.layout === "2-columns" || config.layout === "3-columns" || config.layout === "4-columns" ? `grid gap-5 ${config.layout === "2-columns" ? "md:grid-cols-2" : config.layout === "3-columns" ? "md:grid-cols-3" : "md:grid-cols-4"}` : config.layout === "text-image" || config.layout === "image-text" ? "grid items-center gap-8 md:grid-cols-2" : "max-w-4xl"}>
        {items.map((item, index) => {
          const image = media[index];
          const fields = <div className="space-y-3">
            <input value={item.title} onChange={e => updateItem(index, "title", e.target.value)} placeholder="Title" className="w-full border-0 border-b border-[#ddd7cd] bg-transparent px-0 py-2 font-serif text-2xl outline-none placeholder:text-[#bdb7ad]"/>
            <textarea value={item.description} onChange={e => updateItem(index, "description", e.target.value)} placeholder="Description" rows={2} className="w-full resize-none border-0 bg-transparent px-0 py-1 text-sm leading-6 text-[#77736c] outline-none placeholder:text-[#bdb7ad]"/>
            <textarea value={item.text} onChange={e => updateItem(index, "text", e.target.value)} placeholder="Text" rows={4} className="w-full resize-y border border-[#e5e0d8] bg-[#faf8f4] p-4 text-sm leading-6 text-[#5f5a53] outline-none placeholder:text-[#bdb7ad]"/>
          </div>;
          if (config.layout === "overlay") return <div key={index} className="absolute inset-0">{image ? <img src={mediaUrl(image.path)} alt={image.alt ?? image.filename} className="absolute inset-0 h-full w-full object-contain bg-[#222]"/> : <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.15em] text-white/50">Choose an image</div>}<div className="absolute inset-0 bg-black/35"/><div className="absolute inset-x-0 bottom-0 p-7 text-white lg:p-10"><input value={item.title} onChange={e => updateItem(index, "title", e.target.value)} placeholder="Title" className="w-full bg-transparent font-serif text-4xl outline-none placeholder:text-white/60"/><textarea value={item.description} onChange={e => updateItem(index, "description", e.target.value)} placeholder="Description" rows={2} className="mt-3 w-full resize-none bg-transparent text-sm leading-6 text-white/80 outline-none placeholder:text-white/50"/><textarea value={item.text} onChange={e => updateItem(index, "text", e.target.value)} placeholder="Text" rows={3} className="mt-2 w-full resize-none bg-transparent text-sm leading-6 text-white/90 outline-none placeholder:text-white/50"/></div></div>;
          if (config.layout === "2-columns" || config.layout === "3-columns" || config.layout === "4-columns") return <article key={index} className="min-w-0">{image ? <img src={mediaUrl(image.path)} alt={image.alt ?? image.filename} className="aspect-[4/3] w-full object-contain bg-[#eee9e1]"/> : <div className="aspect-[4/3] bg-[#eee9e1]"/>}<div className="pt-4">{fields}</div></article>;
          const imageNode = image ? <img src={mediaUrl(image.path)} alt={image.alt ?? image.filename} className={`${config.layout === "small-caption" ? "mx-auto max-w-xl" : ""} w-full object-contain bg-[#eee9e1]`} /> : <div className="aspect-[4/3] w-full bg-[#eee9e1]"/>;
          if (config.layout === "caption" || config.layout === "small-caption") return <article key={index} className={config.layout === "small-caption" ? "mx-auto max-w-2xl" : "max-w-4xl"}>{imageNode}<div className="pt-5">{fields}</div></article>;
          if (config.layout === "text-image") return <div key={index} className="contents"><div>{fields}</div><div>{imageNode}</div></div>;
          return <div key={index} className="contents"><div>{imageNode}</div><div>{fields}</div></div>;
        })}
      </div>
    </div>
  </div>;
}
