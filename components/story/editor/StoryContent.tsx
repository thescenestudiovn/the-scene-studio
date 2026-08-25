"use client";

import { useEffect, useRef, useState } from "react";
import AddBlockTrigger from "../AddBlockTrigger";
import { mediaUrl } from "@/lib/media";
import type { StoryBlock } from "./types";

type Props = { storyId: string; blocks: StoryBlock[]; onBlocksChange: (blocks: StoryBlock[]) => void; onDelete: (blockId: string) => void; onUpdate: (block: StoryBlock, patch: Partial<StoryBlock>) => void };

const TEXT_LABELS: Record<string, string> = { "heading-1": "Heading 1", "heading-2": "Heading 2", "heading-3": "Heading 3", wide: "Wide Text", regular: "Regular Text", narrow: "Narrow Text", "columns-2": "Text Columns 2", "columns-3": "Text Columns 3", "columns-4": "Text Columns 4", "text-h1": "Heading 1", "text-h2": "Heading 2", "text-h3": "Heading 3", "text-wide": "Wide Text", "text-regular": "Regular Text", "text-narrow": "Narrow Text", "text-columns-2": "Text Columns 2", "text-columns-3": "Text Columns 3", "text-columns-4": "Text Columns 4" };

const TEXT_STYLES: Record<string, string> = {
  "heading-1": "text-5xl font-serif leading-[1.08]", "text-h1": "text-5xl font-serif leading-[1.08]",
  "heading-2": "text-4xl font-serif leading-[1.12]", "text-h2": "text-4xl font-serif leading-[1.12]",
  "heading-3": "text-3xl font-serif leading-[1.16]", "text-h3": "text-3xl font-serif leading-[1.16]",
  wide: "text-xl leading-8", "text-wide": "text-xl leading-8", regular: "text-base leading-7", "text-regular": "text-base leading-7", narrow: "mx-auto max-w-2xl text-base leading-7", "text-narrow": "mx-auto max-w-2xl text-base leading-7",
  "columns-2": "text-base leading-7", "text-columns-2": "text-base leading-7", "columns-3": "text-base leading-7", "text-columns-3": "text-base leading-7", "columns-4": "text-base leading-7", "text-columns-4": "text-base leading-7"
};

const TOOLBAR = [
  ["bold", "B", "Bold"], ["italic", "I", "Italic"], ["underline", "U", "Underline"], ["insertUnorderedList", "•", "Bulleted list"], ["insertOrderedList", "1.", "Numbered list"], ["justifyLeft", "L", "Align left"], ["justifyCenter", "C", "Align center"], ["justifyRight", "R", "Align right"], ["justifyFull", "J", "Justify"],
] as const;

function TextToolbar({ editorRef, onChange }: { editorRef: React.RefObject<HTMLDivElement | null>; onChange: () => void }) {
  const run = (command: string, value?: string) => { editorRef.current?.focus(); document.execCommand(command, false, value); onChange(); };
  return <div className="flex flex-wrap items-center gap-1 border-b border-[#d9d3ca] bg-[#f7f4ef] px-2 py-2">
    <select aria-label="Text size" defaultValue="3" onChange={e => run("fontSize", e.target.value)} className="h-8 border border-[#d9d3ca] bg-white px-2 text-xs outline-none"><option value="2">Small</option><option value="3">Normal</option><option value="4">Large</option><option value="5">XL</option><option value="6">XXL</option><option value="7">Huge</option></select>
    {TOOLBAR.map(([command, label, title]) => <button key={command} type="button" title={title} aria-label={title} onMouseDown={e => e.preventDefault()} onClick={() => run(command)} className="flex h-8 min-w-8 items-center justify-center border border-transparent px-2 text-xs hover:border-[#d9d3ca] hover:bg-white"><span className={command === "bold" ? "font-bold" : command === "italic" ? "italic" : command === "underline" ? "underline" : ""}>{label}</span></button>)}
    <label title="Text color" className="relative flex h-8 min-w-8 cursor-pointer items-center justify-center border border-transparent hover:border-[#d9d3ca] hover:bg-white"><span className="text-xs font-semibold">A</span><input aria-label="Text color" type="color" className="absolute inset-0 cursor-pointer opacity-0" onChange={e => run("foreColor", e.target.value)} /></label>
    <button type="button" title="Remove formatting" onMouseDown={e => e.preventDefault()} onClick={() => run("removeFormat")} className="h-8 border border-transparent px-2 text-xs hover:border-[#d9d3ca] hover:bg-white">Tx</button>
  </div>;
}

