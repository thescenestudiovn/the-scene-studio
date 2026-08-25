"use client";

import { useEffect, useRef, useState } from "react";
import AddBlockTrigger from "../AddBlockTrigger";
import { mediaUrl } from "@/lib/media";
import type { StoryBlock } from "./types";

type Props = { storyId: string; blocks: StoryBlock[]; onBlocksChange: (blocks: StoryBlock[]) => void; onDelete: (blockId: string) => void; onUpdate: (block: StoryBlock, patch: Partial<StoryBlock>) => void };

const TEXT_LABELS: Record<string, string> = { "heading-1":"Heading 1", "heading-2":"Heading 2", "heading-3":"Heading 3", wide:"Wide Text", regular:"Regular Text", narrow:"Narrow Text", "columns-2":"Text Columns 2", "columns-3":"Text Columns 3", "columns-4":"Text Columns 4", "text-h1":"Heading 1", "text-h2":"Heading 2", "text-h3":"Heading 3", "text-wide":"Wide Text", "text-regular":"Regular Text", "text-narrow":"Narrow Text", "text-columns-2":"Text Columns 2", "text-columns-3":"Text Columns 3", "text-columns-4":"Text Columns 4" };
const TEXT_STYLES: Record<string,string> = { "heading-1":"text-5xl font-serif leading-[1.08]", "text-h1":"text-5xl font-serif leading-[1.08]", "heading-2":"text-4xl font-serif leading-[1.12]", "text-h2":"text-4xl font-serif leading-[1.12]", "heading-3":"text-3xl font-serif leading-[1.16]", "text-h3":"text-3xl font-serif leading-[1.16]", wide:"text-xl leading-8", "text-wide":"text-xl leading-8", regular:"text-base leading-7", "text-regular":"text-base leading-7", narrow:"mx-auto max-w-2xl text-base leading-7", "text-narrow":"mx-auto max-w-2xl text-base leading-7", "columns-2":"text-base leading-7", "text-columns-2":"text-base leading-7", "columns-3":"text-base leading-7", "text-columns-3":"text-base leading-7", "columns-4":"text-base leading-7", "text-columns-4":"text-base leading-7" };
const SIZE_OPTIONS = [
  { value:"heading-1", label:"Heading 1", tag:"h1", className:"text-5xl font-serif leading-[1.08]" },
  { value:"heading-2", label:"Heading 2", tag:"h2", className:"text-4xl font-serif leading-[1.12]" },
  { value:"heading-3", label:"Heading 3", tag:"h3", className:"text-3xl font-serif leading-[1.16]" },
  { value:"paragraph-1", label:"Paragraph 1", tag:"p", className:"text-xl leading-8" },
  { value:"paragraph-2", label:"Paragraph 2", tag:"p", className:"text-base leading-7" },
  { value:"paragraph-3", label:"Paragraph 3", tag:"p", className:"text-sm leading-6" },
] as const;

type SavedSelection = { range: Range; editor: HTMLDivElement };
type DropPosition = { targetId: string; side: "before" | "after" };

function AlignIcon({ align }: { align:"left"|"center"|"right"|"justify" }) {
  const widths = align === "left" ? [18,14,18,11] : align === "center" ? [14,18,14,16] : align === "right" ? [18,14,18,11] : [18,18,18,18];
  const positions = align === "right" ? [0,4,0,7] : align === "center" ? [2,0,2,1] : [0,0,0,0];
  return <svg aria-hidden="true" width="20" height="18" viewBox="0 0 20 18" fill="none">{widths.map((w,i)=><rect key={i} x={positions[i]} y={i*4+1} width={w} height="2" rx="1" fill="currentColor" />)}</svg>;
}

