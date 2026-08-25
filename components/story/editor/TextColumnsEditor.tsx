"use client";

import { useEffect, useRef, useState } from "react";
import type { StoryBlock } from "./types";

type Column = { content: string };
type SavedSelection = { range: Range; editor: HTMLDivElement };
type Props = { block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void; onBlur?: () => void };

const DEFAULTS: Record<string, string[]> = {
  "columns-2": ["This is the first column. Add your story, a meaningful detail, or a short reflection here.", "This is the second column. Continue the story with another detail, memory, or thought here."],
  "columns-3": ["First column sample text. Add a short story or detail here.", "Second column sample text. Add another meaningful moment here.", "Third column sample text. Finish this section with another thought here."],
  "columns-4": ["First column sample text.", "Second column sample text.", "Third column sample text.", "Fourth column sample text."],
};

const SIZE_OPTIONS = [
  { value: "heading-1", label: "Heading 1", tag: "h1", className: "text-5xl font-serif leading-[1.08]" },
  { value: "heading-2", label: "Heading 2", tag: "h2", className: "text-4xl font-serif leading-[1.12]" },
  { value: "heading-3", label: "Heading 3", tag: "h3", className: "text-3xl font-serif leading-[1.16]" },
  { value: "paragraph-1", label: "Paragraph 1", tag: "p", className: "text-xl leading-8" },
  { value: "paragraph-2", label: "Paragraph 2", tag: "p", className: "text-base leading-7" },
  { value: "paragraph-3", label: "Paragraph 3", tag: "p", className: "text-sm leading-6" },
] as const;

function AlignIcon({ align }: { align: "left" | "center" | "right" | "justify" }) {
  const widths = align === "left" ? [18, 14, 18, 11] : align === "center" ? [14, 18, 14, 16] : align === "right" ? [18, 14, 18, 11] : [18, 18, 18, 18];
  const positions = align === "right" ? [0, 4, 0, 7] : align === "center" ? [2, 0, 2, 1] : [0, 0, 0, 0];
  return <svg aria-hidden="true" width="20" height="18" viewBox="0 0 20 18" fill="none">{widths.map((w, i) => <rect key={i} x={positions[i]} y={i * 4 + 1} width={w} height="2" rx="1" fill="currentColor" />)}</svg>;
}

