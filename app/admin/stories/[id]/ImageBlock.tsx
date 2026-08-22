"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { mediaUrl } from "../../../../lib/media";

type Media = {
  id: string;
  path: string;
  filename: string;
  alt: string | null;
  width?: number | null;
  height?: number | null;
};

export type ImageBlockLayout = "basic" | "grid" | "slider" | "image-text";
export type ImageBlockFit = "fit" | "crop";

type Item = {
  title: string;
  description: string;
};

export type ImageBlockData = {
  layout: ImageBlockLayout;
  template: string;
  fit: ImageBlockFit;
  gap: "sm" | "md" | "lg";
  items: Item[];
};

const LAYOUTS = [
  { id: "basic" as const, title: "Basic Image Layout", description: "One to four images and mixed editorial arrangements." },
  { id: "grid" as const, title: "Grid Gallery", description: "Mosaic and gallery grids for mixed landscape and portrait images." },
  { id: "slider" as const, title: "Slider Gallery", description: "Large carousel with adjacent image preview and touch support." },
  { id: "image-text" as const, title: "Image with Text", description: "Overlay, caption and image/text editorial layouts." },
];

const TEMPLATES: Record<ImageBlockLayout, Array<{ id: string; title: string; description: string; count: number }>> = {
  basic: [
    { id: "one", title: "Single", description: "One large image", count: 1 },
    { id: "two", title: "Two", description: "Two equal images", count: 2 },
    { id: "three", title: "Three", description: "Three editorial images", count: 3 },
    { id: "four", title: "Four", description: "Four-image composition", count: 4 },
    { id: "mixed", title: "Mixed", description: "Mixed-size image composition", count: 4 },
  ],
  grid: [
    { id: "masonry-2", title: "Mosaic 2", description: "Two-column masonry", count: 6 },
    { id: "masonry-3", title: "Mosaic 3", description: "Three-column mosaic", count: 9 },
    { id: "feature", title: "Feature + Grid", description: "Large feature with supporting images", count: 6 },
    { id: "editorial", title: "Editorial", description: "Asymmetric editorial grid", count: 7 },
  ],
  slider: [
    { id: "classic", title: "Classic", description: "Large image with controls", count: 6 },
    { id: "peek", title: "Peek", description: "Next image partially visible", count: 6 },
    { id: "cinema", title: "Cinema", description: "Wide cinematic carousel", count: 6 },
  ],
  "image-text": [
    { id: "overlay", title: "Text Overlay", description: "Text over image with contrast overlay", count: 1 },
    { id: "image-caption", title: "Image + Caption", description: "Large image and caption", count: 1 },
    { id: "image-text", title: "Image + Text", description: "Image beside editorial text", count: 1 },
    { id: "text-image", title: "Text + Image", description: "Editorial text beside image", count: 1 },
    { id: "two-columns", title: "2 Columns", description: "Two image/text items", count: 2 },
    { id: "three-columns", title: "3 Columns", description: "Three image/text items", count: 3 },
    { id: "four-columns", title: "4 Columns", description: "Four image/text items", count: 4 },
  ],
};

const emptyItem = (): Item => ({ title: "", description: "" });

export const defaultImageBlockData = (): ImageBlockData => ({
  layout: "basic",
  template: "one",
  fit: "fit",
  gap: "md",
  items: [emptyItem()],
});

export function parseImageBlockData(value: unknown): ImageBlockData {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    const data = (parsed ?? {}) as Partial<ImageBlockData>;
    const layout = LAYOUTS.some(item => item.id === data.layout) ? data.layout! : "basic";
    const templates = TEMPLATES[layout];
    const template = templates.some(item => item.id === data.template) ? data.template! : templates[0].id;
    const items = Array.isArray(data.items)
      ? data.items.map(item => ({ title: String(item?.title ?? ""), description: String(item?.description ?? "") }))
      : [];
    return {
      layout,
      template,
      fit: data.fit === "crop" ? "crop" : "fit",
      gap: data.gap === "sm" || data.gap === "lg" ? data.gap : "md",
      items: items.length ? items : [emptyItem()],
    };
  } catch {
    return defaultImageBlockData();
  }
}