function TextToolbar({ editorRef, selectionRef, onChange }: { editorRef:React.RefObject<HTMLDivElement|null>; selectionRef:React.MutableRefObject<SavedSelection|null>; onChange:()=>void }) {
  const restore=()=>{ const saved=selectionRef.current, editor=editorRef.current; if(!saved||!editor||saved.editor!==editor)return false; editor.focus(); const s=window.getSelection(); if(!s)return false; s.removeAllRanges(); s.addRange(saved.range); return true; };
  const save=()=>{ const editor=editorRef.current,s=window.getSelection(); if(editor&&s&&s.rangeCount&&editor.contains(s.anchorNode)) selectionRef.current={range:s.getRangeAt(0).cloneRange(),editor}; };
  const run=(command:string,value?:string)=>{ if(!restore())return; document.execCommand(command,false,value); save(); onChange(); };
  const setSize=(option:(typeof SIZE_OPTIONS)[number])=>{ if(!restore())return; const editor=editorRef.current; const selection=window.getSelection(); if(!editor||!selection||!selection.rangeCount)return; let node:Node|null=selection.anchorNode; if(node?.nodeType===Node.TEXT_NODE)node=node.parentElement; const current=(node as Element|null)?.closest("h1,h2,h3,p,div") as HTMLElement|null; if(!current||!editor.contains(current))return; const replacement=document.createElement(option.tag); replacement.className=option.className; while(current.firstChild)replacement.appendChild(current.firstChild); current.replaceWith(replacement); const range=document.createRange(); range.selectNodeContents(replacement); range.collapse(false); selection.removeAllRanges(); selection.addRange(range); save(); onChange(); };
  const align=[['justifyLeft','left','Align left'],['justifyCenter','center','Align center'],['justifyRight','right','Align right'],['justifyFull','justify','Justify']] as const;
  return <div className="relative z-20 flex flex-wrap items-center gap-0.5 border-b border-[#d9d3ca] bg-[#f7f4ef] px-2 py-1.5 shadow-sm" onMouseDown={e=>e.stopPropagation()}>
    <select aria-label="Text size" title="Text size" defaultValue="paragraph-2" onChange={e=>{const o=SIZE_OPTIONS.find(x=>x.value===e.target.value);if(o)setSize(o);}} className="h-8 w-[140px] cursor-pointer appearance-auto border border-[#d9d3ca] bg-white px-2 text-xs text-[#403c36] outline-none hover:border-[#aaa49a] focus:border-[#8f887e]">{SIZE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]"/>
    {[["bold","B"],["italic","I"],["underline","U"]].map(([cmd,label])=><button key={cmd} type="button" title={cmd} onMouseDown={e=>{e.preventDefault();save();}} onClick={()=>run(cmd)} className={`flex h-8 w-8 items-center justify-center rounded-sm text-sm text-[#403c36] hover:bg-white ${cmd==='bold'?'font-bold':cmd==='italic'?'italic':'underline'}`}>{label}</button>)}
    <label title="Text color" className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm hover:bg-white" onMouseDown={e=>{e.preventDefault();save();}}><span className="border-b-4 border-[#7d4f45] text-sm font-semibold">A</span><input type="color" defaultValue="#222222" className="absolute inset-0 opacity-0" onChange={e=>run("foreColor",e.target.value)}/></label>
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]"/>
    {align.map(([cmd,val,title])=><button key={cmd} type="button" title={title} onMouseDown={e=>{e.preventDefault();save();}} onClick={()=>run(cmd)} className="flex h-8 w-8 items-center justify-center rounded-sm text-[#403c36] hover:bg-white"><AlignIcon align={val}/></button>)}
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]"/>
    <button type="button" title="Remove formatting" onMouseDown={e=>{e.preventDefault();save();}} onClick={()=>run("removeFormat")} className="flex h-8 w-8 items-center justify-center rounded-sm text-sm text-[#403c36] hover:bg-white">T<span className="text-[#77736c]">x</span></button>
  </div>;
}

function TextBlockEditor({ block,onChange,onBlur }:{block:StoryBlock;onChange:(patch:Partial<StoryBlock>)=>void;onBlur:()=>void}) {
  const wrapperRef=useRef<HTMLDivElement|null>(null);
  const editorRef=useRef<HTMLDivElement|null>(null);
  const selectionRef=useRef<SavedSelection|null>(null);
  const [editing,setEditing]=useState(false);
  const content=block.body??block.title??"";
  useEffect(()=>{if(editorRef.current&&!editing&&editorRef.current.innerHTML!==content)editorRef.current.innerHTML=content;},[content,editing]);
  const save=()=>{const e=editorRef.current,s=window.getSelection();if(e&&s&&s.rangeCount&&e.contains(s.anchorNode))selectionRef.current={range:s.getRangeAt(0).cloneRange(),editor:e};};
  const changed=()=>{save();onChange({body:editorRef.current?.innerHTML??""});};
  const variant=block.variant??block.type;
  const style=TEXT_STYLES[variant]??"text-base leading-7";
  return <div ref={wrapperRef} className="overflow-visible border border-transparent focus-within:border-[#d9d3ca]" onFocusCapture={()=>setEditing(true)} onBlurCapture={e=>{if(!wrapperRef.current?.contains(e.relatedTarget as Node|null)){setEditing(false);onBlur();}}}>
    {editing&&<TextToolbar editorRef={editorRef} selectionRef={selectionRef} onChange={changed}/>}<div ref={editorRef} contentEditable suppressContentEditableWarning spellCheck className={`min-h-12 whitespace-pre-wrap px-2 py-2 outline-none ${style}`} onFocus={save} onKeyUp={save} onMouseUp={save} onInput={changed}/>
  </div>;
}

