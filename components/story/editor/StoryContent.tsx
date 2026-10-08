"use client";

import { useEffect, useRef, useState } from "react";
import AddBlockTrigger from "../AddBlockTrigger";
import TextColumnsEditor from "./TextColumnsEditor";
import ImageBlockEditor from "../blocks/image/ImageBlockEditor";
import ImageWithTextEditor from "../blocks/image/ImageWithTextEditor";
import GridGalleryEditor from "../blocks/gallery/GridGalleryEditor";
import VideoBlockEditor from "../blocks/video/VideoBlockEditor";
import ContentBlockEditor from "../blocks/content/ContentBlockEditor";
import BlockPreview from "./BlockPreview";
import MediaPickerModal from "../blocks/image/MediaPickerModal";
import { useAdminEditorActions } from "../../../app/admin/components/AdminEditorContext";
import type { AdminBlockEditorController } from "../../../app/admin/components/AdminEditorContext";
import { mediaUrl } from "../../../lib/media";
import type { StoryBlock } from "./types";

type Props={storyId:string;blocks:StoryBlock[];onBlocksChange:(blocks:StoryBlock[])=>void;onDelete:(blockId:string)=>void;onUpdate:(block:StoryBlock,patch:Partial<StoryBlock>)=>void;onAddBlock?:(afterBlockId?:string)=>void};
type DropPosition={targetId:string;side:"before"|"after"};
type SavedSelection={range:Range;editor:HTMLDivElement};
type TextAlign="left"|"center"|"right"|"justify";
type TextLine={content:string;textSize:string;align?:TextAlign};

const TEXT_STYLES:Record<string,string>={"banner-heading":"text-6xl font-serif leading-[1.05]","banner-subtitle":"text-lg leading-7","heading-1":"text-5xl font-serif leading-[1.08]","heading-2":"text-4xl font-serif leading-[1.12]","heading-3":"text-3xl font-serif leading-[1.16]","heading-4":"text-2xl font-serif leading-[1.2]","heading-5":"text-xl font-serif leading-[1.25]","heading-6":"text-lg font-serif leading-[1.3]",wide:"text-xl leading-8",regular:"text-base leading-7",narrow:"text-sm leading-6","text-h1":"text-5xl font-serif leading-[1.08]","text-h2":"text-4xl font-serif leading-[1.12]","text-h3":"text-3xl font-serif leading-[1.16]","text-wide":"text-xl leading-8","text-regular":"text-base leading-7","text-narrow":"text-sm leading-6","paragraph-1":"text-xl leading-8","paragraph-2":"text-base leading-7","paragraph-3":"text-sm leading-6"};
const LABELS:Record<string,string>={"heading-1":"Heading 1","heading-2":"Heading 2","heading-3":"Heading 3",wide:"Wide Text",regular:"Regular Text",narrow:"Narrow Text","text-h1":"Heading 1","text-h2":"Heading 2","text-h3":"Heading 3","text-wide":"Wide Text","text-regular":"Regular Text","text-narrow":"Narrow Text","columns-1":"Columns 1","columns-2":"Columns 2","columns-3":"Columns 3","columns-4":"Columns 4",large:"Large Image",medium:"Medium Image","full-width":"Full Width Image","grid-vertical":"Vertical Grid","grid-horizontal":"Horizontal Grid","grid-square":"Square Grid","grid-stacked":"Stacked Grid",slideshow:"Slideshow",carousel:"Carousel","text-overlay-large":"Image with Text · Large","text-overlay-medium":"Image with Text · Medium","text-overlay-full":"Small Image with Text · Full","text-columns-2":"Image with Text · Columns 2","text-columns-3":"Image with Text · Columns 3","text-columns-4":"Image with Text · Columns 4","text-below-large":"Image with Text · Below Large","text-below-medium":"Small Image with Text · Below Medium","text-left-regular":"Image with Text · Left Regular","text-right-regular":"Image with Text · Right Regular","text-left-large":"Large Image with Text · Left","text-right-large":"Large Image with Text · Right","banner-video":"YouTube Video","banner-1":"Banner 1","banner-2":"Banner 2","banner-3":"Banner 3","info-1":"Info 1","info-2":"Info 2","info-3":"Info 3","testimonial-1":"Testimonial 1","testimonial-2":"Testimonial 2","testimonial-3":"Testimonial 3","pricing-1":"Pricing 1","pricing-2":"Pricing 2","pricing-3":"Pricing 3","faq-1":"FAQ 1","faq-2":"FAQ 2","faq-3":"FAQ 3","quote-1":"Quote 1","quote-2":"Quote 2","quote-3":"Quote 3"};
const IMAGE_SINGLE_VARIANTS=["medium","large","full-width"] as const;
const IMAGE_COLUMN_VARIANTS=["columns-2","columns-3","columns-4"] as const;
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
    if(variant==="heading")return "paragraph";
    if(variant==="paragraph")return "columns";
    if(variant==="columns")return "heading";
    const headingIndex=HEADING_VARIANTS.indexOf(variant as (typeof HEADING_VARIANTS)[number]);
    if(headingIndex>=0)return HEADING_VARIANTS[(headingIndex%3+1)%3];
    const widthIndex=TEXT_WIDTH_VARIANTS.indexOf(variant as (typeof TEXT_WIDTH_VARIANTS)[number]);
    if(widthIndex>=0)return ["wide","regular","narrow"][(widthIndex%3+1)%3];
    const columnIndex=TEXT_COLUMN_VARIANTS.indexOf(variant as (typeof TEXT_COLUMN_VARIANTS)[number]);
    if(columnIndex>=0){const canonical=columnIndex<3?columnIndex:columnIndex-3+1;return ["columns-1","columns-2","columns-3"][(canonical+1)%3];}
  }
  if(blockType==="content"){
    const variants=["banner-1","banner-2","banner-3","info-1","info-2","info-3","testimonial-1","testimonial-2","testimonial-3","pricing-1","pricing-2","pricing-3","faq-1","faq-2","faq-3","quote-1","quote-2","quote-3","banner-video"];
    const index=variants.indexOf(variant);
    if(index>=0)return variants[(index+1)%variants.length];
  }
  return null;
}

