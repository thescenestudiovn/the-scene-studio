"use client";

import { useMemo, useState } from "react";
import MediaPickerModal from "../image/MediaPickerModal";
import type { StoryBlock } from "../../editor/types";
import ContentBlockView from "./ContentBlockView";

type Props = { block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void };
function text(value: unknown) { return typeof value === "string" ? value : ""; }
function list(value: unknown) { return Array.isArray(value) ? value.map(item => item && typeof item === "object" ? item as Record<string, unknown> : {}) : []; }

export default function ContentBlockEditor({ block, onChange }: Props) {
  const data = block.data ?? {};
  const variant = block.variant ?? text(data.variant) ?? "banner-1";
  const media = block.media ?? [];
  const selectedIds = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
  const [pickerOpen, setPickerOpen] = useState(false);
  const items = useMemo(() => list(data.items), [data.items]);
  const update = (key: string, value: unknown) => onChange({ data: { ...data, [key]: value }, ...(key === "title" ? { title: text(value) } : {}), ...(key === "body" ? { body: text(value) } : {}) });
  const updateItem = (index: number, patch: Record<string, unknown>) => update("items", items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const hasImage = ["banner-2", "banner-media", "info-1", "info-2", "testimonial-2", "banner-slider-1"].includes(variant);
  const needsButton = variant.startsWith("banner");
  return <div className="grid gap-5">
    <ContentBlockView variant={variant} data={data} media={media} />
    <div className="grid gap-3 border border-[#d8d3ca] bg-[#fbfaf7] p-5">
      <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">Content · {variant}</p>
      <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Eyebrow" value={text(data.eyebrow)} onChange={e=>update("eyebrow",e.target.value)} />
      <input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Heading" value={text(data.title)} onChange={e=>update("title",e.target.value)} />
      <textarea className="min-h-24 border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Description" value={text(data.body)} onChange={e=>update("body",e.target.value)} />
      {needsButton && <><input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Button text" value={text(data.button_text)} onChange={e=>update("button_text",e.target.value)} /><input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Button URL" value={text(data.button_url)} onChange={e=>update("button_url",e.target.value)} /></>}
      {hasImage && <div className="grid gap-3 border-t border-[#e3ded6] pt-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">Image</p>
          <p className="mt-1 text-[11px] leading-5 text-[#99938b]">{variant === "banner-slider-1" ? "Choose up to 3 images for the slider." : "Upload a new image or use an image already in your Gallery."}</p>
        </div>
        <button type="button" className="justify-self-start border border-[#171717] bg-white px-4 py-2.5 text-[9px] uppercase tracking-[0.14em] hover:bg-[#f5f2ed]" onClick={()=>setPickerOpen(true)}>{selectedIds.length ? (variant === "banner-slider-1" ? "Change images" : "Change image") : (variant === "banner-slider-1" ? "Choose images" : "Choose image")}</button>
      </div>}
      {variant.startsWith("testimonial") || variant.startsWith("quote") ? <><textarea className="min-h-28 border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Quote" value={text(data.quote)} onChange={e=>update("quote",e.target.value)} /><input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Author" value={text(data.author)} onChange={e=>update("author",e.target.value)} /><input className="border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Role" value={text(data.role)} onChange={e=>update("role",e.target.value)} /></> : null}

      {(variant.startsWith("info") || variant.startsWith("pricing") || variant.startsWith("faq") || variant === "banner-slider-1") && <div className="grid gap-3">{items.map((item,index)=><div key={index} className="grid gap-2 border-t border-[#e3ded6] pt-3">
        {variant.startsWith("faq") ? <><input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Question" value={text(item.question)} onChange={e=>updateItem(index,{question:e.target.value})}/><textarea className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Answer" value={text(item.answer)} onChange={e=>updateItem(index,{answer:e.target.value})}/></> : <><input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Title" value={text(item.title)} onChange={e=>updateItem(index,{title:e.target.value})}/>{variant.startsWith("pricing")&&<input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Price" value={text(item.price)} onChange={e=>updateItem(index,{price:e.target.value})}/>}<textarea className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder={variant.startsWith("pricing") ? "Description" : "Text"} value={text(item.text)} onChange={e=>updateItem(index,{text:e.target.value})}/>{variant.startsWith("pricing")&&<input className="border border-[#d8d3ca] bg-white p-2.5 text-sm" placeholder="Features, separated by commas" value={text(item.features)} onChange={e=>updateItem(index,{features:e.target.value})}/>}</>}
      </div>)}</div>}
    </div>
    {hasImage && <MediaPickerModal open={pickerOpen} required={variant === "banner-slider-1" ? 3 : 1} selectedIds={selectedIds.slice(0, variant === "banner-slider-1" ? 3 : 1)} collectionId="" onClose={()=>setPickerOpen(false)} onDone={(_collectionId, ids, selectedMedia)=>{ onChange({ data: {...data, media_ids: ids.slice(0, variant === "banner-slider-1" ? 3 : 1)}, media: selectedMedia as unknown as StoryBlock["media"] }); setPickerOpen(false); }} />}
  </div>;
}