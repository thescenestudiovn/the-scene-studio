"use client";

import { useEffect, useMemo, useState } from "react";
import { mediaUrl } from "@/lib/media";
import type { Media, StoryBlock } from "../../editor/types";
import GridGalleryPickerModal from "../gallery/GridGalleryPickerModal";

const BASE = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const DEMO = `${BASE}image-large.jpg`;
const VARIANTS = ["text-overlay-large", "text-overlay-medium", "text-overlay-full", "text-columns-2", "text-columns-3", "text-columns-4", "text-below-large", "text-below-medium", "text-left-regular", "text-right-regular", "text-left-large", "text-right-large"] as const;
type Variant = (typeof VARIANTS)[number];
type Item = { title: string; text: string };
type Props = { storyId: string; block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void };

function parseData(value: StoryBlock["data"]): Record<string, unknown> {
  if (typeof value === "string") { try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {}; } catch { return {}; } }
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}
function countFor(variant: string) { return variant === "text-columns-2" ? 2 : variant === "text-columns-3" ? 3 : variant === "text-columns-4" ? 4 : 1; }
function labelFor(variant: string) { const labels: Record<string,string> = { "text-overlay-large":"Text Overlay · Large", "text-overlay-medium":"Text Overlay · Medium", "text-overlay-full":"Text Overlay · Full", "text-columns-2":"Text Columns · 2", "text-columns-3":"Text Columns · 3", "text-columns-4":"Text Columns · 4", "text-below-large":"Text Below · Large", "text-below-medium":"Text Below · Medium", "text-left-regular":"Text Left · Regular", "text-right-regular":"Text Right · Regular", "text-left-large":"Text Left · Large", "text-right-large":"Text Right · Large" }; return labels[variant] ?? "Image with Text"; }
const isOverlay = (v:string) => v.startsWith("text-overlay-");
const isColumns = (v:string) => v.startsWith("text-columns-");
const isBelow = (v:string) => v.startsWith("text-below-");
const isSide = (v:string) => v.startsWith("text-left-") || v.startsWith("text-right-");

export default function ImageWithTextEditor({ storyId, block, onChange }: Props) {
  const data = parseData(block.data);
  const variant = (VARIANTS.includes((block.variant ?? "") as Variant) ? block.variant : "text-overlay-large") as Variant;
  const count = countFor(variant);
  const ids = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string").slice(0, count) : [];
  const sourceItems = Array.isArray(data.items) ? data.items : [];
  const items = useMemo(() => Array.from({ length: count }, (_, index) => { const item = sourceItems[index]; return { title: typeof item?.title === "string" ? item.title : "", text: typeof item?.text === "string" ? item.text : "" }; }), [count, data.items]);
  const media = Array.isArray(block.media) ? block.media : [];
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetch(`/api/admin/stories/${storyId}/blocks/${block.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ data:{...data, media_ids:ids, items} }) }).catch(error => console.error(error)); }, 400);
    return () => window.clearTimeout(timer);
  }, [storyId, block.id, JSON.stringify(items), JSON.stringify(ids)]);

  const selected = ids.map(id => media.find(item => item.id === id)).filter((item): item is Media => Boolean(item));
  const patchData = (next: Record<string,unknown>, nextMedia = media) => onChange({ data: next, media: nextMedia });
  const updateItem = (index:number, field:keyof Item, value:string) => patchData({ ...data, media_ids:ids, items:items.map((item,i)=>i===index?{...item,[field]:value}:item) });
  const changeLayout = (nextVariant:Variant) => { const nextCount=countFor(nextVariant); const nextIds=ids.slice(0,nextCount); const nextItems=Array.from({length:nextCount},(_,i)=>items[i]??{title:"",text:""}); onChange({variant:nextVariant,data:{...data,layout:nextVariant,media_ids:nextIds,items:nextItems},media:media.filter(item=>nextIds.includes(item.id))}); };
  const applyMedia = (nextIds:string[], nextMedia:Media[]) => { const limited=nextIds.slice(0,count); patchData({...data,layout:variant,media_ids:limited,items},nextMedia.filter(item=>limited.includes(item.id))); setPickerOpen(false); };
  const imageNode = (index:number, extra="") => { const image=selected[index]; return image ? <img src={mediaUrl(image.path)} alt={image.alt??image.filename} className={`h-full w-full object-contain bg-[#eee9e1] ${extra}`} /> : <img src={DEMO} alt="" className={`h-full w-full object-cover opacity-55 ${extra}`} />; };

  return <div className="w-full overflow-hidden rounded-sm border border-transparent focus-within:border-[#d9d3ca]">
    <div className="mb-3 flex items-center justify-between gap-3">
      <span className="text-[9px] uppercase tracking-[.16em] text-[#8a857d]">{labelFor(variant)}</span>
      <button type="button" onClick={()=>setPickerOpen(true)} className="border border-[#171717] bg-[#171717] px-3 py-2 text-[9px] uppercase tracking-[.13em] text-white">{selected.length ? "Change images" : "Choose images"}</button>
    </div>
    <div className={isOverlay(variant)?"relative min-h-[380px] overflow-hidden bg-[#ddd8cf]":isColumns(variant)?`grid gap-3 ${count===2?"md:grid-cols-2":count===3?"md:grid-cols-3":"md:grid-cols-4"}`:isSide(variant)?"grid items-center gap-7 md:grid-cols-2":"max-w-4xl"}>
      {items.map((item,index)=>{ const fields=<div className="space-y-2 p-1"><textarea value={item.text} onChange={event=>updateItem(index,"text",event.target.value)} placeholder="Text" rows={4} className="w-full resize-y border border-[#e5e0d8] bg-[#faf8f4] p-3 text-sm leading-6 text-[#5f5a53] outline-none placeholder:text-[#bdb7ad]" /></div>;
        if(isOverlay(variant)) return <div key={index} className="absolute inset-0">{imageNode(index)}<div className="absolute inset-0 bg-black/35"/><div className="absolute inset-x-0 bottom-0 p-7 text-white">{fields}</div></div>;
        if(isColumns(variant)) return <article key={index} className="min-w-0"><div className="aspect-[4/3] overflow-hidden bg-[#e9e5de]">{imageNode(index)}</div>{fields}</article>;
        if(isBelow(variant)) return <article key={index} className={variant==="text-below-medium"?"mx-auto max-w-2xl":"max-w-4xl"}><div className="aspect-[4/3] overflow-hidden bg-[#e9e5de]">{imageNode(index)}</div>{fields}</article>;
        const imageFirst=variant==="text-left-regular"||variant==="text-left-large"; return <div key={index} className="contents"><div className={imageFirst?"order-1":"order-2"}><div className="aspect-[4/3] overflow-hidden bg-[#e9e5de]">{imageNode(index)}</div></div><div className={imageFirst?"order-2":"order-1"}>{fields}</div></div>; })}
    </div>
    <div className="mt-4 grid grid-cols-4 gap-2">{Array.from({length:count},(_,index)=>{const image=selected[index];return <div key={index} className="relative aspect-[4/3] overflow-hidden bg-[#e9e5de]">{image?<img src={mediaUrl(image.path)} alt={image.alt??image.filename} className="h-full w-full object-cover"/>:<button type="button" onClick={()=>setPickerOpen(true)} className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[.12em] text-[#9a948a]">+ Add photo</button>}</div>;})}</div>
    <GridGalleryPickerModal open={pickerOpen} selectedIds={ids} onClose={()=>setPickerOpen(false)} onDone={applyMedia} />
  </div>;
}
