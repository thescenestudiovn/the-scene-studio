"use client";

import { useEffect, useRef, useState } from "react";
import AddBlockTrigger from "../AddBlockTrigger";
import TextColumnsEditor from "./TextColumnsEditor";
import ImageBlockEditor from "../blocks/image/ImageBlockEditor";
import ImageWithTextEditor from "../blocks/image/ImageWithTextEditor";
import GridGalleryEditor from "../blocks/gallery/GridGalleryEditor";
import VideoBlockEditor from "../blocks/video/VideoBlockEditor";
import type { StoryBlock } from "./types";

type Props={storyId:string;blocks:StoryBlock[];onBlocksChange:(blocks:StoryBlock[])=>void;onDelete:(blockId:string)=>void;onUpdate:(block:StoryBlock,patch:Partial<StoryBlock>)=>void};
type DropPosition={targetId:string;side:"before"|"after"};
type SavedSelection={range:Range;editor:HTMLDivElement};

const TEXT_STYLES:Record<string,string>={"heading-1":"text-5xl font-serif leading-[1.08]","text-h1":"text-5xl font-serif leading-[1.08]","heading-2":"text-4xl font-serif leading-[1.12]","text-h2":"text-4xl font-serif leading-[1.12]","heading-3":"text-3xl font-serif leading-[1.16]","text-h3":"text-3xl font-serif leading-[1.16]",wide:"text-xl leading-8","text-wide":"text-xl leading-8",regular:"text-base leading-7","text-regular":"text-base leading-7",narrow:"mx-auto max-w-2xl text-base leading-7","text-narrow":"mx-auto max-w-2xl text-base leading-7"};
const LABELS:Record<string,string>={"heading-1":"Heading 1","heading-2":"Heading 2","heading-3":"Heading 3",wide:"Wide Text",regular:"Regular Text",narrow:"Narrow Text","text-h1":"Heading 1","text-h2":"Heading 2","text-h3":"Heading 3","text-wide":"Wide Text","text-regular":"Regular Text","text-narrow":"Narrow Text","columns-1":"Columns 1","columns-2":"Columns 2","columns-3":"Columns 3","columns-4":"Columns 4",large:"Large Image",medium:"Medium Image","full-width":"Full Width Image","grid-vertical":"Vertical Grid","grid-horizontal":"Horizontal Grid","grid-square":"Square Grid","grid-stacked":"Stacked Grid",slideshow:"Slideshow",carousel:"Carousel","text-overlay-large":"Image with Text · Large","text-overlay-medium":"Image with Text · Medium","text-overlay-full":"Small Image with Text · Full","text-columns-2":"Image with Text · Columns 2","text-columns-3":"Image with Text · Columns 3","text-columns-4":"Image with Text · Columns 4","text-below-large":"Image with Text · Below Large","text-below-medium":"Small Image with Text · Below Medium","text-left-regular":"Image with Text · Left Regular","text-right-regular":"Image with Text · Right Regular","text-left-large":"Large Image with Text · Left","text-right-large":"Large Image with Text · Right","banner-video":"YouTube Video"};
const IMAGE_SINGLE_VARIANTS=["medium","large","full-width"] as const;
const IMAGE_COLUMN_VARIANTS=["columns-1","columns-2","columns-3"] as const;
const GRID_VARIANTS=["grid-vertical","grid-horizontal","grid-square","grid-stacked"] as const;
const SLIDER_VARIANTS=["slideshow","carousel"] as const;
const IMAGE_TEXT_OVERLAY_VARIANTS=["text-overlay-large","text-overlay-medium","text-overlay-full"] as const;
const IMAGE_TEXT_COLUMN_VARIANTS=["text-columns-2","text-columns-3","text-columns-4"] as const;
const IMAGE_TEXT_BELOW_VARIANTS=["text-below-large","text-below-medium"] as const;
const IMAGE_TEXT_SIDE_REGULAR_VARIANTS=["text-left-regular","text-right-regular"] as const;
const IMAGE_TEXT_SIDE_LARGE_VARIANTS=["text-left-large","text-right-large"] as const;
const HEADING_VARIANTS=["heading-1","heading-2","heading-3","text-h1","text-h2","text-h3"] as const;
const TEXT_WIDTH_VARIANTS=["wide","regular","narrow","text-wide","text-regular","text-narrow"] as const;
const TEXT_COLUMN_VARIANTS=["columns-1","columns-2","columns-3","text-columns-2","text-columns-3","text-columns-4"] as const;