function DragHandle({ onDragStart, onDragEnd }: { onDragStart: () => void; onDragEnd: () => void }) {
  return <button type="button" draggable aria-label="Drag to reorder block" title="Drag to reorder" onDragStart={e=>{e.dataTransfer.effectAllowed="move";onDragStart();}} onDragEnd={onDragEnd} className="flex h-7 w-7 cursor-grab items-center justify-center bg-[#f5f2ec] text-[#77736c] hover:bg-white active:cursor-grabbing" onMouseDown={e=>e.stopPropagation()}>
    <svg aria-hidden="true" width="14" height="16" viewBox="0 0 14 16" fill="none"><circle cx="4" cy="3" r="1" fill="currentColor"/><circle cx="10" cy="3" r="1" fill="currentColor"/><circle cx="4" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="8" r="1" fill="currentColor"/><circle cx="4" cy="13" r="1" fill="currentColor"/><circle cx="10" cy="13" r="1" fill="currentColor"/></svg>
  </button>;
}

function BlockCard({block,blocks,onBlocksChange,onDelete,onUpdate,draggingId,onDragStart,onDragEnd,onDragOver,onDrop}:{block:StoryBlock;blocks:StoryBlock[];onBlocksChange:Props["onBlocksChange"];onDelete:Props["onDelete"];onUpdate:Props["onUpdate"];draggingId:string|null;onDragStart:(id:string)=>void;onDragEnd:()=>void;onDragOver:(targetId:string,side:"before"|"after")=>void;onDrop:(targetId:string,side:"before"|"after")=>void}) {
  const textLabel=TEXT_LABELS[block.variant??block.type];
  const isText=block.type==="text"||block.type.startsWith("text-");
  const updateLocal=(patch:Partial<StoryBlock>)=>onBlocksChange(blocks.map(item=>item.id===block.id?{...item,...patch}:item));
  return <article className="group relative" onDragOver={e=>{e.preventDefault();const rect=e.currentTarget.getBoundingClientRect();const side=e.clientY<rect.top+rect.height/2?"before":"after";onDragOver(block.id,side);e.dataTransfer.dropEffect="move";}} onDrop={e=>{e.preventDefault();const rect=e.currentTarget.getBoundingClientRect();const side=e.clientY<rect.top+rect.height/2?"before":"after";onDrop(block.id,side);}}>
    {draggingId===block.id&&<div className="pointer-events-none absolute inset-0 z-10 rounded-sm border-2 border-dashed border-[#8f887e] bg-[#8f887e]/5"/>}
    {isText?<TextBlockEditor block={block} onChange={updateLocal} onBlur={()=>onUpdate(block,{body:block.body,title:block.title})}/>:<div className="border border-[#d9d3ca] bg-white p-7 lg:p-9"><p className="text-sm text-[#77736c]">This block has its own dedicated editor component.</p>{block.media.length>0&&<div className="mt-5 grid grid-cols-3 gap-3">{block.media.map(media=><div key={media.id} className="aspect-square overflow-hidden bg-[#e7e2da]"><img src={mediaUrl(media.path)} alt={media.alt??media.filename} className="h-full w-full object-cover"/></div>)}</div>}</div>}
    <div className="absolute -top-3 right-0 z-20 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      <DragHandle onDragStart={()=>onDragStart(block.id)} onDragEnd={onDragEnd}/>
      <span className="bg-[#f5f2ec] px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">{textLabel??block.variant??block.type}</span>
      <button type="button" onClick={()=>onDelete(block.id)} className="bg-[#f5f2ec] px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-[#9a4c42]">Delete</button>
    </div>
  </article>;
}

