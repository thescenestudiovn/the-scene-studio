"use client";

import { useEffect, useRef, useState } from "react";
import AddBlockTrigger from "../AddBlockTrigger";
import { mediaUrl } from "@/lib/media";
import type { StoryBlock } from "./types";

type Props = { storyId: string; blocks: StoryBlock[]; onBlocksChange: (blocks: StoryBlock[]) => void; onDelete: (blockId: string) => void; onUpdate: (block: StoryBlock, patch: Partial<StoryBlock>) => void };

const TEXT_LABELS: Record<string, string> = { "heading-1": "Heading 1", "heading-2": "Heading 2", "heading-3": "Heading 3", wide: "Wide Text", regular: "Regular Text", narrow: "Narrow Text", "columns-2": "Text Columns 2", "columns-3": "Text Columns 3", "columns-4": "Text Columns 4", "text-h1": "Heading 1", "text-h2": "Heading 2", "text-h3": "Heading 3", "text-wide": "Wide Text", "text-regular": "Regular Text", "text-narrow": "Narrow Text", "text-columns-2": "Text Columns 2", "text-columns-3": "Text Columns 3", "text-columns-4": "Text Columns 4" };
const TEXT_STYLES: Record<string, string> = { "heading-1": "text-5xl font-serif leading-[1.08]", "text-h1": "text-5xl font-serif leading-[1.08]", "heading-2": "text-4xl font-serif leading-[1.12]", "text-h2": "text-4xl font-serif leading-[1.12]", "heading-3": "text-3xl font-serif leading-[1.16]", "text-h3": "text-3xl font-serif leading-[1.16]", wide: "text-xl leading-8", "text-wide": "text-xl leading-8", regular: "text-base leading-7", "text-regular": "text-base leading-7", narrow: "mx-auto max-w-2xl text-base leading-7", "text-narrow": "mx-auto max-w-2xl text-base leading-7", "columns-2": "text-base leading-7", "text-columns-2": "text-base leading-7", "columns-3": "text-base leading-7", "text-columns-3": "text-base leading-7", "columns-4": "text-base leading-7", "text-columns-4": "text-base leading-7" };
const SIZE_OPTIONS = [
  { value: "heading-1", label: "Heading 1", tag: "h1", className: "text-5xl font-serif leading-[1.08]" },
  { value: "heading-2", label: "Heading 2", tag: "h2", className: "text-4xl font-serif leading-[1.12]" },
  { value: "heading-3", label: "Heading 3", tag: "h3", className: "text-3xl font-serif leading-[1.16]" },
  { value: "paragraph-1", label: "Paragraph 1", tag: "p", className: "text-xl leading-8" },
  { value: "paragraph-2", label: "Paragraph 2", tag: "p", className: "text-base leading-7" },
  { value: "paragraph-3", label: "Paragraph 3", tag: "p", className: "text-sm leading-6" },
] as const;

function AlignIcon({ align }: { align: "left" | "center" | "right" | "justify" }) { const widths = align === "left" ? [18, 14, 18, 11] : align === "center" ? [14, 18, 14, 16] : align === "right" ? [18, 14, 18, 11] : [18, 18, 18, 18]; const positions = align === "right" ? [0, 4, 0, 7] : align === "center" ? [2, 0, 2, 1] : [0, 0, 0, 0]; return <svg aria-hidden="true" width="20" height="18" viewBox="0 0 20 18" fill="none" className="shrink-0">{widths.map((width, index) => <rect key={index} x={positions[index]} y={index * 4 + 1} width={width} height="2" rx="1" fill="currentColor" />)}</svg>; }
function ListIcon({ ordered }: { ordered: boolean }) { return <svg aria-hidden="true" width="20" height="18" viewBox="0 0 20 18" fill="none" className="shrink-0">{ordered ? <><text x="0" y="6" fontSize="5" fill="currentColor">1</text><text x="0" y="12" fontSize="5" fill="currentColor">2</text><text x="0" y="18" fontSize="5" fill="currentColor">3</text></> : <><circle cx="2" cy="4" r="1.5" fill="currentColor"/><circle cx="2" cy="9" r="1.5" fill="currentColor"/><circle cx="2" cy="14" r="1.5" fill="currentColor"/></>}<rect x="6" y="3" width="13" height="2" rx="1" fill="currentColor"/><rect x="6" y="8" width="13" height="2" rx="1" fill="currentColor"/><rect x="6" y="13" width="10" height="2" rx="1" fill="currentColor"/></svg>; }