function TextBlockEditor({ block, onChange, onBlur }: { block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void; onBlur: () => void }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [editing, setEditing] = useState(false);
  const content = block.body ?? block.title ?? "";
  useEffect(() => { if (editorRef.current && !editing && editorRef.current.innerHTML !== content) editorRef.current.innerHTML = content; }, [content, editing]);
  const changed = () => onChange({ body: editorRef.current?.innerHTML ?? "" });
  const variant = block.variant ?? block.type;
  const style = TEXT_STYLES[variant] ?? "text-base leading-7";
  const isColumns = variant.includes("columns-2") || variant.includes("columns-3") || variant.includes("columns-4");
  const columns = variant.includes("columns-4") ? 4 : variant.includes("columns-3") ? 3 : 2;
  return <div className="overflow-hidden border border-transparent transition-colors focus-within:border-[#d9d3ca]">
    {editing && <TextToolbar editorRef={editorRef} onChange={changed} />}
    <div className={isColumns ? "grid gap-8 " + (columns === 4 ? "md:grid-cols-4" : columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2") : ""}>
      <div ref={editorRef} contentEditable suppressContentEditableWarning spellCheck className={`min-h-12 whitespace-pre-wrap px-2 py-2 outline-none ${style}`} onFocus={() => setEditing(true)} onInput={changed} onBlur={() => { setEditing(false); onBlur(); }} />
    </div>
  </div>;
}

function BlockCard({ block, index, blocks, onBlocksChange, onDelete, onUpdate }: { block: StoryBlock; index: number; blocks: StoryBlock[]; onBlocksChange: Props["onBlocksChange"]; onDelete: Props["onDelete"]; onUpdate: Props["onUpdate"] }) {
  const textLabel = TEXT_LABELS[block.variant ?? block.type];
  const isText = block.type === "text" || block.type.startsWith("text-");
  const updateLocal = (patch: Partial<StoryBlock>) => onBlocksChange(blocks.map(item => item.id === block.id ? { ...item, ...patch } : item));
  return <article className="group relative">
    <div className="absolute -top-3 right-0 z-10 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      <span className="bg-[#f5f2ec] px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">{textLabel ?? block.variant ?? block.type}</span>
      <button type="button" onClick={() => onDelete(block.id)} className="bg-[#f5f2ec] px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-[#9a4c42] hover:text-[#6f2820]">Delete</button>
    </div>
    {isText ? <TextBlockEditor block={block} onChange={updateLocal} onBlur={() => onUpdate(block, { body: block.body, title: block.title })} /> : <div className="border border-[#d9d3ca] bg-white p-7 lg:p-9"><p className="text-sm text-[#77736c]">This block has its own dedicated editor component.</p>{block.media.length > 0 && <div className="mt-5 grid grid-cols-3 gap-3">{block.media.map(media => <div key={media.id} className="aspect-square overflow-hidden bg-[#e7e2da]"><img src={mediaUrl(media.path)} alt={media.alt ?? media.filename} className="h-full w-full object-cover" /></div>)}</div>}</div>}
  </article>;
}

export default function StoryContent({ storyId, blocks, onBlocksChange, onDelete, onUpdate }: Props) {
  const visibleBlocks = blocks.filter(block => block.is_visible !== 0).slice().sort((a, b) => a.sort_order - b.sort_order);
  return <section className="min-w-0"><div className="space-y-1">{visibleBlocks.map((block, index) => <div key={block.id}><BlockCard block={block} index={index} blocks={blocks} onBlocksChange={onBlocksChange} onDelete={onDelete} onUpdate={onUpdate}/><AddBlockTrigger storyId={storyId}/></div>)}{visibleBlocks.length === 0 && <AddBlockTrigger storyId={storyId}/>}</div></section>;
}