function ColumnToolbar({ editorRef, selectionRef, onChange }: { editorRef: React.RefObject<HTMLDivElement | null>; selectionRef: React.MutableRefObject<SavedSelection | null>; onChange: () => void }) {
  const restore = () => {
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
  const save = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (editor && selection && selection.rangeCount && editor.contains(selection.anchorNode)) {
      selectionRef.current = { range: selection.getRangeAt(0).cloneRange(), editor };
    }
  };
  const run = (command: string, value?: string) => {
    if (!restore()) return;
    document.execCommand(command, false, value);
    save();
    onChange();
  };
  const setSize = (option: (typeof SIZE_OPTIONS)[number]) => {
    if (!restore()) return;
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || !selection.rangeCount) return;
    let node: Node | null = selection.anchorNode;
    if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const current = (node as Element | null)?.closest("h1,h2,h3,p,div") as HTMLElement | null;
    if (!current || !editor.contains(current)) return;
    const replacement = document.createElement(option.tag);
    replacement.className = option.className;
    while (current.firstChild) replacement.appendChild(current.firstChild);
    current.replaceWith(replacement);
    const range = document.createRange();
    range.selectNodeContents(replacement);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    save();
    onChange();
  };
  const align = [["justifyLeft", "left", "Align left"], ["justifyCenter", "center", "Align center"], ["justifyRight", "right", "Align right"], ["justifyFull", "justify", "Justify"]] as const;
  return <div className="relative z-30 flex flex-wrap items-center gap-0.5 border-b border-[#d9d3ca] bg-[#f7f4ef] px-2 py-1.5 shadow-sm" onMouseDown={e => e.stopPropagation()}>
    <select aria-label="Text size" title="Text size" defaultValue="paragraph-2" onMouseDown={e => { e.stopPropagation(); save(); }} onChange={e => { const option = SIZE_OPTIONS.find(item => item.value === e.target.value); if (option) setSize(option); }} className="h-8 w-[140px] cursor-pointer border border-[#d9d3ca] bg-white px-2 text-xs text-[#403c36] outline-none hover:border-[#aaa49a] focus:border-[#8f887e]">
      {SIZE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
    {[["bold", "B"], ["italic", "I"], ["underline", "U"]].map(([command, label]) => <button key={command} type="button" title={command} onMouseDown={e => { e.preventDefault(); save(); }} onClick={() => run(command)} className={`flex h-8 w-8 items-center justify-center rounded-sm text-sm text-[#403c36] hover:bg-white ${command === "bold" ? "font-bold" : command === "italic" ? "italic" : "underline"}`}>{label}</button>)}
    <label title="Text color" className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm hover:bg-white" onMouseDown={e => { e.preventDefault(); save(); }}><span className="border-b-4 border-[#7d4f45] text-sm font-semibold">A</span><input type="color" defaultValue="#222222" className="absolute inset-0 opacity-0" onChange={e => run("foreColor", e.target.value)} /></label>
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
    {align.map(([command, value, title]) => <button key={command} type="button" title={title} onMouseDown={e => { e.preventDefault(); save(); }} onClick={() => run(command)} className="flex h-8 w-8 items-center justify-center rounded-sm text-[#403c36] hover:bg-white"><AlignIcon align={value} /></button>)}
    <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
    <button type="button" title="Remove formatting" onMouseDown={e => { e.preventDefault(); save(); }} onClick={() => run("removeFormat")} className="flex h-8 w-8 items-center justify-center rounded-sm text-sm text-[#403c36] hover:bg-white">T<span className="text-[#77736c]">x</span></button>
  </div>;
}

function getColumns(block: StoryBlock): Column[] {
  const raw = block.data?.columns;
  if (Array.isArray(raw)) {
    const columns = raw.map(item => ({ content: typeof item === "object" && item !== null && "content" in item ? String((item as { content?: unknown }).content ?? "") : String(item ?? "") }));
    if (columns.length) return columns;
  }
  return (DEFAULTS[block.variant ?? ""] ?? ["Sample column text."]).map(content => ({ content }));
}

export default function TextColumnsEditor({ block, onChange }: Props) {
  const columns = getColumns(block);
  const refs = useRef<Array<HTMLDivElement | null>>([]);
  const selections = useRef<Array<SavedSelection | null>>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    columns.forEach((column, index) => {
      const editor = refs.current[index];
      if (editor && editingIndex !== index && editor.innerHTML !== column.content) editor.innerHTML = column.content;
    });
  }, [block.data, editingIndex]);

  const saveSelection = (index: number) => {
    const editor = refs.current[index];
    const selection = window.getSelection();
    if (editor && selection && selection.rangeCount && editor.contains(selection.anchorNode)) {
      selections.current[index] = { range: selection.getRangeAt(0).cloneRange(), editor };
    }
  };

  const updateColumn = (index: number) => {
    const next = refs.current.map((editor, i) => ({ content: editor?.innerHTML ?? columns[i]?.content ?? "" }));
    onChange({ data: { ...(block.data ?? {}), columns: next }, body: next.map(column => `<p>${column.content}</p>`).join("") });
  };

  const gridClass = columns.length === 2 ? "md:grid-cols-2" : columns.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4";
  return <div className={`grid gap-8 border border-transparent px-2 py-2 focus-within:border-[#d9d3ca] ${gridClass}`}>
    {columns.map((column, index) => <div key={index} className="min-w-0">
      {editingIndex === index && <ColumnToolbar editorRef={{ current: refs.current[index] }} selectionRef={{ current: selections.current[index] }} onChange={() => updateColumn(index)} />}
      <div ref={element => { refs.current[index] = element; }} contentEditable suppressContentEditableWarning spellCheck className="min-h-20 whitespace-pre-wrap px-2 py-2 text-base leading-7 outline-none" onFocus={() => { setEditingIndex(index); saveSelection(index); }} onKeyUp={() => saveSelection(index)} onMouseUp={() => saveSelection(index)} onInput={() => updateColumn(index)} />
    </div>)}
  </div>;
}