function nextVariant(variant:string,blockType:string){
  if(blockType==="image"){
    const singleIndex=IMAGE_SINGLE_VARIANTS.indexOf(variant as (typeof IMAGE_SINGLE_VARIANTS)[number]);
    if(singleIndex>=0)return IMAGE_SINGLE_VARIANTS[(singleIndex+1)%IMAGE_SINGLE_VARIANTS.length];
    const columnIndex=IMAGE_COLUMN_VARIANTS.indexOf(variant as (typeof IMAGE_COLUMN_VARIANTS)[number]);
    if(columnIndex>=0)return IMAGE_COLUMN_VARIANTS[(columnIndex+1)%IMAGE_COLUMN_VARIANTS.length];
    if(variant==="columns-4")return "columns-1";
    if(GRID_VARIANTS.includes(variant as (typeof GRID_VARIANTS)[number]))return GRID_VARIANTS[(GRID_VARIANTS.indexOf(variant as (typeof GRID_VARIANTS)[number])+1)%GRID_VARIANTS.length];
    if(SLIDER_VARIANTS.includes(variant as (typeof SLIDER_VARIANTS)[number]))return SLIDER_VARIANTS[(SLIDER_VARIANTS.indexOf(variant as (typeof SLIDER_VARIANTS)[number])+1)%SLIDER_VARIANTS.length];
    const imageTextGroups=[IMAGE_TEXT_OVERLAY_VARIANTS,IMAGE_TEXT_COLUMN_VARIANTS,IMAGE_TEXT_BELOW_VARIANTS,IMAGE_TEXT_SIDE_REGULAR_VARIANTS,IMAGE_TEXT_SIDE_LARGE_VARIANTS] as const;
    for(const list of imageTextGroups){const index=(list as readonly string[]).indexOf(variant);if(index>=0)return list[(index+1)%list.length];}
  }
  if(blockType==="text"||blockType.startsWith("text-")){
    const headingIndex=HEADING_VARIANTS.indexOf(variant as (typeof HEADING_VARIANTS)[number]);
    if(headingIndex>=0)return HEADING_VARIANTS[(headingIndex%3+1)%3];
    const widthIndex=TEXT_WIDTH_VARIANTS.indexOf(variant as (typeof TEXT_WIDTH_VARIANTS)[number]);
    if(widthIndex>=0)return ["wide","regular","narrow"][(widthIndex%3+1)%3];
    const columnIndex=TEXT_COLUMN_VARIANTS.indexOf(variant as (typeof TEXT_COLUMN_VARIANTS)[number]);
    if(columnIndex>=0){const canonical=columnIndex<3?columnIndex:columnIndex-3+1;return ["columns-1","columns-2","columns-3"][(canonical+1)%3];}
  }
  return null;
}

function switchLabel(variant:string,blockType:string){
  if(blockType==="image"){
    if(variant==="medium")return "Medium · 50%";
    if(variant==="large")return "Large · 70%";
    if(variant==="full-width")return "Full · 100%";
    if(variant.startsWith("columns-"))return `Columns ${variant.replace("columns-","")}`;
    if(variant.startsWith("grid-"))return LABELS[variant]??"Grid";
    if(variant==="slideshow"||variant==="carousel")return LABELS[variant]??"Slider";
    if(variant.startsWith("text-overlay-"))return LABELS[variant]??"Image with Text";
    if(variant.startsWith("text-columns-"))return LABELS[variant]??`Image with Text · Columns ${variant.replace("text-columns-","")}`;
    if(variant.startsWith("text-below-"))return LABELS[variant]??"Image with Text";
    if(variant.startsWith("text-left-")||variant.startsWith("text-right-"))return LABELS[variant]??"Image with Text";
  }
  if(blockType==="text"||blockType.startsWith("text-")){
    if(variant.startsWith("heading-")||variant.startsWith("text-h"))return LABELS[variant]??"Heading";
    if(variant.startsWith("text-columns-"))return `Columns ${variant.replace("text-columns-","")}`;
    if(variant.startsWith("columns-"))return `Columns ${variant.replace("columns-","")}`;
    if(["wide","regular","narrow","text-wide","text-regular","text-narrow"].includes(variant))return LABELS[variant]??"Text";
  }
  return null;
}