type SavedSelection = { range: Range; editor: HTMLDivElement };

function TextToolbar({ editorRef, selectionRef, onChange }: { editorRef: React.RefObject<HTMLDivElement | null>; selectionRef: React.MutableRefObject<SavedSelection | null>; onChange: () => void }) {
  const restoreSelection = () => {
    const saved = selectionRef.current;
    const editor = editorRef.current;
    if (!saved || !editor || saved.editor !== editor) return false;
    editor.focus();
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(saved.range);
    return true;
  };
  const saveSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) return;
    selectionRef.current = { range: selection.getRangeAt(0).cloneRange(), editor };
  };
  const run = (command: string, value?: string) => { if (!restoreSelection()) return; document.execCommand(command, false, value); saveSelection(); onChange(); };
  const setSize = (option: (typeof SIZE_OPTIONS)[number]) => {
    if (!restoreSelection()) return;
    document.execCommand("formatBlock", false, option.tag);
    const saved = selectionRef.current;
    if (saved) {
      const block = (saved.range.startContainer.nodeType === Node.ELEMENT_NODE ? saved.range.startContainer : saved.range.startContainer.parentElement)?.closest("h1,h2,h3,p") as HTMLElement | null;
      if (block) { block.className = option.className; }
    }
    saveSelection();
    onChange();
  };
  const alignments = [{ command: "justifyLeft", value: "left" as const, title: "Align left" }, { command: "justifyCenter", value: "center" as const, title: "Align center" }, { command: "justifyRight", value: "right" as const, title: "Align right" }, { command: "justifyFull", value: "justify" as const, title: "Justify" }];
  const preventToolbarSelectionLoss = (event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); saveSelection(); };
  return <div className="flex flex-wrap items-center gap-0.5 border-b border-[#d9d3ca] bg-[#f7f4ef] px-2 py-1.5 shadow-sm">
    <select aria-label="Text size" title="Text size" defaultValue="paragraph-2" onMouseDown={e => { e.preventDefault(); saveSelection(); }} onChange={e => { const option = SIZE_OPTIONS.find(item => item.value === e.target.value); if (option) setSize(option); }} className="h-8 w-[118px] border border-[#d9d3ca] bg-white px-2 text-xs text-[#403c36] outline-none hover:border-[#aaa49a] focus:border-[#8f887e]">{SIZE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
    <button type="button" title="Bold" aria-label="Bold" onMouseDown={e => { e.preventDefault(); saveSelection(); }} onClick={() => run("bold")} className="flex h-8 w-8 items-center justify-center rounded-sm text-sm font-bold text-[#403c36] hover:bg-white">B</button>
    <button type="button" title="Italic" aria-label="Italic" onMouseDown={e => { e.preventDefault(); saveSelection(); }} onClick={() => run("italic")} className="flex h-8 w-8 items-center justify-center rounded-sm text-sm italic text-[#403c36] hover:bg-white">I</button>
    <button type="button" title="Underline" aria-label="Underline" onMouseDown={e => { e.preventDefault(); saveSelection(); }} onClick={() => run("underline")} className="flex h-8 w-8 items-center justify-center rounded-sm text-sm underline text-[#403c36] hover:bg-white">U</button>
    <label title="Text color" className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm text-[#403c36] hover:bg-white" onMouseDown={e => { e.preventDefault(); saveSelection(); }}><span className="relative text-sm font-semibold leading-6 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-[#7d4f45]">A</span><input aria-label="Text color" type="color" defaultValue="#222222" className="absolute inset-0 cursor-pointer opacity-0" onChange={e => run("foreColor", e.target.value)} /></label>
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
    {alignments.map(item => <button key={item.command} type="button" title={item.title} aria-label={item.title} onMouseDown={preventToolbarSelectionLoss} onClick={() => run(item.command)} className="flex h-8 w-8 items-center justify-center rounded-sm text-[#403c36] hover:bg-white"><AlignIcon align={item.value} /></button>)}
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
    <button type="button" title="Bulleted list" aria-label="Bulleted list" onMouseDown={preventToolbarSelectionLoss} onClick={() => run("insertUnorderedList")} className="flex h-8 w-8 items-center justify-center rounded-sm text-[#403c36] hover:bg-white"><ListIcon ordered={false} /></button>
    <button type="button" title="Numbered list" aria-label="Numbered list" onMouseDown={preventToolbarSelectionLoss} onClick={() => run("insertOrderedList")} className="flex h-8 w-8 items-center justify-center rounded-sm text-[#403c36] hover:bg-white"><ListIcon ordered /></button>
    <button type="button" title="Remove formatting" aria-label="Remove formatting" onMouseDown={preventToolbarSelectionLoss} onClick={() => run("removeFormat")} className="flex h-8 w-8 items-center justify-center rounded-sm text-sm font-medium text-[#403c36] hover:bg-white">T<span className="text-[#77736c]">x</span></button>
  </div>;
}

function TextBlockEditor({ block, onChange, onBlur }: { block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void; onBlur: () => void }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<SavedSelection | null>(null);
  const [editing, setEditing] = useState(false);
  const content = block.body ?? block.title ?? "";
  useEffect(() => { if (editorRef.current && !editing && editorRef.current.innerHTML !== content) editorRef.current.innerHTML = content; }, [content, editing]);
  const saveSelection = () => { const editor = editorRef.current; const selection = window.getSelection(); if (!editor || !selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) return; selectionRef.current = { range: selection.getRangeAt(0).cloneRange(), editor }; };
  const changed = () => { saveSelection(); onChange({ body: editorRef.current?.innerHTML ?? "" }); };
  const variant = block.variant ?? block.type;
  const style = TEXT_STYLES[variant] ?? "text-base leading-7";
  const isColumns = variant.includes("columns-2") || variant.includes("columns-3") || variant.includes("columns-4");
  const columns = variant.includes("columns-4") ? 4 : variant.includes("columns-3") ? 3 : 2;
  return <div className="overflow-hidden border border-transparent transition-colors focus-within:border-[#d9d3ca]">{editing && <TextToolbar editorRef={editorRef} selectionRef={selectionRef} onChange={changed} />}<div className={isColumns ? "grid gap-8 " + (columns === 4 ? "md:grid-cols-4" : columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2") : ""}><div ref={editorRef} contentEditable suppressContentEditableWarning spellCheck className={`min-h-12 whitespace-pre-wrap px-2 py-2 outline-none ${style}`} onFocus={() => { setEditing(true); saveSelection(); }} onKeyUp={saveSelection} onMouseUp={saveSelection} onInput={changed} onBlur={() => { saveSelection(); setEditing(false); onBlur(); }} /></div></div>;
}

function BlockCard({ block, blocks, onBlocksChange, onDelete, onUpdate }: { block: StoryBlock; blocks: StoryBlock[]; onBlocksChange: Props["onBlocksChange"]; onDelete: Props["onDelete"]; onUpdate: Props["onUpdate"] }) { const textLabel = TEXT_LABELS[block.variant ?? block.type]; const isText = block.type === "text" || block.type.startsWith("text-"); const updateLocal = (patch: Partial<StoryBlock>) => onBlocksChange(blocks.map(item => item.id === block.id ? { ...item, ...patch } : item)); return <article className="group relative">{isText ? <TextBlockEditor block={block} onChange={updateLocal} onBlur={() => onUpdate(block, { body: block.body, title: block.title })} /> : <div className="border border-[#d9d3ca] bg-white p-7 lg:p-9"><p className="text-sm text-[#77736c]">This block has its own dedicated editor component.</p>{block.media.length > 0 && <div className="mt-5 grid grid-cols-3 gap-3">{block.media.map(media => <div key={media.id} className="aspect-square overflow-hidden bg-[#e7e2da]"><img src={mediaUrl(media.path)} alt={media.alt ?? media.filename} className="h-full w-full object-cover" /></div>)}</div>}</div>}<div className="absolute -top-3 right-0 z-10 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"><span className="bg-[#f5f2ec] px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">{textLabel ?? block.variant ?? block.type}</span><button type="button" onClick={() => onDelete(block.id)} className="bg-[#f5f2ec] px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-[#9a4c42] hover:text-[#6f2820]">Delete</button></div></article>; }

export default function StoryContent({ storyId, blocks, onBlocksChange, onDelete, onUpdate }: Props) { const visibleBlocks = blocks.filter(block => block.is_visible !== 0).slice().sort((a, b) => a.sort_order - b.sort_order); return <section className="min-w-0"><div className="space-y-1">{visibleBlocks.map(block => <div key={block.id}><BlockCard block={block} blocks={blocks} onBlocksChange={onBlocksChange} onDelete={onDelete} onUpdate={onUpdate}/><AddBlockTrigger storyId={storyId}/></div>)}{visibleBlocks.length === 0 && <AddBlockTrigger storyId={storyId}/>}</div></section>; }
