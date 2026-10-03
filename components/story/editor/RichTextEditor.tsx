"use client";

import { useEffect, useRef, useState } from "react";

type SavedSelection = { range: Range; editor: HTMLDivElement };
type Props = { value: string; variant: string; placeholder?: string; onChange: (value: string) => void; onBlur?: () => void };
type SizeOption = { value: string; label: string; tag: "h1" | "h2" | "h3" | "p"; className: string };

const SIZE_OPTIONS: SizeOption[] = [
    { value: "heading-1", label: "Heading 1", tag: "h1", className: "text-5xl font-serif leading-[1.08]" },
    { value: "heading-2", label: "Heading 2", tag: "h2", className: "text-4xl font-serif leading-[1.12]" },
    { value: "heading-3", label: "Heading 3", tag: "h3", className: "text-3xl font-serif leading-[1.16]" },
    { value: "paragraph-1", label: "Paragraph 1", tag: "p", className: "text-xl leading-8" },
    { value: "paragraph-2", label: "Paragraph 2", tag: "p", className: "text-base leading-7" },
    { value: "paragraph-3", label: "Paragraph 3", tag: "p", className: "text-sm leading-6" },
];

const VARIANT_STYLES: Record<string, string> = {
    "heading-1": "text-5xl font-serif leading-[1.08]",
    "text-h1": "text-5xl font-serif leading-[1.08]",
    "heading-2": "text-4xl font-serif leading-[1.12]",
    "text-h2": "text-4xl font-serif leading-[1.12]",
    "heading-3": "text-3xl font-serif leading-[1.16]",
    "text-h3": "text-3xl font-serif leading-[1.16]",
    wide: "text-xl leading-8",
    "text-wide": "text-xl leading-8",
    regular: "text-base leading-7",
    "text-regular": "text-base leading-7",
    narrow: "mx-auto max-w-2xl text-base leading-7",
    "text-narrow": "mx-auto max-w-2xl text-base leading-7",
};

function AlignIcon({ align }: { align: "left" | "center" | "right" | "justify" }) {
    const widths = align === "left" ? [18, 14, 18, 11] : align === "center" ? [14, 18, 14, 16] : align === "right" ? [18, 14, 18, 11] : [18, 18, 18, 18];
    const positions = align === "right" ? [0, 4, 0, 7] : align === "center" ? [2, 0, 2, 1] : [0, 0, 0, 0];
    return <svg aria-hidden="true" width="20" height="18" viewBox="0 0 20 18" fill="none">{widths.map((width, index) => <rect key={index} x={positions[index]} y={index * 4 + 1} width={width} height="2" rx="1" fill="currentColor" />)}</svg>;
}