const SIZE_OPTIONS=[
  {value:"heading-1",label:"Heading 1",tag:"h1",className:"text-5xl font-serif leading-[1.08]"},
  {value:"heading-2",label:"Heading 2",tag:"h2",className:"text-4xl font-serif leading-[1.12]"},
  {value:"heading-3",label:"Heading 3",tag:"h3",className:"text-3xl font-serif leading-[1.16]"},
  {value:"paragraph-1",label:"Paragraph 1",tag:"p",className:"text-xl leading-8"},
  {value:"paragraph-2",label:"Paragraph 2",tag:"p",className:"text-base leading-7"},
  {value:"paragraph-3",label:"Paragraph 3",tag:"p",className:"text-sm leading-6"},
] as const;

function AlignIcon({align}:{align:"left"|"center"|"right"|"justify"}){const widths=align==="left"?[18,14,18,11]:align==="center"?[14,18,14,16]:align==="right"?[18,14,18,11]:[18,18,18,18];const positions=align==="right"?[0,4,0,7]:align==="center"?[2,0,2,1]:[0,0,0,0];return <svg aria-hidden="true" width="20" height="18" viewBox="0 0 20 18" fill="none">{widths.map((w,i)=><rect key={i} x={positions[i]} y={i*4+1} width={w} height="2" rx="1" fill="currentColor"/>)}</svg>}

