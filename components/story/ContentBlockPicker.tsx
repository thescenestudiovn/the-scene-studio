"use client";

import { useState } from "react";

export type TextBlockVariant =
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "wide"
  | "regular"
  | "narrow"
  | "columns-2"
  | "columns-3"
  | "columns-4";

export type ContentBlockSelection = {
  category: "text";
  variant: TextBlockVariant;
};

const textBlocks: Array<{
  variant: TextBlockVariant;
  label: string;
  description: string;
}> = [
  { variant: "heading-1", label: "Heading 1", description: "Large editorial heading" },
  { variant: "heading-2", label: "Heading 2", description: "Medium editorial heading" },
  { variant: "heading-3", label: "Heading 3", description: "Small editorial heading" },
  { variant: "wide", label: "Wide Text", description: "Wide editorial paragraph" },
  { variant: "regular", label: "Regular Text", description: "Regular reading width" },
  { variant: "narrow", label: "Narrow Text", description: "Narrow editorial column" },
  { variant: "columns-2", label: "Text Columns 2", description: "Two text columns" },
  { variant: "columns-3", label: "Text Columns 3", description: "Three text columns" },
  { variant: "columns-4", label: "Text Columns 4", description: "Four text columns" },
];

const categories = [
  ["text", "Text"],
  ["image", "Image"],
  ["content", "Content"],
  ["links", "Links"],
  ["blog", "Blog"],
  ["video", "Video"],
  ["contact", "Contact"],
  ["social", "Social"],
  ["others", "Others"],
  ["flex", "Flex Block"],
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (selection: ContentBlockSelection) => void;
};

function TextPreview({ variant }: { variant: TextBlockVariant }) {
  const sample = "The Scene Studio";

  if (variant === "heading-1") {
    return <div className="text-[30px] leading-[1.05] tracking-[-0.04em]">{sample}</div>;
  }
  if (variant === "heading-2") {
    return <div className="text-[24px] leading-[1.1] tracking-[-0.03em]">{sample}</div>;
  }
  if (variant === "heading-3") {
    return <div className="text-[19px] leading-[1.15] tracking-[-0.02em]">{sample}</div>;
  }
  if (variant === "columns-2") {
    return <div className="grid grid-cols-2 gap-4 text-[11px] leading-5 text-[#6f6b64]"><span>Love stories, beautifully told.</span><span>Moments made to last.</span></div>;
  }
  if (variant === "columns-3") {
    return <div className="grid grid-cols-3 gap-3 text-[10px] leading-4 text-[#6f6b64]"><span>Love stories.</span><span>Beautiful moments.</span><span>Timeless memories.</span></div>;
  }
  if (variant === "columns-4") {
    return <div className="grid grid-cols-4 gap-2 text-[9px] leading-4 text-[#6f6b64]"><span>Love.</span><span>Stories.</span><span>Wanderlust.</span><span>Always.</span></div>;
  }
  const width = variant === "wide" ? "max-w-full" : variant === "narrow" ? "max-w-[55%]" : "max-w-[78%]";
  return <p className={`${width} text-[12px] leading-5 text-[#6f6b64]`}>Love stories, beautifully told through honest moments, thoughtful details and the places that mean something to you.</p>;
}

export default function ContentBlockPicker({ open, onClose, onSelect }: Props) {
  const [category, setCategory] = useState<(typeof categories)[number][0]>("text");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#f8f7f4] text-[#27251f]">
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-[#ddd9d0] bg-white">
        <div className="flex h-[72px] items-center justify-between border-b border-[#e5e1d9] px-6">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em]">Blocks</span>
          <button type="button" onClick={onClose} className="text-xl leading-none text-[#77736c] hover:text-[#27251f]">×</button>
        </div>
        <nav className="p-3">
          {categories.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={`mb-1 flex w-full items-center rounded-md px-4 py-3 text-left text-sm transition ${category === id ? "bg-[#efede8] font-medium" : "text-[#77736c] hover:bg-[#f5f3ef] hover:text-[#27251f]"}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-[#ddd9d0] bg-[#f8f7f4]/95 px-10 py-7 backdrop-blur">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[#8a867e]">Add content block</div>
          <h1 className="mt-2 font-serif text-3xl">{categories.find(([id]) => id === category)?.[1]}</h1>
        </header>

        <div className="mx-auto max-w-6xl px-10 py-10">
          {category === "text" ? (
            <div className="grid grid-cols-3 gap-6">
              {textBlocks.map((block) => (
                <button
                  key={block.variant}
                  type="button"
                  onClick={() => onSelect({ category: "text", variant: block.variant })}
                  className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex min-h-[190px] items-center border-b border-[#eeeae3] px-7 py-8">
                    <div className="w-full"><TextPreview variant={block.variant} /></div>
                  </div>
                  <div className="px-6 py-5">
                    <div className="text-sm font-medium">{block.label}</div>
                    <div className="mt-1 text-xs text-[#8a867e]">{block.description}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-[#ccc7bd] bg-white text-sm text-[#8a867e]">
              {categories.find(([id]) => id === category)?.[1]} blocks will be added here.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