function RichTextToolbar({ editorRef, selectionRef, onChange }: { editorRef: React.RefObject<HTMLDivElement | null>; selectionRef: React.MutableRefObject<SavedSelection | null>; onChange: () => void }) {
    const saveSelection = () => {
        const editor = editorRef.current;
        const selection = window.getSelection();
        if (editor && selection && selection.rangeCount && editor.contains(selection.anchorNode)) selectionRef.current = { range: selection.getRangeAt(0).cloneRange(), editor };
    };
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
    const run = (command: string, value?: string) => {
        if (!restoreSelection()) return;
        document.execCommand(command, false, value);
        saveSelection();
        onChange();
    };
    const setSize = (option: SizeOption) => {
        if (!restoreSelection()) return;
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
        if (current === editor) editor.replaceChildren(replacement);
        else current.replaceWith(replacement);
        const range = document.createRange();
        range.selectNodeContents(replacement);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        saveSelection();
        onChange();
    };
    const align = [["justifyLeft", "left", "Align left"], ["justifyCenter", "center", "Align center"], ["justifyRight", "right", "Align right"], ["justifyFull", "justify", "Justify"]] as const;

    return <div className="relative z-30 flex flex-wrap items-center gap-0.5 border-b border-[#d9d3ca] bg-[#f7f4ef] px-2 py-1.5 shadow-sm" onMouseDown={event => event.stopPropagation()}>
        <select aria-label="Text size" defaultValue="paragraph-2" onMouseDown={event => { event.stopPropagation(); saveSelection(); }} onChange={event => { const option = SIZE_OPTIONS.find(item => item.value === event.target.value); if (option) setSize(option); }} className="h-8 w-[140px] cursor-pointer border border-[#d9d3ca] bg-white px-2 text-xs text-[#403c36] outline-none hover:border-[#aaa49a] focus:border-[#8f887e]">
            {SIZE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
        {[["bold", "B"], ["italic", "I"], ["underline", "U"]].map(([command, label]) => <button key={command} type="button" aria-label={command} onMouseDown={event => { event.preventDefault(); saveSelection(); }} onClick={() => run(command)} className={`flex h-8 w-8 items-center justify-center rounded-sm text-sm text-[#403c36] hover:bg-white ${command === "bold" ? "font-bold" : command === "italic" ? "italic" : "underline"}`}>{label}</button>)}
        <label aria-label="Text color" className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm hover:bg-white" onMouseDown={event => { event.preventDefault(); saveSelection(); }}><span className="border-b-4 border-[#7d4f45] text-sm font-semibold">A</span><input type="color" defaultValue="#222222" className="absolute inset-0 opacity-0" onChange={event => run("foreColor", event.target.value)} /></label>
        <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
        {align.map(([command, value, title]) => <button key={command} type="button" aria-label={title} onMouseDown={event => { event.preventDefault(); saveSelection(); }} onClick={() => run(command)} className="flex h-8 w-8 items-center justify-center rounded-sm text-[#403c36] hover:bg-white"><AlignIcon align={value} /></button>)}
        <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
        <button type="button" aria-label="Remove formatting" onMouseDown={event => { event.preventDefault(); saveSelection(); }} onClick={() => run("removeFormat")} className="flex h-8 w-8 items-center justify-center rounded-sm text-sm text-[#403c36] hover:bg-white">T<span className="text-[#77736c]">x</span></button>
    </div>;
}

export default function RichTextEditor({ value, variant, placeholder = "Click to add text", onChange, onBlur }: Props) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const selectionRef = useRef<SavedSelection | null>(null);
    const [editing, setEditing] = useState(false);
    const style = VARIANT_STYLES[variant] ?? "text-base leading-7";

    useEffect(() => {
        if (editorRef.current && !editing && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
    }, [value, editing]);

    const saveSelection = () => {
        const editor = editorRef.current;
        const selection = window.getSelection();
        if (editor && selection && selection.rangeCount && editor.contains(selection.anchorNode)) selectionRef.current = { range: selection.getRangeAt(0).cloneRange(), editor };
    };
    const changed = () => {
        saveSelection();
        onChange(editorRef.current?.innerHTML ?? "");
    };

    return <div ref={wrapperRef} className="overflow-visible border border-transparent focus-within:border-[#d9d3ca]" onFocusCapture={() => setEditing(true)} onBlurCapture={event => { if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) { setEditing(false); onBlur?.(); } }}>
        {editing && <RichTextToolbar editorRef={editorRef} selectionRef={selectionRef} onChange={changed} />}
        <div className="relative">
            <div ref={editorRef} contentEditable suppressContentEditableWarning spellCheck data-placeholder={placeholder} className={`rich-text-editor min-h-12 whitespace-pre-wrap px-2 py-2 outline-none ${style}`} onFocus={saveSelection} onKeyUp={saveSelection} onMouseUp={saveSelection} onInput={changed} />
            {!value && <span aria-hidden="true" className="pointer-events-none absolute left-2 top-2 text-sm text-[#a29d94]">{placeholder}</span>}
        </div>
    </div>;
}
