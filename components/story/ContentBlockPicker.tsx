"use client";

import { useState } from "react";
import TextBlockPicker from "./picker/TextBlockPicker";
import ImageBlockPicker from "./picker/ImageBlockPicker";
import { BLOCK_CATEGORIES, type ContentBlockSelection } from "./picker/blockTypes";

export type { ContentBlockSelection, ImageBlockVariant, TextBlockVariant } from "./picker/blockTypes";

type Props = { open: boolean; onClose: () => void; onSelect: (selection: ContentBlockSelection) => void };

type Category = (typeof BLOCK_CATEGORIES)[number][0];

export default function ContentBlockPicker({ open, onClose, onSelect }: Props) {
  const [category, setCategory] = useState<Category>("text");
  if (!open) return null;

  const label = BLOCK_CATEGORIES.find(([id]) => id === category)?.[1] ?? "Blocks";

  return <div className="fixed inset-0 z-[100] flex overflow-hidden bg-[#f8f7f4] text-[#27251f]">
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-[#ddd9d0] bg-white max-md:w-[190px]">
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#e5e1d9] px-6 max-md:px-4"><span className="text-[11px] font-medium uppercase tracking-[0.18em]">Blocks</span><button type="button" onClick={onClose} className="text-xl leading-none text-[#77736c]">×</button></div>
      <nav className="overflow-y-auto p-3 max-md:p-2">{BLOCK_CATEGORIES.map(([id, name]) => <button key={id} type="button" onClick={() => setCategory(id)} className={`mb-1 flex w-full items-center rounded-md px-4 py-3 text-left text-sm max-md:px-3 max-md:py-2.5 max-md:text-xs ${category === id ? "bg-[#efede8] font-medium" : "text-[#77736c] hover:bg-[#f5f3ef]"}`}>{name}</button>)}</nav>
    </aside>
    <main className="min-w-0 flex-1 overflow-y-auto">
      <header className="sticky top-0 z-10 border-b border-[#ddd9d0] bg-[#f8f7f4]/95 px-10 py-7 backdrop-blur max-md:px-5 max-md:py-5"><div className="text-[10px] uppercase tracking-[0.18em] text-[#8a867e]">Add content block</div><h1 className="mt-2 font-serif text-3xl max-md:text-2xl">{label}</h1></header>
      <div className="mx-auto max-w-6xl px-10 py-10 max-md:px-4 max-md:py-6">
        {category === "text" && <TextBlockPicker onSelect={onSelect} />}
        {category === "image" && <ImageBlockPicker onSelect={onSelect} />}
        {!(["text", "image"] as string[]).includes(category) && <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-[#ccc7bd] bg-white text-sm text-[#8a867e]">{label} blocks will be added here.</div>}
      </div>
    </main>
  </div>;
}