function imageSwitchGroup(variant:string){
  const groups=[
    IMAGE_SINGLE_VARIANTS,
    IMAGE_COLUMN_VARIANTS,
    GRID_VARIANTS,
    SLIDER_VARIANTS,
    IMAGE_TEXT_OVERLAY_VARIANTS,
    IMAGE_TEXT_COLUMN_VARIANTS,
    IMAGE_TEXT_BELOW_VARIANTS,
    IMAGE_TEXT_SIDE_REGULAR_VARIANTS,
    IMAGE_TEXT_SIDE_LARGE_VARIANTS,
  ] as const;
  for(const group of groups){
    const index=(group as readonly string[]).indexOf(variant);
    if(index>=0)return {group,next:group[(index+1)%group.length]};
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
  if(blockType==="content")return LABELS[variant]??"Content";
  if(blockType==="text"||blockType.startsWith("text-")){
    if(variant==="heading")return "Heading";
    if(variant==="paragraph")return "Text";
    if(variant==="columns")return "Columns";
    if(variant.startsWith("heading-")||variant.startsWith("text-h"))return LABELS[variant]??"Heading";
    if(variant.startsWith("text-columns-"))return `Columns ${variant.replace("text-columns-","")}`;
    if(variant.startsWith("columns-"))return `Columns ${variant.replace("columns-","")}`;
    if(["wide","regular","narrow","text-wide","text-regular","text-narrow"].includes(variant))return LABELS[variant]??"Text";
  }
  return null;
}

const SIZE_OPTIONS=[
  {value:"banner-heading",label:"Banner Heading",tag:"h1",className:"text-6xl font-serif leading-[1.05]"},
  {value:"banner-subtitle",label:"Banner subtitle",tag:"p",className:"text-lg leading-7"},
  {value:"heading-1",label:"Heading 1",tag:"h1",className:"text-5xl font-serif leading-[1.08]"},
  {value:"heading-2",label:"Heading 2",tag:"h2",className:"text-4xl font-serif leading-[1.12]"},
  {value:"heading-3",label:"Heading 3",tag:"h3",className:"text-3xl font-serif leading-[1.16]"},
  {value:"heading-4",label:"Heading 4",tag:"h4",className:"text-2xl font-serif leading-[1.2]"},
  {value:"heading-5",label:"Heading 5",tag:"h5",className:"text-xl font-serif leading-[1.25]"},
  {value:"heading-6",label:"Heading 6",tag:"h6",className:"text-lg font-serif leading-[1.3]"},
  {value:"paragraph-1",label:"Paragraph 1",tag:"p",className:"text-xl leading-8"},
  {value:"paragraph-2",label:"Paragraph 2",tag:"p",className:"text-base leading-7"},
  {value:"paragraph-3",label:"Paragraph 3",tag:"p",className:"text-sm leading-6"},
] as const;

function AlignIcon({align}:{align:"left"|"center"|"right"|"justify"}){const widths=align==="left"?[18,14,18,11]:align==="center"?[14,18,14,16]:align==="right"?[18,14,18,11]:[18,18,18,18];const positions=align==="right"?[0,4,0,7]:align==="center"?[2,0,2,1]:[0,0,0,0];return <svg aria-hidden="true" width="20" height="18" viewBox="0 0 20 18" fill="none">{widths.map((w,i)=><rect key={i} x={positions[i]} y={i*4+1} width={w} height="2" rx="1" fill="currentColor"/>)}</svg>}

function TextToolbar({editorRef,selectionRef,currentSize,onSizeChange,onAlignChange}:{editorRef:React.RefObject<HTMLDivElement|null>;selectionRef:React.MutableRefObject<SavedSelection|null>;currentSize:string;onSizeChange:(size:string)=>void;onAlignChange:(align:TextAlign)=>void}){
  const save=()=>{
    const editor=editorRef.current;
    const selection=window.getSelection();
    if(editor&&selection&&selection.rangeCount&&editor.contains(selection.anchorNode)){
      selectionRef.current={range:selection.getRangeAt(0).cloneRange(),editor};
    }
  };
  const restore=()=>{
    const saved=selectionRef.current;
    const editor=editorRef.current;
    if(!saved||!editor||saved.editor!==editor)return false;
    editor.focus();
    const selection=window.getSelection();
    if(!selection)return false;
    selection.removeAllRanges();
    selection.addRange(saved.range);
    return true;
  };
  const run=(command:string,value?:string)=>{
    if(!restore())return;
    document.execCommand(command,false,value);
    save();
  };
  const toolbar=<div data-rich-text-toolbar className="absolute right-16 top-[-44px] z-[1000] flex flex-wrap items-center gap-0.5 border border-[#d9d3ca] bg-[#f7f4ef] px-2 py-1.5 shadow-sm" onMouseDown={e=>e.preventDefault()}>
    <select aria-label="Text size" title="Text size" value={currentSize} onMouseDown={e=>{save();e.stopPropagation()}} onChange={e=>onSizeChange(e.target.value)} className="h-8 w-[140px] cursor-pointer appearance-auto border border-[#d9d3ca] bg-white px-2 text-xs text-[#403c36] outline-none">
      {SIZE_OPTIONS.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]"/>
    {([["bold","B"],["italic","I"],["underline","U"]] as const).map(([command,label])=><button key={command} type="button" title={command} onClick={()=>run(command)} className={`flex h-8 w-8 items-center justify-center rounded-sm text-sm text-[#403c36] hover:bg-white ${command==="bold"?"font-bold":command==="italic"?"italic":"underline"}`}>{label}</button>)}
    <label title="Text color" className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm hover:bg-white" onMouseDown={e=>{e.preventDefault();save()}}>
      <span className="border-b-4 border-[#7d4f45] text-sm font-semibold">A</span>
      <input type="color" defaultValue="#222222" className="absolute inset-0 opacity-0" onChange={e=>run("foreColor",e.target.value)}/>
    </label>
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]"/>
    {([["left","Align left"],["center","Align center"],["right","Align right"],["justify","Justify"]] as const).map(([align,title])=><button key={align} type="button" title={title} onClick={()=>onAlignChange(align)} className="flex h-8 w-8 items-center justify-center rounded-sm text-xs text-[#403c36] hover:bg-white"><AlignIcon align={align}/></button>)}
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]"/>
    <button type="button" title="Remove formatting" onClick={()=>run("removeFormat")} className="flex h-8 w-8 items-center justify-center rounded-sm text-sm text-[#403c36] hover:bg-white">T<span className="text-[#77736c]">x</span></button>
  </div>;
  return toolbar;
}

