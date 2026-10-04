"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import type { StoryBlock } from "./types";

type TextAlignValue = "left" | "center" | "right" | "justify";

const SIZE_OPTIONS = [
  { value: "banner-heading", label: "Banner Heading", px: "60px" },
  { value: "banner-subtitle", label: "Banner Subtitle", px: "18px" },
  { value: "heading-1", label: "Heading 1", px: "48px" },
  { value: "heading-2", label: "Heading 2", px: "36px" },
  { value: "heading-3", label: "Heading 3", px: "30px" },
  { value: "heading-4", label: "Heading 4", px: "24px" },
  { value: "heading-5", label: "Heading 5", px: "20px" },
  { value: "heading-6", label: "Heading 6", px: "18px" },
  { value: "paragraph-1", label: "Paragraph 1", px: "20px" },
  { value: "paragraph-2", label: "Paragraph 2", px: "16px" },
  { value: "paragraph-3", label: "Paragraph 3", px: "14px" },
] as const;

const SIZE_BY_PX: Record<string, string> = Object.fromEntries(SIZE_OPTIONS.map((option) => [option.px, option.value]));

function normalizeInitialHtml(block: StoryBlock, defaultSize: string, defaultAlign: TextAlignValue) {
  const lines = Array.isArray(block.data?.lines) ? block.data.lines : [];
  if (lines.length) {
    return lines.map((item) => {
      const line = item as { content?: unknown; textSize?: unknown; align?: unknown };
      const content = typeof line.content === "string" ? line.content : "";
      const size = typeof line.textSize === "string" && SIZE_OPTIONS.some((option) => option.value === line.textSize) ? line.textSize : defaultSize;
      const align = typeof line.align === "string" && ["left", "center", "right", "justify"].includes(line.align) ? line.align : defaultAlign;
      const px = SIZE_OPTIONS.find((option) => option.value === size)?.px ?? "16px";
      return "<p style="text-align:" + align + ""><span style="font-size:" + px + "">" + (content || "<br>") + "</span></p>";
    }).join("");
  }
  const body = typeof block.body === "string" ? block.body : typeof block.title === "string" ? block.title : "";
  if (body) return body;
  const px = SIZE_OPTIONS.find((option) => option.value === defaultSize)?.px ?? "16px";
  return "<p style="text-align:" + defaultAlign + ""><span style="font-size:" + px + ""><br></span></p>";
}

function extractLines(html: string, fallbackSize: string, fallbackAlign: TextAlignValue) {
  const holder = document.createElement("div");
  holder.innerHTML = html;
  return Array.from(holder.children).map((child) => {
    const element = child as HTMLElement;
    const span = element.querySelector("span");
    const content = element.innerHTML === "<br>" ? "" : element.innerHTML;
    const px = span?.style.fontSize || element.style.fontSize || "";
    const textSize = SIZE_BY_PX[px] ?? fallbackSize;
    const align = (element.style.textAlign || fallbackAlign) as TextAlignValue;
    return { content, textSize, align };
  });
}