function TextToolbar({editorRef,selectionRef,onChange}:{editorRef:React.RefObject<HTMLDivElement|null>;selectionRef:React.MutableRefObject<SavedSelection|null>;onChange:()=>void}){
  const restore=()=>{const saved=selectionRef.current,editor=editorRef.current;if(!saved||!editor||saved.editor!==editor)return false;editor.focus();const s=window.getSelection();if(!s)return false;s.removeAllRanges();s.addRange(saved.range);return true};
  const save=()=>{const editor=editorRef.current,s=window.getSelection();if(editor&&s&&s.rangeCount&&editor.contains(s.anchorNode))selectionRef.current={range:s.getRangeAt(0).cloneRange(),editor}};
  const run=(command:string,value?:string)=>{if(!restore())return;document.execCommand(command,false,value);save();onChange()};
  const setSize=(option:(typeof SIZE_OPTIONS)[number])=>{if(!restore())return;const editor=editorRef.current,selection=window.getSelection();if(!editor||!selection||!selection.rangeCount)return;let node:Node|null=selection.anchorNode;if(node?.nodeType===Node.TEXT_NODE)node=node.parentElement;const current=(node as Element|null)?.closest("h1,h2,h3,p,div") as HTMLElement|null;if(!current||!editor.contains(current))return;const replacement=document.createElement(option.tag);replacement.className=option.className;while(current.firstChild)replacement.appendChild(current.firstChild);current.replaceWith(replacement);const range=document.createRange();range.selectNodeContents(replacement);range.collapse(false);selection.removeAllRanges();selection.addRange(range);save();onChange()};
  const align=[['justifyLeft','left','Align left'],['justifyCenter','center','Align center'],['justifyRight','right','Align right'],['justifyFull','justify','Justify']] as const;
  return <div className="relative z-20 flex flex-wrap items-center gap-0.5 border-b border-[#d9d3ca] bg-[#f7f4ef] px-2 py-1.5 shadow-sm" onMouseDown={e=>e.stopPropagation()}><select aria-label="Text size" title="Text size" defaultValue="paragraph-2" onChange={e=>{const o=SIZE_OPTIONS.find(x=>x.value===e.target.value);if(o)setSize(o)}} className="h-8 w-[140px] cursor-pointer appearance-auto border border-[#d9d3ca] bg-white px-2 text-xs text-[#403c36] outline-none hover:border-[#aaa49a] focus:border-[#8f887e]">{SIZE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select><span className="mx-1 h-5 w-px bg-[#d9d3ca]"/>{[["bold","B"],["italic","I"],["underline","U"]].map(([cmd,label])=><button key={cmd} type="button" title={cmd} onMouseDown={e=>{e.preventDefault();save()}} onClick={()=>run(cmd)} className={`flex h-8 w-8 items-center justify-center rounded-sm text-sm text-[#403c36] hover:bg-white ${cmd==='bold'?'font-bold':cmd==='italic'?'italic':'underline'}`}>{label}</button>)}<label title="Text color" className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm hover:bg-white" onMouseDown={e=>{e.preventDefault();save()}}><span className="border-b-4 border-[#7d4f45] text-sm font-semibold">A</span><input type="color" defaultValue="#222222" className="absolute inset-0 opacity-0" onChange={e=>run("foreColor",e.target.value)}/></label><span className="mx-1 h-5 w-px bg-[#d9d3ca]"/>{align.map(([cmd,val,title])=><button key={cmd} type="button" title={title} onMouseDown={e=>{e.preventDefault();save()}} onClick={()=>run(cmd)} className="flex h-8 w-8 items-center justify-center rounded-sm text-[#403c36] hover:bg-white"><AlignIcon align={val}/></button>)}<span className="mx-1 h-5 w-px bg-[#d9d3ca]"/><button type="button" title="Remove formatting" onMouseDown={e=>{e.preventDefault();save()}} onClick={()=>run("removeFormat")} className="flex h-8 w-8 items-center justify-center rounded-sm text-sm text-[#403c36] hover:bg-white">T<span className="text-[#77736c]">x</span></button></div>;
}

function TextBlockEditor({block,onChange,onBlur}:{block:StoryBlock;onChange:(patch:Partial<StoryBlock>)=>void;onBlur:()=>void}){const editorRef=useRef<HTMLDivElement|null>(null);const wrapperRef=useRef<HTMLDivElement|null>(null);const selectionRef=useRef<SavedSelection|null>(null);const [editing,setEditing]=useState(false);const content=block.body??block.title??"";const variant=block.variant??block.type;const style=TEXT_STYLES[variant]??"text-base leading-7";useEffect(()=>{if(editorRef.current&&!editing&&editorRef.current.innerHTML!==content)editorRef.current.innerHTML=content},[content,editing]);const saveSelection=()=>{const e=editorRef.current,s=window.getSelection();if(e&&s&&s.rangeCount&&e.contains(s.anchorNode))selectionRef.current={range:s.getRangeAt(0).cloneRange(),editor:e}};const changed=()=>{saveSelection();onChange({body:editorRef.current?.innerHTML??""})};return <div ref={wrapperRef} className="overflow-visible border border-transparent focus-within:border-[#d9d3ca]" onFocusCapture={()=>setEditing(true)} onBlurCapture={e=>{if(!wrapperRef.current?.contains(e.relatedTarget as Node|null)){setEditing(false);onBlur()}}}>{editing&&<TextToolbar editorRef={editorRef} selectionRef={selectionRef} onChange={changed}/>}<div ref={editorRef} contentEditable suppressContentEditableWarning spellCheck className={`min-h-12 whitespace-pre-wrap px-2 py-2 outline-none ${style}`} onFocus={saveSelection} onKeyUp={saveSelection} onMouseUp={saveSelection} onInput={changed}/></div>}

function BlockEditor({storyId,block,blocks,onBlocksChange,onUpdate}:{storyId:string;block:StoryBlock;blocks:StoryBlock[];onBlocksChange:Props["onBlocksChange"];onUpdate:Props["onUpdate"]}){const updateLocal=(patch:Partial<StoryBlock>)=>onBlocksChange(blocks.map(item=>item.id===block.id?{...item,...patch}:item));const variant=block.variant??"";const isText=block.type==="text"||block.type.startsWith("text-");const isTextColumns=isText&&TEXT_COLUMN_VARIANTS.includes(variant as (typeof TEXT_COLUMN_VARIANTS)[number]);const isGrid=block.type==="image"&&variant.startsWith("grid-");const isImageWithText=block.type==="image"&&variant.startsWith("text-");if(isTextColumns)return <TextColumnsEditor block={block} onChange={updateLocal}/>;if(isText)return <TextBlockEditor block={block} onChange={updateLocal} onBlur={()=>onUpdate(block,{body:block.body??undefined,title:block.title??undefined})}/>;if(isGrid)return <GridGalleryEditor storyId={storyId} block={block} onChange={updateLocal}/>;if(isImageWithText)return <ImageWithTextEditor storyId={storyId} block={block} onChange={updateLocal}/>;if(block.type==="image")return <ImageBlockEditor storyId={storyId} block={block} onChange={updateLocal}/>;if(variant==="banner-video")return <VideoBlockEditor block={block} onChange={updateLocal} onSave={patch=>onUpdate(block,patch)}/>;return <div className="border border-dashed border-[#d9d3ca] bg-white p-7 lg:p-9"><p className="text-sm text-[#77736c]">This block type does not have an editor yet.</p></div>}

function DragHandle({onDragStart,onDragEnd}:{onDragStart:()=>void;onDragEnd:()=>void}){return <button type="button" draggable aria-label="Drag to reorder block" title="Drag to reorder" onDragStart={e=>{e.dataTransfer.effectAllowed="move";onDragStart()}} onDragEnd={onDragEnd} className="flex h-7 w-7 cursor-grab items-center justify-center bg-[#f5f2ec] text-[#77736c] hover:bg-white active:cursor-grabbing" onMouseDown={e=>e.stopPropagation()}><svg aria-hidden="true" width="14" height="16" viewBox="0 0 14 16" fill="none"><circle cx="4" cy="3" r="1" fill="currentColor"/><circle cx="10" cy="3" r="1" fill="currentColor"/><circle cx="4" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="8" r="1" fill="currentColor"/><circle cx="4" cy="13" r="1" fill="currentColor"/><circle cx="10" cy="13" r="1" fill="currentColor"/></svg></button>}

function BlockCard({storyId,block,blocks,onBlocksChange,onDelete,onUpdate,draggingId,onDragStart,onDragEnd,onDragOver,onDrop}:{storyId:string;block:StoryBlock;blocks:StoryBlock[];onBlocksChange:Props["onBlocksChange"];onDelete:Props["onDelete"];onUpdate:Props["onUpdate"];draggingId:string|null;onDragStart:(id:string)=>void;onDragEnd:()=>void;onDragOver:(targetId:string,side:"before"|"after")=>void;onDrop:(targetId:string,side:"before"|"after")=>void}){const variant=block.variant??block.type;const layoutNext=nextVariant(variant,block.type);const layoutLabel=switchLabel(variant,block.type);const currentLabel=layoutLabel??LABELS[variant]??variant;return <article className="group relative" onDragOver={e=>{e.preventDefault();const r=e.currentTarget.getBoundingClientRect();onDragOver(block.id,e.clientY<r.top+r.height/2?"before":"after");e.dataTransfer.dropEffect="move"}} onDrop={e=>{e.preventDefault();const r=e.currentTarget.getBoundingClientRect();onDrop(block.id,e.clientY<r.top+r.height/2?"before":"after")}}>{draggingId===block.id&&<div className="pointer-events-none absolute inset-0 z-10 rounded-sm border-2 border-dashed border-[#8f887e] bg-[#8f887e]/5"/>}<BlockEditor storyId={storyId} block={block} blocks={blocks} onBlocksChange={onBlocksChange} onUpdate={onUpdate}/><div className="absolute -top-3 right-0 z-20 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"><DragHandle onDragStart={()=>onDragStart(block.id)} onDragEnd={onDragEnd}/><span className="bg-[#f5f2ec] px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">{currentLabel}</span>{layoutNext&&layoutLabel&&<button type="button" title={`Switch layout · ${layoutLabel}`} aria-label={`Switch layout · ${layoutLabel}`} onClick={()=>onUpdate(block,{variant:layoutNext})} className="bg-[#f5f2ec] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-[#625e57] hover:bg-white">↻ {layoutLabel}</button>}<button type="button" onClick={()=>onDelete(block.id)} className="bg-[#f5f2ec] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-[#8a857d] hover:text-red-700">Delete</button></div></article>}

export default function StoryContent({storyId,blocks,onBlocksChange,onDelete,onUpdate}:Props){const [draggingId,setDraggingId]=useState<string|null>(null);const [dropPosition,setDropPosition]=useState<DropPosition|null>(null);const reorder=(targetId:string,side:"before"|"after")=>{if(!draggingId||draggingId===targetId)return;const current=blocks.findIndex(b=>b.id===draggingId);const target=blocks.findIndex(b=>b.id===targetId);if(current<0||target<0)return;const next=blocks.filter(b=>b.id!==draggingId);let index=next.findIndex(b=>b.id===targetId);if(side==="after")index+=1;next.splice(Math.max(0,index),0,blocks[current]);onBlocksChange(next);setDraggingId(null);setDropPosition(null);fetch(`/api/admin/stories/${storyId}/blocks`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({blocks:next.map((b,i)=>({id:b.id,sort_order:i}))})}).catch(()=>{});};return <div className="space-y-1">{blocks.map(block=><div key={block.id}><BlockCard storyId={storyId} block={block} blocks={blocks} onBlocksChange={onBlocksChange} onDelete={onDelete} onUpdate={onUpdate} draggingId={draggingId} onDragStart={setDraggingId} onDragEnd={()=>{setDraggingId(null);setDropPosition(null)}} onDragOver={(targetId,side)=>setDropPosition({targetId,side})} onDrop={reorder}/><AddBlockTrigger storyId={storyId} afterBlockId={block.id}/>{dropPosition?.targetId===block.id&&<div className="h-1 bg-[#171717]"/>}</div>)}{blocks.length===0&&<AddBlockTrigger storyId={storyId}/>}</div>}