function TextBlockEditor({block,onChange,onCommit}:{block:StoryBlock;onChange:(patch:Partial<StoryBlock>)=>void;onCommit:(patch:Partial<StoryBlock>)=>void}){
  const rawVariant=block.variant??"paragraph";
  const variant=rawVariant.startsWith("heading-")||rawVariant.startsWith("text-h")?"heading":rawVariant.startsWith("text-")?"paragraph":rawVariant.startsWith("columns-")?"columns":rawVariant;
  const layout=typeof block.data?.layout==="string"?block.data.layout:(rawVariant==="heading"?"heading-1":rawVariant==="columns"?"columns-2":"regular");
  const isColumns=variant==="columns";
  const defaultSize=typeof block.data?.textSize==="string"&&TEXT_STYLES[block.data.textSize]?block.data.textSize:(layout.startsWith("heading-")?layout:layout==="wide"?"paragraph-1":layout==="narrow"?"paragraph-3":"paragraph-2");
  const defaultAlign:TextAlign=layout.startsWith("heading-")?"center":"left";
  const editorRef=useRef<HTMLDivElement|null>(null);
  const wrapperRef=useRef<HTMLDivElement|null>(null);
  const selectionRef=useRef<SavedSelection|null>(null);
  const [editing,setEditing]=useState(false);
  const [currentSize,setCurrentSize]=useState(defaultSize);

  const escape=(value:string)=>{const el=document.createElement("div");el.textContent=value;return el.innerHTML;};
  const buildHtml=()=>{
    const lines=Array.isArray(block.data?.lines)?block.data.lines as unknown[]:[];
    if(lines.length){
      return lines.map(item=>{
        const v=item as {content?:unknown;textSize?:unknown;align?:unknown};
        const content=typeof v.content==="string"?v.content:"";
        const size=typeof v.textSize==="string"&&TEXT_STYLES[v.textSize]?v.textSize:defaultSize;
        const align=typeof v.align==="string"&&["left","center","right","justify"].includes(v.align)?v.align:defaultAlign;
        return `<div data-text-line="true" data-text-size="${escape(size)}" style="text-align:${align}" class="${TEXT_STYLES[size]??TEXT_STYLES[defaultSize]} w-full outline-none whitespace-pre-wrap">${content||"<br>"}</div>`;
      }).join("");
    }
    const body=typeof block.body==="string"?block.body:(typeof block.title==="string"?block.title:"");
    if(body){
      const holder=document.createElement("div");holder.innerHTML=body;
      const nodes=Array.from(holder.childNodes);
      const html=nodes.length>1?nodes.map(node=>node.nodeType===1?(node as HTMLElement).outerHTML:escape(node.textContent??"")).join(""):body;
      return html.split(/<br\s*\/?>/i).map((part,index)=>`<div data-text-line="true" data-text-size="${escape(defaultSize)}" style="text-align:${defaultAlign}" class="${TEXT_STYLES[defaultSize]} w-full outline-none whitespace-pre-wrap">${part||"<br>"}</div>`).join("");
    }
    return `<div data-text-line="true" data-text-size="${escape(defaultSize)}" style="text-align:${defaultAlign}" class="${TEXT_STYLES[defaultSize]} w-full outline-none whitespace-pre-wrap"><br></div>`;
  };

  const normalizeLines=()=>{
    const editor=editorRef.current;if(!editor)return;
    Array.from(editor.children).forEach((rawNode)=>{
      if(!(rawNode instanceof HTMLElement))return;
      let node:HTMLElement=rawNode;
      if(!(node instanceof HTMLElement))return;
      if(node.tagName!=="DIV")return;
      const existingSize=node.getAttribute("data-text-size");
      const size=existingSize&&TEXT_STYLES[existingSize]?existingSize:defaultSize;
      const align=(node.style.textAlign as TextAlign)||defaultAlign;
      if(node.tagName!=="DIV"){
        const p=document.createElement("div");
        p.innerHTML=node.innerHTML||"<br>";
        Array.from(node.attributes).forEach(attr=>{if(attr.name!=="class"&&attr.name!=="style")p.setAttribute(attr.name,attr.value);});
        node.replaceWith(p);
        node=p;
      }
      node.setAttribute("data-text-line","true");
      node.setAttribute("data-text-size",size);
      node.style.textAlign=align;
      node.className=`w-full outline-none whitespace-pre-wrap ${TEXT_STYLES[size]??TEXT_STYLES[defaultSize]}`;
    });
  };
  const getLines=()=>{
    const editor=editorRef.current;if(!editor)return [];
    normalizeLines();
    return Array.from(editor.children).filter((n):n is HTMLElement=>n instanceof HTMLElement).map(el=>{
      const size=el.getAttribute("data-text-size")&&TEXT_STYLES[el.getAttribute("data-text-size")!]?el.getAttribute("data-text-size")!:defaultSize;
      const align=(el.style.textAlign as TextAlign)||defaultAlign;
      return {content:el.innerHTML==="<br>"?"":el.innerHTML,textSize:size,align};
    });
  };
  const commit=()=>{
    const editor=editorRef.current;if(!editor)return;
    const lines=getLines();
    const body=lines.map(l=>l.content).join("<br />");
    const patch:Partial<StoryBlock>={body,data:{...(block.data??{}),variant,layout,lines,textSize:lines[0]?.textSize??defaultSize}};
    onChange(patch);
    onCommit(patch);
  };
  const saveSelection=()=>{
    const sel=window.getSelection();
    const editor=editorRef.current;
    if(sel&&sel.rangeCount&&editor&&editor.contains(sel.anchorNode)){
      selectionRef.current={range:sel.getRangeAt(0).cloneRange(),editor};
      const node=sel.getRangeAt(0).startContainer.parentElement;
      const line=node?.closest("[data-text-line]") as HTMLElement|null;
      const size=line?.getAttribute("data-text-size");
      if(size&&TEXT_STYLES[size])setCurrentSize(size);
    }
  };
  const restoreSelection=()=>{
    const saved=selectionRef.current;const editor=editorRef.current;if(!saved||!editor||saved.editor!==editor)return false;
    const sel=window.getSelection();if(!sel)return false;
    editor.focus();sel.removeAllRanges();sel.addRange(saved.range);return true;
  };
  const selectedLines=()=>{
    const editor=editorRef.current;const sel=window.getSelection();
    if(!editor||!sel||!sel.rangeCount)return [] as HTMLElement[];
    const range=sel.getRangeAt(0);
    return Array.from(editor.children).filter((n):n is HTMLElement=>n instanceof HTMLElement).filter(el=>{
      try{return range.intersectsNode(el)}catch{return false;}
    });
  };
  const applySize=(size:string)=>{
    const option=SIZE_OPTIONS.find(o=>o.value===size);if(!option||!restoreSelection())return;
    const lines=selectedLines();if(!lines.length)return;
    lines.forEach(line=>{line.className=`w-full outline-none whitespace-pre-wrap ${option.className}`;line.setAttribute("data-text-size",size);});
    setCurrentSize(size);saveSelection();
  };
  const applyAlign=(align:TextAlign)=>{
    if(!restoreSelection())return;
    const lines=selectedLines();if(!lines.length)return;
    lines.forEach(line=>line.style.textAlign=align);saveSelection();
  };

  useEffect(()=>{
    if(isColumns)return;
    const editor=editorRef.current;if(!editor)return;
    editor.innerHTML=buildHtml();
    const first=editor.querySelector("[data-text-line]") as HTMLElement|null;
    setCurrentSize(first?.getAttribute("data-text-size")??defaultSize);
  },[block.id]);

  useEffect(()=>{
    if(!editing)return;
    const close=(event:MouseEvent)=>{
      const target=event.target as Element|null;
      if(wrapperRef.current?.contains(target)||target?.closest("[data-rich-text-toolbar]"))return;
      commit();
      setEditing(false);selectionRef.current=null;
    };
    document.addEventListener("mousedown",close);
    return()=>document.removeEventListener("mousedown",close);
  },[editing]);

  useEffect(()=>{
    if(!editing)return;
    const editor=editorRef.current;
    if(!editor)return;
    const handleBlur=()=>commit();
    editor.addEventListener("blur",handleBlur);
    return()=>editor.removeEventListener("blur",handleBlur);
  },[editing]);

  if(isColumns)return <div className="grid gap-4"><TextColumnsEditor block={{...block,variant:"columns",data:{...(block.data??{}),variant:"columns",layout}}} onChange={onChange}/></div>;

  const textWidthClass =
    layout === "heading-1" || layout === "heading-2" || layout === "heading-3" ? "w-full" :
    layout === "wide" ? "w-full" :
    layout === "narrow" ? "w-full md:w-1/2" :
    "w-full md:w-[70%]";

  return <section className="px-6 py-6 md:px-10 md:py-8" onMouseDown={e=>e.stopPropagation()}>
    <div ref={wrapperRef} className={`relative mx-auto ${textWidthClass}`}>
      {editing && <TextToolbar editorRef={editorRef} selectionRef={selectionRef} currentSize={currentSize} onSizeChange={applySize} onAlignChange={applyAlign}/>}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        className="w-full min-h-12 cursor-text outline-none text-[#77736c]"
        onClick={()=>{setEditing(true);requestAnimationFrame(saveSelection);}}
        onFocus={()=>{setEditing(true);requestAnimationFrame(saveSelection);}}
        onMouseUp={saveSelection}
        onKeyUp={()=>{saveSelection();const sel=window.getSelection();if(sel?.rangeCount){const node=sel.getRangeAt(0).startContainer.parentElement;const line=node?.closest("[data-text-line]") as HTMLElement|null;if(line?.getAttribute("data-text-size"))setCurrentSize(line.getAttribute("data-text-size")!);}}}
        onInput={()=>{saveSelection();requestAnimationFrame(()=>{normalizeLines();saveSelection();});}}
      />
    </div>
  </section>;
}
function ContactBlockEditor({block,onChange}:{block:StoryBlock;onChange:(patch:Partial<StoryBlock>)=>void}){
  const data=block.data??{};
  const [pickerOpen,setPickerOpen]=useState(false);
  const headingRef=useRef<HTMLHeadingElement|null>(null);
  const paragraphRef=useRef<HTMLParagraphElement|null>(null);
  const selectedIds=Array.isArray(data.media_ids)?data.media_ids.filter((id):id is string=>typeof id==="string"):[];
  const selected=block.media[0];
  const variant=block.variant??"form-1";
  const imageLayout=variant==="form-with-image-left"||variant==="form-with-image-right";
  const textLayout=variant==="form-with-text-left"||variant==="form-with-text-right";
  const leftSide=variant==="form-with-text-left"||variant==="form-with-image-left";
  const storedHeading=typeof data.title==="string"?data.title:"";
  const storedParagraph=typeof data.body==="string"?data.body:"";
  const heading=storedHeading||"Enter a Heading";
  const paragraph=storedParagraph||"This is a paragraph. Click and enter your own text. You can make changes like making the text bold, underline or italic.";

  useEffect(()=>{
    if(headingRef.current&&document.activeElement!==headingRef.current){
      headingRef.current.textContent=heading;
    }
  },[heading]);

  useEffect(()=>{
    if(paragraphRef.current&&document.activeElement!==paragraphRef.current){
      paragraphRef.current.textContent=paragraph;
    }
  },[paragraph]);

  const commitText=(key:"title"|"body",element:HTMLElement|null)=>{
    if(!element)return;
    const value=element.textContent??"";
    const previous=key==="title"?storedHeading:storedParagraph;
    if(value!==previous){
      onChange({
        data:{...data,[key]:value},
        ...(key==="title"?{title:value}:{}),
        ...(key==="body"?{body:value}:{}),
      });
    }
  };

  const fields=<form className="scene-admin-contact-fields" onSubmit={e=>e.preventDefault()}><label><span>Your name *</span><input aria-label="Name" required /></label><label><span>WhatsApp *</span><input aria-label="WhatsApp" required /></label><label><span>Wedding date *</span><input type="date" aria-label="Date" required /></label><label><span>Email address *</span><input type="email" aria-label="Email address" required /></label><label><span>I’m interested in *</span><select aria-label="Interest" defaultValue="" required><option value="">Select an option</option><option>Destination wedding</option><option>Intimate wedding</option><option>Couple session</option><option>Elopement</option><option>Not sure yet</option></select></label><fieldset className="scene-admin-contact-product"><legend className="sr-only">Product</legend><label><input type="checkbox" name="product" value="Photography" /> <span>Photography</span></label><label><input type="checkbox" name="product" value="Film" /> <span>Film</span></label></fieldset><label><span>Message *</span><textarea aria-label="Message" rows={5} required /></label><button type="button">Send Message</button></form>;

  const copy=<div className="scene-admin-contact-copy">
    <h3
      ref={headingRef}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onFocus={e=>{
        if(!storedHeading&&e.currentTarget.textContent===heading){
          const selection=window.getSelection();
          const range=document.createRange();
          range.selectNodeContents(e.currentTarget);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }}
      onBlur={e=>commitText("title",e.currentTarget)}
    />
    <p
      ref={paragraphRef}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onFocus={e=>{
        if(!storedParagraph&&e.currentTarget.textContent===paragraph){
          const selection=window.getSelection();
          const range=document.createRange();
          range.selectNodeContents(e.currentTarget);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }}
      onBlur={e=>commitText("body",e.currentTarget)}
    />
  </div>;

  const imageUrl=selected?mediaUrl(selected.path):(typeof data.image_url==="string"?data.image_url:"");
  const media=imageUrl?<img src={imageUrl} alt={selected?.alt||selected?.filename||"Contact block sample"} />:<div className="scene-admin-contact-image-placeholder">Choose an image</div>;

  return <div className="scene-admin-contact-wrap">
    <div className="mb-3 flex items-center justify-between gap-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Contact Form · {variant}</p>
      {imageLayout&&<button type="button" onClick={()=>setPickerOpen(true)} className="border border-[#d8d3ca] bg-white px-3 py-2 text-[9px] uppercase tracking-[0.12em] hover:border-[#171717]">{selected?"Change image":"Choose image"}</button>}
    </div>
    <div className={`scene-admin-contact-preview scene-admin-contact-preview--${variant}`}>
      {imageLayout?<><div className={leftSide?"scene-admin-contact-media":"scene-admin-contact-form"}>{leftSide&&<div className="scene-admin-contact-image">{media}</div>}{!leftSide&&fields}</div><div className={leftSide?"scene-admin-contact-form":"scene-admin-contact-media"}>{leftSide?fields:<div className="scene-admin-contact-image">{media}</div>}</div></>:textLayout?<><div className={leftSide?"scene-admin-contact-copy-col":"scene-admin-contact-form"}>{leftSide?copy:fields}</div><div className={leftSide?"scene-admin-contact-form":"scene-admin-contact-copy-col"}>{leftSide?fields:copy}</div></>:<div className={variant==="form-3"?"scene-admin-contact-card":"scene-admin-contact-single"}>{fields}</div>}
    </div>
    {imageLayout&&<p className="mt-3 text-[9px] uppercase tracking-[0.12em] text-[#8a857d]">Image is editable from Media Library.</p>}
    {imageLayout&&<MediaPickerModal open={pickerOpen} required={1} selectedIds={selectedIds.slice(0,1)} collectionId="" onClose={()=>setPickerOpen(false)} onDone={(_collectionId,ids,media)=>{onChange({data:{...data,media_ids:ids.slice(0,1),image_url:""},media:media as unknown as StoryBlock["media"]});setPickerOpen(false)}}/>}
  </div>
}function MapBlockEditor({block,onChange}:{block:StoryBlock;onChange:(patch:Partial<StoryBlock>)=>void}){const data=block.data??{};const update=(key:string,value:string)=>onChange({data:{...data,[key]:value}});return <div className="grid gap-4 border border-[#d9d3ca] bg-[#fbfaf7] p-6"><p className="text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Map · {block.variant||"map-1-regular"}</p><input className="w-full border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Address" value={typeof data.address==="string"?data.address:""} onChange={e=>update("address",e.target.value)}/><input className="w-full border border-[#d8d3ca] bg-white p-3 text-sm" placeholder="Google Maps embed URL" value={typeof data.embed_url==="string"?data.embed_url:""} onChange={e=>update("embed_url",e.target.value)}/><div className="flex min-h-32 items-center justify-center bg-[#e8e4dc] text-xs uppercase tracking-[0.12em] text-[#8a857d]">{typeof data.address==="string"&&data.address?data.address:"Map preview"}</div></div>}
export function BlockEditor({storyId,block,blocks,onBlocksChange,onUpdate}:{storyId:string;block:StoryBlock;blocks:StoryBlock[];onBlocksChange:Props["onBlocksChange"];onUpdate:Props["onUpdate"]}){const updateLocal=(patch:Partial<StoryBlock>)=>onBlocksChange(blocks.map(item=>item.id===block.id?{...item,...patch}:item));const variant=block.variant??"";const isText=block.type==="text"||block.type.startsWith("text-");const isTextColumns=isText&&TEXT_COLUMN_VARIANTS.includes(variant as (typeof TEXT_COLUMN_VARIANTS)[number]);const isGrid=block.type==="image"&&variant.startsWith("grid-");const isImageWithText=block.type==="image"&&variant.startsWith("text-");if(isTextColumns)return <TextColumnsEditor block={block} onChange={updateLocal}/>;if(isText)return <TextBlockEditor block={block} onChange={updateLocal} onCommit={patch=>onUpdate(block,patch)}/>;if(isGrid)return <GridGalleryEditor storyId={storyId} block={block} onChange={updateLocal}/>;if(isImageWithText)return <ImageWithTextEditor storyId={storyId} block={block} onChange={updateLocal}/>;if(block.type==="image")return <ImageBlockEditor storyId={storyId} block={block} onChange={updateLocal}/>;if(block.type==="contact")return <ContactBlockEditor block={block} onChange={updateLocal}/>;if(block.type==="map")return <MapBlockEditor block={block} onChange={updateLocal}/>;if(block.type==="content"){if(variant==="banner-video")return <VideoBlockEditor block={block} onChange={updateLocal} onSave={patch=>onUpdate(block,patch)}/>;return <ContentBlockEditor block={block} onChange={updateLocal}/>;}return <div className="border border-dashed border-[#d9d3ca] bg-white p-7 lg:p-9"><p className="text-sm text-[#77736c]">This block type does not have an editor yet.</p></div>}

function DragHandle({id,onDragStart,onDragEnd}:{id:string;onDragStart:(id:string)=>void;onDragEnd:()=>void}){return <button type="button" draggable aria-label="Drag to reorder block" title="Drag to reorder" onDragStart={e=>{e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",id);onDragStart(id)}} onDragEnd={onDragEnd} className="flex h-7 w-7 cursor-grab items-center justify-center bg-[#f5f2ec] text-[#77736c] hover:bg-white active:cursor-grabbing" onMouseDown={e=>e.stopPropagation()}><svg aria-hidden="true" width="14" height="16" viewBox="0 0 14 16" fill="none"><circle cx="4" cy="3" r="1" fill="currentColor"/><circle cx="10" cy="3" r="1" fill="currentColor"/><circle cx="4" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="8" r="1" fill="currentColor"/><circle cx="4" cy="13" r="1" fill="currentColor"/><circle cx="10" cy="13" r="1" fill="currentColor"/></svg></button>}

function BlockCard({storyId,block,blocks,onBlocksChange,onDelete,onUpdate,draggingId,onDragStart,onDragEnd,onDragOver,onDrop,selected,onSelect}:{storyId:string;block:StoryBlock;blocks:StoryBlock[];onBlocksChange:Props["onBlocksChange"];onDelete:Props["onDelete"];onUpdate:Props["onUpdate"];draggingId:string|null;onDragStart:(id:string)=>void;onDragEnd:()=>void;onDragOver:(targetId:string,side:"before"|"after")=>void;onDrop:(targetId:string,side:"before"|"after",draggedId?:string)=>void;selected?:boolean;onSelect:(id:string)=>void}){const variant=block.variant??block.type;const isText=block.type==="text"||block.type.startsWith("text-");const storedLayout=typeof block.data?.layout==="string"?block.data.layout:"";const textGroup=variant==="heading"||variant.startsWith("heading-")||variant.startsWith("text-h")?"heading":variant==="columns"||variant.startsWith("columns-")||variant.startsWith("text-columns-")?"columns":variant==="paragraph"||variant==="wide"||variant==="regular"||variant==="narrow"||variant.startsWith("text-wide")||variant.startsWith("text-regular")||variant.startsWith("text-narrow")?"paragraph":null;const textLayout=textGroup==="heading"?(storedLayout.startsWith("heading-")?storedLayout:variant.startsWith("heading-")?variant:"heading-1"):textGroup==="paragraph"?(["wide","regular","narrow"].includes(storedLayout)?storedLayout:variant==="wide"||variant==="regular"||variant==="narrow"?variant:"regular"):textGroup==="columns"?(["columns-2","columns-3","columns-4"].includes(storedLayout)?storedLayout:variant.startsWith("columns-")?variant:"columns-2"):"";const textNext=textGroup==="heading"?["heading-1","heading-2","heading-3"][(["heading-1","heading-2","heading-3"].indexOf(textLayout)+1)%3]:textGroup==="paragraph"?["wide","regular","narrow"][(["wide","regular","narrow"].indexOf(textLayout)+1)%3]:textGroup==="columns"?["columns-2","columns-3","columns-4"][(["columns-2","columns-3","columns-4"].indexOf(textLayout)+1)%3]:null;const imageSwitch=imageSwitchGroup(variant);const layoutNext=isText?textNext:imageSwitch?.next??nextVariant(variant,block.type);const layoutLabel=isText?textLayout:switchLabel(variant,block.type);const currentLabel=isText?(textLayout==="wide"?"Wide":textLayout==="regular"?"Regular":textLayout==="narrow"?"Narrow":textLayout.replace("heading-","Heading ").replace("columns-","Columns ")):layoutLabel??LABELS[variant]??variant;const switchTextLayout=()=>{if(!isText||!textNext)return;const canonicalVariant=textGroup==="heading"?"heading":textGroup==="paragraph"?"paragraph":"columns";if(textGroup==="heading")return;onUpdate(block,{variant:canonicalVariant,data:{...(block.data??{}),variant:canonicalVariant,layout:textNext}})};const switchImageLayout=()=>{if(block.type!=="image"||!imageSwitch)return;const next=imageSwitch.next;onUpdate(block,{variant:next,data:{...(block.data??{}),variant:next}})};return <article data-block-card-id={block.id} className={`group relative cursor-pointer transition ${selected ? "ring-2 ring-[#171717] ring-offset-2" : "hover:ring-1 hover:ring-[#bcb6ad] hover:ring-offset-1"}`} onClick={e=>{const selection=window.getSelection();if(selection&&selection.rangeCount>0&&!selection.isCollapsed&&selection.toString().trim())return;onSelect(block.id)}} onDragOver={e=>{e.preventDefault();const r=e.currentTarget.getBoundingClientRect();onDragOver(block.id,e.clientY<r.top+r.height/2?"before":"after");e.dataTransfer.dropEffect="move"}} onDrop={e=>{e.preventDefault();const r=e.currentTarget.getBoundingClientRect();onDrop(block.id,e.clientY<r.top+r.height/2?"before":"after",e.dataTransfer.getData("text/plain"))}}>{draggingId===block.id&&<div className="pointer-events-none absolute inset-0 z-10 rounded-sm border-2 border-dashed border-[#8f887e] bg-[#8f887e]/5"/>}{selected?<div onClick={e=>e.stopPropagation()} className="relative"><BlockEditor storyId={storyId} block={block} blocks={blocks} onBlocksChange={onBlocksChange} onUpdate={onUpdate}/></div>:<div className="pointer-events-none"><BlockPreview block={block}/></div>}<div className="absolute -top-3 right-0 z-20 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"><div onClick={e=>e.stopPropagation()}><DragHandle id={block.id} onDragStart={onDragStart} onDragEnd={onDragEnd}/></div><span className="bg-[#f5f2ec] px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">{currentLabel}</span>{block.type==="image"&&imageSwitch&&<button type="button" title={`Switch ${currentLabel}`} aria-label={`Switch ${currentLabel}`} onClick={e=>{e.stopPropagation();switchImageLayout()}} className="flex h-7 w-7 items-center justify-center bg-[#f5f2ec] text-[#77736c] hover:bg-white hover:text-[#171717]"><span aria-hidden="true" className="text-sm leading-none">↻</span></button>}{isText&&textGroup!=="heading"&&<button type="button" title={`Switch ${currentLabel}`} aria-label={`Switch ${currentLabel}`} onClick={e=>{e.stopPropagation();switchTextLayout()}} className="flex h-7 w-7 items-center justify-center bg-[#f5f2ec] text-[#77736c] hover:bg-white hover:text-[#171717]"><span aria-hidden="true" className="text-sm leading-none">↻</span></button>}<button type="button" title="Delete block" aria-label={`Delete ${currentLabel}`} onClick={e=>{e.stopPropagation();onDelete(block.id)}} className="flex h-7 w-7 items-center justify-center bg-[#f5f2ec] text-[#9a4d42] hover:bg-white hover:text-red-700"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 4h8M5.25 4V2.75h3.5V4M4.5 5.25v5.5m5-5.5v5.5M3.75 4h6.5l-.45 7.25H4.2L3.75 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div></article>}

export default function StoryContent({storyId,blocks,onBlocksChange,onDelete,onUpdate,onAddBlock}:Props){const {registerEditor}=useAdminEditorActions();const [draggingId,setDraggingId]=useState<string|null>(null);const [dropPosition,setDropPosition]=useState<DropPosition|null>(null);const [selectedBlockId,setSelectedBlockId]=useState<string|null>(null);
useEffect(()=>{if(!selectedBlockId)return;const clearOnOutsideClick=(event:MouseEvent)=>{const target=event.target as Node|null;if(target&&((target as Element).closest?.(`[data-block-card-id="${selectedBlockId}"]`)|| (target as Element).closest?.("[data-rich-text-toolbar]")|| (target as Element).closest?.("[data-admin-block-editor]")|| (target as Element).closest?.("[data-admin-modal]")))return;window.setTimeout(()=>setSelectedBlockId(null),0);};document.addEventListener("mousedown",clearOnOutsideClick);return()=>document.removeEventListener("mousedown",clearOnOutsideClick);},[selectedBlockId]);const selectedBlock=selectedBlockId?blocks.find(block=>block.id===selectedBlockId)??null:null;useEffect(()=>{if(selectedBlockId&&!selectedBlock)setSelectedBlockId(null)},[selectedBlockId,selectedBlock]);const blocksRef=useRef(blocks);const onBlocksChangeRef=useRef(onBlocksChange);const onUpdateRef=useRef(onUpdate);const onDeleteRef=useRef(onDelete);const storyIdRef=useRef(storyId);blocksRef.current=blocks;onBlocksChangeRef.current=onBlocksChange;onUpdateRef.current=onUpdate;onDeleteRef.current=onDelete;storyIdRef.current=storyId;const editorControllerRef=useRef<AdminBlockEditorController | null>(null);useEffect(()=>{if(!selectedBlockId){editorControllerRef.current=null;registerEditor(null);return;}const controller=editorControllerRef.current ?? {selectedBlockId, get blocks(){return blocksRef.current;}, get block(){return blocksRef.current.find(item=>item.id===selectedBlockId) ?? selectedBlock!;}, get storyId(){return storyIdRef.current;}, onBlocksChange:(next:StoryBlock[])=>onBlocksChangeRef.current(next), onUpdate:(block:StoryBlock,patch:Partial<StoryBlock>)=>onUpdateRef.current(block,patch), onDelete:(blockId:string)=>onDeleteRef.current(blockId), onClose:()=>setSelectedBlockId(null)};controller.selectedBlockId=selectedBlockId;editorControllerRef.current=controller;registerEditor(controller);},[selectedBlockId,registerEditor]);useEffect(()=>{if(selectedBlockId&&editorControllerRef.current)registerEditor(editorControllerRef.current);},[blocks,selectedBlockId,registerEditor]);useEffect(()=>()=>registerEditor(null),[registerEditor]);const reorder=(targetId:string,side:"before"|"after",draggedId?:string)=>{const activeId=draggedId||draggingId;if(!activeId||activeId===targetId)return;const current=blocks.findIndex(b=>b.id===activeId);const target=blocks.findIndex(b=>b.id===targetId);if(current<0||target<0)return;const movingBlock=blocks[current];const next=blocks.filter(b=>b.id!==activeId);let index=next.findIndex(b=>b.id===targetId);if(side==="after")index+=1;next.splice(Math.max(0,index),0,movingBlock);onBlocksChange(next);setDraggingId(null);setDropPosition(null);if(storyId){fetch(`/api/admin/stories/${storyId}/blocks`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({blocks:next.map((b,i)=>({id:b.id,sort_order:i}))})}).catch(()=>{});}};const emptyAddBlock=onAddBlock ? <button type="button" onClick={()=>onAddBlock()} className="group relative h-16 w-full" aria-label="Add content block"><span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#bdb7ad] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"/><span className="relative z-10 flex h-8 w-8 mx-auto -translate-y-1/2 items-center justify-center rounded-full border border-[#bdb7ad] bg-[#f7f5f0] text-lg text-[#5f5a52] opacity-100 transition-transform group-hover:scale-105">+</span></button> : <AddBlockTrigger storyId={storyId}/>;const firstAddBlock = onAddBlock ? <button type="button" onClick={()=>onAddBlock("__FIRST__")} className="group relative h-8 w-full" aria-label="Insert block at beginning"><span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#bdb7ad] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"/><span className="absolute left-1/2 top-1/2 z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#bdb7ad] bg-[#f7f5f0] text-sm text-[#5f5a52] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">+</span></button> : <AddBlockTrigger storyId={storyId}/>;return <div className="space-y-1">{onAddBlock && firstAddBlock}{blocks.map(block=><div key={block.id}><BlockCard storyId={storyId} block={block} blocks={blocks} onBlocksChange={onBlocksChange} onDelete={onDelete} onUpdate={onUpdate} draggingId={draggingId} onDragStart={setDraggingId} onDragEnd={()=>{setDraggingId(null);setDropPosition(null)}} onDragOver={(targetId,side)=>setDropPosition({targetId,side})} onDrop={reorder} selected={selectedBlockId===block.id} onSelect={setSelectedBlockId}/>{onAddBlock ? <button type="button" onClick={()=>onAddBlock(block.id)} className="group relative h-8 w-full" aria-label="Insert block"><span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#bdb7ad] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"/><span className="absolute left-1/2 top-1/2 z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#bdb7ad] bg-[#f7f5f0] text-sm text-[#5f5a52] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">+</span></button> : <AddBlockTrigger storyId={storyId} afterBlockId={block.id}/>} {dropPosition?.targetId===block.id&&<div className="h-1 bg-[#171717]"/>}</div>)}{blocks.length===0&&emptyAddBlock}</div>}
