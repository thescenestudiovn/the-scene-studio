"use client";

import { useEffect, useRef } from "react";
import type { StoryBlock } from "./types";

type Column = { content: string };

type Props = {
  block: StoryBlock;
  onChange: (patch: Partial<StoryBlock>) => void;
};

const DEFAULTS: Record<string, string[]> = {
  "columns-2": [
    "This is the first column. Add your story, a meaningful detail, or a short reflection here.",
    "This is the second column. Continue the story with another detail, memory, or thought here.",
  ],
  "columns-3": [
    "First column sample text. Add a short story or detail here.",
    "Second column sample text. Add another meaningful moment here.",
    "Third column sample text. Finish this section with another thought here.",
  ],
  "columns-4": [
    "First column sample text.",
    "Second column sample text.",
    "Third column sample text.",
    "Fourth column sample text.",
  ],
};

function getColumns(block: StoryBlock): Column[] {
  const raw = block.data?.columns;
  if (Array.isArray(raw)) {
    const columns = raw.map((item) => ({ content: typeof item === "object" && item !== null && "content" in item ? String((item as { content?: unknown }).content ?? "") : String(item ?? "") }));
    if (columns.length) return columns;
  }
  const defaults = DEFAULTS[block.variant ?? ""] ?? ["Sample column text."];
  return defaults.map((content) => ({ content }));
}

export default function TextColumnsEditor({ block, onChange }: Props) {
  const columns = getColumns(block);
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    columns.forEach((column, index) => {
      const editor = refs.current[index];
      if (editor && editor.innerHTML !== column.content) editor.innerHTML = column.content;
    });
  }, [block.data]);

  const save = () => {
    const next = refs.current.map((editor, index) => ({ content: editor?.innerHTML ?? columns[index]?.content ?? "" }));
    onChange({ data: { ...(block.data ?? {}), columns: next }, body: next.map((column) => `<p>${column.content}</p>`).join("") });
  };

  return (
    <div className={`grid gap-8 border border-transparent px-2 py-2 focus-within:border-[#d9d3ca] ${columns.length === 2 ? "md:grid-cols-2" : columns.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
      {columns.map((column, index) => (
        <div key={index} className="min-w-0">
          <div
            ref={(element) => { refs.current[index] = element; }}
            contentEditable
            suppressContentEditableWarning
            spellCheck
            className="min-h-20 whitespace-pre-wrap px-2 py-2 text-base leading-7 outline-none"
            onInput={save}
          />
        </div>
      ))}
    </div>
  );
}