function DropIndicator({ side, visible }: { side:"before"|"after"; visible:boolean }) {
  if(!visible)return null;
  return <div className={`pointer-events-none relative z-30 flex h-8 items-center ${side==="before"?"-mb-2":"-mt-2"}`}><div className="flex w-full items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full bg-[#7d4f45]"/><div className="h-0.5 flex-1 bg-[#7d4f45]"/><span className="bg-[#7d4f45] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-white">Insert block here</span><div className="h-0.5 flex-1 bg-[#7d4f45]"/><span className="h-2 w-2 shrink-0 rounded-full bg-[#7d4f45]"/></div></div>;
}

export default function StoryContent({storyId,blocks,onBlocksChange,onDelete,onUpdate}:Props){
  const visibleBlocks=blocks.filter(block=>block.is_visible!==0).slice().sort((a,b)=>a.sort_order-b.sort_order);
  const [draggingId,setDraggingId]=useState<string|null>(null);
  const [dropPosition,setDropPosition]=useState<DropPosition|null>(null);
  const reorderBlocks=async(targetId:string,side:"before"|"after")=>{
    if(!draggingId||draggingId===targetId)return;
    const currentIds=visibleBlocks.map(block=>block.id);
    const from=currentIds.indexOf(draggingId); const targetIndex=currentIds.indexOf(targetId);
    if(from<0||targetIndex<0)return;
    const nextIds=[...currentIds]; nextIds.splice(from,1);
    let insertIndex=nextIds.indexOf(targetId)+(side==="after"?1:0);
    if(insertIndex<0)return;
    nextIds.splice(insertIndex,0,draggingId);
    if(nextIds.join(",")==currentIds.join(",")){setDraggingId(null);setDropPosition(null);return;}
    const previous=blocks;
    const optimistic=nextIds.map((blockId,index)=>{const block=blocks.find(item=>item.id===blockId);return block?{...block,sort_order:(index+1)*1000}:null;}).filter((block):block is StoryBlock=>Boolean(block));
    onBlocksChange(optimistic); setDraggingId(null); setDropPosition(null);
    try{
      const response=await fetch(`/api/admin/stories/${storyId}/blocks`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({block_ids:nextIds})});
      const data=await response.json() as {success?:boolean;blocks?:StoryBlock[];error?:string};
      if(!response.ok||!data.success||!data.blocks)throw new Error(data.error||"Failed to reorder story blocks");
      onBlocksChange(data.blocks);
    }catch(error){onBlocksChange(previous);console.error(error);}
  };
  return <section className="min-w-0"><div className="space-y-1">{visibleBlocks.map((block,index)=><div key={block.id}>
    <DropIndicator side="before" visible={dropPosition?.targetId===block.id&&dropPosition.side==="before"&&draggingId!==block.id}/>
    <BlockCard block={block} blocks={blocks} onBlocksChange={onBlocksChange} onDelete={onDelete} onUpdate={onUpdate} draggingId={draggingId} onDragStart={id=>{setDraggingId(id);setDropPosition(null);}} onDragEnd={()=>{setDraggingId(null);setDropPosition(null);}} onDragOver={(targetId,side)=>{if(targetId!==draggingId)setDropPosition({targetId,side});}} onDrop={reorderBlocks}/>
    <DropIndicator side="after" visible={dropPosition?.targetId===block.id&&dropPosition.side==="after"&&draggingId!==block.id}/>
    <AddBlockTrigger storyId={storyId} afterBlockId={block.id}/>
    {index===visibleBlocks.length-1&&draggingId&&dropPosition===null&&<div className="pointer-events-none mt-2 flex h-8 items-center gap-3"><span className="h-2 w-2 rounded-full bg-[#7d4f45]"/><div className="h-0.5 flex-1 bg-[#7d4f45]"/><span className="text-[9px] uppercase tracking-[0.14em] text-[#8a857d]">Drop at end</span><div className="h-0.5 flex-1 bg-[#7d4f45]"/></div>}
  </div>)}{visibleBlocks.length===0&&<AddBlockTrigger storyId={storyId}/>}</div></section>;
}
