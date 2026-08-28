"use client";

import { useEffect, useMemo, useState } from "react";
import { mediaUrl } from "@/lib/media";
import type { Media, StoryBlock } from "../../editor/types";
import GridGalleryPickerModal from "./GridGalleryPickerModal";

const DEMO: Record<string,string> = {
  vertical: "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/photo-grid-vertical.jpg",
  horizontal: "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/photo-grid-horizontal.jpg",
  square: "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/photo-grid-square.jpg",
  stacked: "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/photo-grid-stacked.jpg",
};
const VARIANTS = ["vertical","horizontal","square","stacked"] as const;
const LABELS: Record<Variant,string> = { vertical: "Vertical Grid", horizontal: "Horizontal Grid", square: "Square Grid", stacked: "Stacked Grid" };
type Variant = typeof VARIANTS[number];
type Props = { storyId:string; block:StoryBlock; onChange:(patch:Partial<StoryBlock>)=>void };
type ManageProps={open:boolean;selected:Media[];draftIds:string[];variant:Variant;onDraftChange:(ids:string[])=>void;onCancel:()=>void;onDone:()=>void;onAdd:()=>void};

function GalleryManageModal({open,selected,draftIds,variant,onDraftChange,onCancel,onDone,onAdd}:ManageProps) {
  const [dragId,setDragId]=useState<string|null>(null);
  const [dragOverId,setDragOverId]=useState<string|null>(null);
  const mediaMap=new Map(selected.map(item=>[item.id,item]));
  const items=draftIds.map(id=>mediaMap.get(id)).filter((item):item is Media=>Boolean(item));
  useEffect(()=>{ if(open) setDragId(null); },[open]);
  if(!open)return null;
  const move=(targetId:string)=>{
    if(!dragId||dragId===targetId)return;
    const next=[...draftIds],from=next.indexOf(dragId),to=next.indexOf(targetId);
    if(from<0||to<0)return;
    next.splice(from,1);next.splice(to,0,dragId);onDraftChange(next);setDragId(null);setDragOverId(null);
  };
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"><div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
    <div className="flex shrink-0 items-center justify-between border-b border-[#ebe7e0] px-6 py-5"><div><p className="text-[10px] uppercase tracking-[.18em] text-[#8a857d]">Grid Gallery</p><h2 className="mt-1 font-serif text-2xl text-[#171717]">Manage images</h2></div><button type="button" onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#77736c] hover:bg-[#f5f2ed]">×</button></div>
    <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6"><p className="mb-4 text-xs text-[#77736c]">Drag to change the order. Remove images here without deleting them from your media library.</p>
      {items.length?<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{items.map((item,index)=><div key={item.id} draggable onDragStart={()=>setDragId(item.id)} onDragOver={event=>{event.preventDefault();setDragOverId(item.id)}} onDrop={()=>move(item.id)} onDragEnd={()=>{setDragId(null);setDragOverId(null)}} className={`group relative overflow-hidden rounded-lg border bg-[#f3f0eb] ${dragOverId===item.id?"border-[#7d4f45] ring-2 ring-[#7d4f45]/15":"border-[#e5dfd7]"}`}><img src={mediaUrl(item.path)} alt={item.alt??item.filename} className="aspect-square h-auto w-full object-cover"/><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 px-2.5 py-2 text-white"><span className="text-[11px]">{index+1}</span><div className="flex items-center gap-2"><span className="cursor-grab text-sm opacity-80">≡</span><button type="button" onClick={()=>onDraftChange(draftIds.filter(id=>id!==item.id))} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-sm hover:bg-white/25">×</button></div></div></div>)}</div>:<div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[#ddd6cd] text-sm text-[#99938b]">No images in this grid.</div>}
      <button type="button" onClick={onAdd} className="mt-5 flex w-full items-center justify-center rounded-xl border border-dashed border-[#cfc7bd] px-4 py-4 text-sm text-[#5f5a53] transition hover:border-[#8f867b] hover:bg-[#faf8f4]">+ Add Images</button>
    </div>
    <div className="flex shrink-0 items-center justify-between border-t border-[#ebe7e0] px-6 py-4"><p className="text-xs text-[#77736c]">{draftIds.length} images</p><div className="flex gap-3"><button type="button" onClick={onCancel} className="rounded-full px-5 py-2.5 text-xs text-[#77736c] hover:bg-[#f5f2ed]">Cancel</button><button type="button" onClick={onDone} className="rounded-full bg-[#171717] px-6 py-2.5 text-xs text-white">Done</button></div></div>
  </div></div>;
}

export default function GridGalleryEditor({storyId,block,onChange}:Props){
  void storyId;
  const data=block.data??{};
  const media=Array.isArray(block.media)?block.media:[];
  const ids=Array.isArray(data.media_ids)?data.media_ids.filter((id):id is string=>typeof id==="string"):[];
  const rawVariant=typeof block.variant==="string"?block.variant.replace(/^grid-/ ,""):"vertical";
  const variant:Variant=VARIANTS.includes(rawVariant as Variant)?rawVariant as Variant:"vertical";
  const [manageOpen,setManageOpen]=useState(false);
  const [pickerOpen,setPickerOpen]=useState(false);
  const [draftIds,setDraftIds]=useState<string[]>(ids);
  const [draftMedia,setDraftMedia]=useState<Media[]>(media);
  useEffect(()=>{setDraftIds(ids);setDraftMedia(media);},[block.id,block.data,block.media]);
  const selected=useMemo(()=>draftIds.map(id=>draftMedia.find(item=>item.id===id)).filter((item):item is Media=>Boolean(item)),[draftIds,draftMedia]);
  const openManager=()=>{setDraftIds(ids);setDraftMedia(media);setManageOpen(true);};
  const save=()=>{onChange({data:{...data,collection_id:null,media_ids:draftIds},variant:`grid-${variant}`});setManageOpen(false);};
  const cycleVariant=()=>{ const next=VARIANTS[(VARIANTS.indexOf(variant)+1)%VARIANTS.length]; onChange({variant:`grid-${next}`}); };
  const renderSelected=()=>{
    if(!selected.length)return <img src={DEMO[variant]} alt="" className="block h-auto w-full"/>;
    if(variant==="vertical")return <div className="grid grid-cols-3 gap-2">{selected.map(item=><img key={item.id} src={mediaUrl(item.path)} alt={item.alt??item.filename} className="block h-auto w-full object-contain"/>)}</div>;
    if(variant==="horizontal")return <div className="flex gap-2 overflow-hidden">{selected.map(item=><img key={item.id} src={mediaUrl(item.path)} alt={item.alt??item.filename} className="block h-auto min-w-0 flex-1 object-contain"/>)}</div>;
    if(variant==="stacked")return <div className="columns-2 gap-2 space-y-2">{selected.map(item=><img key={item.id} src={mediaUrl(item.path)} alt={item.alt??item.filename} className="mb-2 block h-auto w-full break-inside-avoid object-contain"/>)}</div>;
    return <div className="grid grid-cols-3 gap-2">{selected.map(item=><img key={item.id} src={mediaUrl(item.path)} alt={item.alt??item.filename} className="block aspect-square h-auto w-full object-cover"/>)}</div>;
  };
  return <div className="w-full overflow-hidden rounded-sm">
    <div className="mb-3 flex items-center justify-end gap-2"><button type="button" onClick={cycleVariant} title={`Switch layout · ${LABELS[variant]}`} aria-label={`Switch layout · ${LABELS[variant]}`} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#ddd6cd] bg-white px-3 text-[11px] text-[#5f5a53] shadow-sm transition hover:border-[#aaa197] hover:bg-[#faf8f4]"><span className="text-sm leading-none">↻</span><span>{LABELS[variant]}</span></button></div>
    <button type="button" onClick={openManager} className="block w-full text-left">{renderSelected()}</button>
    <GalleryManageModal open={manageOpen} selected={draftMedia} draftIds={draftIds} variant={variant} onDraftChange={setDraftIds} onCancel={()=>setManageOpen(false)} onDone={save} onAdd={()=>setPickerOpen(true)}/>
    <GridGalleryPickerModal open={pickerOpen} selectedIds={draftIds} onClose={()=>setPickerOpen(false)} onDone={(nextIds: string[], nextMedia: Media[])=>{setDraftIds(nextIds);setDraftMedia(current=>{const map=new Map(current.map(item=>[item.id,item]));for(const item of nextMedia)map.set(item.id,item);return Array.from(map.values());});setPickerOpen(false);}} />
  </div>;
}