function ratioClass(fit: ImageBlockFit, layout: ImageBlockLayout, template: string) {
  if (fit === "fit") return "h-full w-full object-contain bg-[#eee9e1]";
  if (layout === "slider" && template === "cinema") return "h-full w-full object-cover";
  return "h-full w-full object-cover";
}

function gapClass(gap: ImageBlockData["gap"]) {
  return gap === "sm" ? "gap-2" : gap === "lg" ? "gap-8" : "gap-4";
}

export default function ImageBlock({
  data,
  media,
  onChange,
  onAddPhotos,
  onRemovePhoto,
  onReorderMedia,
}: {
  data: unknown;
  media: Media[];
  onChange: (data: ImageBlockData) => void;
  onAddPhotos: () => void;
  onRemovePhoto: (mediaId: string) => void;
  onReorderMedia: (mediaIds: string[]) => void;
}) {
  const config = parseImageBlockData(data);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const templates = TEMPLATES[config.layout];
  const selectedTemplate = templates.find(item => item.id === config.template) ?? templates[0];
  const slotCount = Math.max(selectedTemplate.count, media.length || 1);
  const items = useMemo(() => Array.from({ length: slotCount }, (_, index) => config.items[index] ?? emptyItem()), [config.items, slotCount]);

  function setLayout(layout: ImageBlockLayout) {
    const next = TEMPLATES[layout][0];
    onChange({ ...config, layout, template: next.id, items: Array.from({ length: next.count }, (_, index) => config.items[index] ?? emptyItem()) });
  }

  function setTemplate(template: string) {
    const next = templates.find(item => item.id === template) ?? templates[0];
    onChange({ ...config, template: next.id, items: Array.from({ length: next.count }, (_, index) => config.items[index] ?? emptyItem()) });
  }

  function updateItem(index: number, field: keyof Item, value: string) {
    onChange({ ...config, items: items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) });
  }

  function dropMedia(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const ids = media.map(item => item.id);
    const from = ids.indexOf(draggedId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, draggedId);
    onReorderMedia(ids);
    setDraggedId(null);
  }

  const gap = gapClass(config.gap);

  return <div className="mt-7 border-t border-[#e7e2da] pt-6">
    <div className="mb-7 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {LAYOUTS.map(option => <button key={option.id} type="button" onClick={() => setLayout(option.id)} className={`border p-5 text-left transition ${config.layout === option.id ? "border-[#171717] bg-[#f0ece5]" : "border-[#ddd7cd] bg-[#faf8f4] hover:border-[#999286]"}`}>
        <span className="block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">{option.title}</span>
        <span className="mt-2 block font-serif text-lg">{option.id === "basic" ? "Images" : option.id === "grid" ? "Mosaic" : option.id === "slider" ? "Carousel" : "Image + Text"}</span>
        <span className="mt-2 block text-xs leading-5 text-[#77736c]">{option.description}</span>
      </button>)}
    </div>

    <div className="mb-7 border border-[#ded8cf] bg-[#faf8f4] p-5 lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div><p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Template</p><div className="flex flex-wrap gap-2">{templates.map(option => <button key={option.id} type="button" onClick={() => setTemplate(option.id)} className={`border px-3 py-2 text-left ${config.template === option.id ? "border-[#171717] bg-white" : "border-[#ddd7cd]"}`}><span className="block text-[10px] uppercase tracking-[0.12em]">{option.title}</span><span className="mt-1 block text-[10px] text-[#89837a]">{option.description}</span></button>)}</div></div>
        <div><p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Image treatment</p><div className="flex gap-2"><button type="button" onClick={() => onChange({ ...config, fit: "fit" })} className={`border px-4 py-2 text-[10px] uppercase tracking-[0.12em] ${config.fit === "fit" ? "border-[#171717] bg-white" : "border-[#ddd7cd]"}`}>Fit</button><button type="button" onClick={() => onChange({ ...config, fit: "crop" })} className={`border px-4 py-2 text-[10px] uppercase tracking-[0.12em] ${config.fit === "crop" ? "border-[#171717] bg-white" : "border-[#ddd7cd]"}`}>Crop</button></div></div>
        <div><p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Spacing</p><div className="flex gap-2"><button type="button" onClick={() => onChange({ ...config, gap: "sm" })} className={`border px-3 py-2 text-[10px] uppercase tracking-[0.12em] ${config.gap === "sm" ? "border-[#171717] bg-white" : "border-[#ddd7cd]"}`}>Small</button><button type="button" onClick={() => onChange({ ...config, gap: "md" })} className={`border px-3 py-2 text-[10px] uppercase tracking-[0.12em] ${config.gap === "md" ? "border-[#171717] bg-white" : "border-[#ddd7cd]"}`}>Medium</button><button type="button" onClick={() => onChange({ ...config, gap: "lg" })} className={`border px-3 py-2 text-[10px] uppercase tracking-[0.12em] ${config.gap === "lg" ? "border-[#171717] bg-white" : "border-[#ddd7cd]"}`}>Large</button></div></div>
      </div>
    </div>

    <div className="mb-7 border border-[#ded8cf] bg-white p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Images</p><p className="mt-1 text-xs text-[#77736c]">Drag any image to another position to reorder. Images keep their original proportions when Fit is selected.</p></div><div className="flex items-center gap-2"><Link href="/admin/gallery" className="border border-[#c8c1b7] px-4 py-2.5 text-[10px] uppercase tracking-[0.14em]">Open Gallery</Link><button type="button" onClick={onAddPhotos} className="bg-[#171717] px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-white">Select Photos</button></div></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {media.map(image => <div key={image.id} draggable onDragStart={() => setDraggedId(image.id)} onDragEnd={() => setDraggedId(null)} onDragOver={event => event.preventDefault()} onDrop={() => dropMedia(image.id)} className={`group relative aspect-[4/3] cursor-grab overflow-hidden bg-[#eee9e1] active:cursor-grabbing ${draggedId === image.id ? "opacity-40" : ""}`}><img src={mediaUrl(image.path)} alt={image.alt ?? image.filename} className={ratioClass(config.fit, config.layout, config.template)} /><button type="button" onClick={() => onRemovePhoto(image.id)} className="absolute right-2 top-2 bg-black/70 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.12em] text-white opacity-0 transition group-hover:opacity-100">Delete</button></div>)}
        <button type="button" onClick={onAddPhotos} className="flex aspect-[4/3] items-center justify-center border border-dashed border-[#cfc8be] bg-[#faf8f4] text-[10px] uppercase tracking-[0.14em] text-[#8a857d]">+ Add Photos</button>
      </div>
    </div>

    {config.layout === "image-text" && <div className="mb-7 border border-[#ded8cf] bg-white p-5 lg:p-6"><p className="mb-5 text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Text content</p><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{items.map((item, index) => <div key={index} className="border border-[#e5e0d8] bg-[#faf8f4] p-4"><p className="mb-3 text-[9px] uppercase tracking-[0.14em] text-[#9b9489]">Item {index + 1}</p><input value={item.title} onChange={event => updateItem(index, "title", event.target.value)} placeholder="Title" className="mb-3 w-full border-0 border-b border-[#ddd7cd] bg-transparent px-0 py-2 font-serif text-xl outline-none"/><textarea value={item.description} onChange={event => updateItem(index, "description", event.target.value)} placeholder="Description" rows={4} className="w-full resize-y border-0 bg-transparent p-0 text-sm leading-6 outline-none"/></div>)}</div></div>}

    <div className="border border-[#d9d3ca] bg-white p-5 lg:p-7">
      <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.18em] text-[#8a857d]">Preview</p><p className="mt-1 text-xs text-[#77736c]">This is the responsive editorial preview that will appear in the story.</p></div><span className="text-[10px] uppercase tracking-[0.14em] text-[#aaa49a]">{selectedTemplate.title}</span></div>
      <Preview config={config} media={media} gap={gap} />
    </div>
  </div>;
}

function Preview({ config, media, gap }: { config: ImageBlockData; media: Media[]; gap: string }) {
  const template = config.template;
  const image = (index: number, className = "") => {
    const item = media[index];
    return item ? <img src={mediaUrl(item.path)} alt={item.alt ?? item.filename} className={`${className} ${config.fit === "crop" ? "object-cover" : "object-contain bg-[#eee9e1]"}`} /> : <div className={`${className} bg-[#eee9e1]`} />;
  };

  if (config.layout === "slider") return <div className="overflow-hidden"><div className={`flex ${gap} w-max`}><div className="relative h-[420px] w-[78vw] max-w-[980px] shrink-0 overflow-hidden bg-[#eee9e1] md:h-[520px]">{image(0, "h-full w-full")}</div>{media.slice(1, 4).map((_, index) => <div key={index} className="h-[420px] w-[28vw] max-w-[360px] shrink-0 overflow-hidden bg-[#eee9e1] opacity-85 md:h-[520px]">{image(index + 1, "h-full w-full")}</div>)}</div><div className="mt-4 flex justify-end gap-2"><button type="button" className="border border-[#c9c2b8] px-4 py-2 text-[10px] uppercase tracking-[0.12em]">Previous</button><button type="button" className="border border-[#c9c2b8] px-4 py-2 text-[10px] uppercase tracking-[0.12em]">Next</button></div></div>;

  if (config.layout === "grid") {
    const cls = template === "masonry-3" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4";
    return <div className={`grid ${cls} ${gap} auto-rows-[150px] md:auto-rows-[190px]`}>{media.map((_, index) => <div key={index} className={`overflow-hidden ${template === "feature" && index === 0 ? "col-span-2 row-span-2" : template === "editorial" && index === 0 ? "col-span-2 row-span-2" : index % 5 === 0 ? "row-span-2" : ""}`}>{image(index, "h-full w-full")}</div>)}</div>;
  }

  if (config.layout === "image-text") {
    const content = (index: number) => <div className="space-y-2"><h3 className="font-serif text-2xl">{config.items[index]?.title || "Title"}</h3><p className="text-sm leading-6 text-[#77736c]">{config.items[index]?.description || "Add a description for this image."}</p></div>;
    if (template === "overlay") return <div className="relative h-[520px] overflow-hidden bg-[#222]">{image(0, "absolute inset-0 h-full w-full") }<div className="absolute inset-0 bg-black/35"/><div className="absolute inset-x-0 bottom-0 p-7 text-white lg:p-10">{content(0)}</div></div>;
    if (template === "two-columns" || template === "three-columns" || template === "four-columns") { const count = template === "two-columns" ? 2 : template === "three-columns" ? 3 : 4; return <div className={`grid gap-6 ${count === 2 ? "md:grid-cols-2" : count === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>{Array.from({ length: count }, (_, index) => <article key={index}>{image(index, "aspect-[4/3] w-full")}<div className="pt-4">{content(index)}</div></article>)}</div>; }
    if (template === "text-image") return <div className="grid items-center gap-8 md:grid-cols-2"><div>{content(0)}</div><div>{image(0, "w-full")}</div></div>;
    return <div className="grid items-center gap-8 md:grid-cols-2"><div>{image(0, "w-full")}</div><div>{content(0)}</div></div>;
  }

  const count = template === "one" ? 1 : template === "two" ? 2 : template === "three" ? 3 : 4;
  if (template === "mixed") return <div className={`grid grid-cols-2 ${gap}`}><div className="col-span-2">{image(0, "aspect-[16/8] w-full")}</div>{[1, 2, 3].map(index => <div key={index}>{image(index, "aspect-[4/5] w-full")}</div>)}</div>;
  return <div className={`grid ${count === 1 ? "grid-cols-1" : count === 2 ? "md:grid-cols-2" : count === 3 ? "md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"} ${gap}`}>{Array.from({ length: count }, (_, index) => <div key={index}>{image(index, "aspect-[4/3] w-full")}</div>)}</div>;
}