function Toolbar({ editor, currentSize }: { editor: ReturnType<typeof useEditor>; currentSize: string }) {
  if (!editor) return null;
  const alignIcon = (align: string) => align === "left" ? "☰" : align === "center" ? "≡" : align === "right" ? "☷" : "☰";
  return (
    <div data-rich-text-toolbar className="absolute right-16 top-[-46px] z-[1000] flex items-center gap-1 border border-[#d9d3ca] bg-[#f7f4ef] px-2 py-1.5 shadow-sm" onMouseDown={(event) => event.preventDefault()}>
      <select aria-label="Text size" title="Text size" value={currentSize} onChange={(event) => {
        const size = SIZE_OPTIONS.find((option) => option.value === event.target.value);
        if (size) editor.chain().focus().setFontSize(size.px).run();
      }} className="h-8 w-[145px] border border-[#d9d3ca] bg-white px-2 text-xs text-[#403c36] outline-none">
        {SIZE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
      <button type="button" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 font-bold hover:bg-white">B</button>
      <button type="button" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 italic hover:bg-white">I</button>
      <button type="button" title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} className="h-8 w-8 underline hover:bg-white">U</button>
      <label title="Text color" className="relative flex h-8 w-8 cursor-pointer items-center justify-center hover:bg-white">
        <span className="border-b-4 border-[#7d4f45] text-sm font-semibold">A</span>
        <input type="color" defaultValue="#222222" className="absolute inset-0 cursor-pointer opacity-0" onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} />
      </label>
      <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
      {(["left", "center", "right", "justify"] as TextAlignValue[]).map((align) => (
        <button key={align} type="button" title={"Align " + align} onClick={() => editor.chain().focus().setTextAlign(align).run()} className={"h-8 w-8 text-xs hover:bg-white " + (editor.isActive({ textAlign: align }) ? "bg-white" : "")}>{alignIcon(align)}</button>
      ))}
      <span className="mx-1 h-5 w-px bg-[#d9d3ca]" />
      <button type="button" title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="h-8 w-8 text-sm hover:bg-white">T<span className="text-[#77736c]">x</span></button>
    </div>
  );
}

export default function TiptapTextBlockEditor({ block, onChange, onCommit }: { block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void; onCommit: (patch: Partial<StoryBlock>) => void }) {
  const rawVariant = block.variant ?? "paragraph";
  const variant = rawVariant.startsWith("heading-") || rawVariant.startsWith("text-h") ? "heading" : rawVariant.startsWith("text-") ? "paragraph" : rawVariant;
  const layout = typeof block.data?.layout === "string" ? block.data.layout : rawVariant === "heading" ? "heading-1" : "regular";
  const defaultSize = typeof block.data?.textSize === "string" && SIZE_OPTIONS.some((option) => option.value === block.data?.textSize) ? block.data.textSize : layout.startsWith("heading-") ? layout : layout === "wide" ? "paragraph-1" : layout === "narrow" ? "paragraph-3" : "paragraph-2";
  const defaultAlign: TextAlignValue = layout.startsWith("heading-") ? "center" : "left";
  const initialContent = useMemo(() => normalizeInitialHtml(block, defaultSize, defaultAlign), [block.id]);
  const [editing, setEditing] = useState(false);
  const [currentSize, setCurrentSize] = useState(defaultSize);
  const latestBlockRef = useRef(block);
  latestBlockRef.current = block;

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyleKit.configure({ fontSize: { types: ["textStyle"] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onSelectionUpdate({ editor: instance }) {
      const attrs = instance.getAttributes("textStyle");
      const px = typeof attrs.fontSize === "string" ? attrs.fontSize : "";
      if (SIZE_BY_PX[px]) setCurrentSize(SIZE_BY_PX[px]);
    },
    onFocus() { setEditing(true); },
  });

  const commit = () => {
    if (!editor) return;
    const html = editor.getHTML();
    const lines = extractLines(html, defaultSize, defaultAlign);
    const patch: Partial<StoryBlock> = {
      body: html,
      data: { ...(latestBlockRef.current.data ?? {}), variant, layout, lines, textSize: lines[0]?.textSize ?? defaultSize },
    };
    onChange(patch);
    onCommit(patch);
  };

  useEffect(() => {
    if (!editing || !editor) return;
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest("[data-rich-text-toolbar]") || target?.closest(".ProseMirror")) return;
      commit();
      editor.commands.blur();
      setEditing(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [editing, editor]);

  useEffect(() => {
    if (!editor) return;
    const handleBlur = () => commit();
    editor.on("blur", handleBlur);
    return () => editor.off("blur", handleBlur);
  }, [editor]);

  if (!editor) return <section className="px-6 py-12 md:px-10 md:py-16" />;

  return (
    <section className="px-6 py-12 md:px-10 md:py-16" onMouseDown={(event) => event.stopPropagation()}>
      <div className="relative mx-auto w-full">
        {editing && <Toolbar editor={editor} currentSize={currentSize} />}
        <EditorContent editor={editor} className="w-full" onClick={() => setEditing(true)} />
      </div>
    </section>
  );
}
