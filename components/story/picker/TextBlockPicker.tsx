"use client";

import type { TextBlockVariant, ContentBlockSelection } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

const blocks: Array<{ variant: TextBlockVariant; label: string; description: string }> = [
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

function Preview({ variant }: { variant: TextBlockVariant }) {
  if (variant === "heading-1") return <div className="text-3xl tracking-tight">The Scene Studio</div>;
  if (variant === "heading-2") return <div className="text-2xl tracking-tight">The Scene Studio</div>;
  if (variant === "heading-3") return <div className="text-xl tracking-tight">The Scene Studio</div>;
  if (variant === "columns-2") return <div className="grid grid-cols-2 gap-4 text-xs text-[#6f6b64]"><span>Love stories, beautifully told.</span><span>Moments made to last.</span></div>;
  if (variant === "columns-3") return <div className="grid grid-cols-3 gap-3 text-[10px] text-[#6f6b64]"><span>Love stories.</span><span>Beautiful moments.</span><span>Timeless memories.</span></div>;
  if (variant === "columns-4") return <div className="grid grid-cols-4 gap-2 text-[9px] text-[#6f6b64]"><span>Love.</span><span>Stories.</span><span>Wanderlust.</span><span>Always.</span></div>;
  return <p className={`text-xs leading-5 text-[#6f6b64] ${variant === "wide" ? "" : variant === "narrow" ? "max-w-[55%]" : "max-w-[78%]"}`}>Love stories, beautifully told through honest moments, thoughtful details and the places that mean something to you.</p>;
}

export default function TextBlockPicker({ onSelect }: Props) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {blocks.map(block => <button key={block.variant} type="button" onClick={() => onSelect({ category: "text", variant: block.variant })} className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]">
      <div className="flex min-h-[180px] items-center border-b border-[#eeeae3] px-7 py-8"><div className="w-full"><Preview variant={block.variant}/></div></div>
      <div className="px-6 py-5"><div className="text-sm font-medium">{block.label}</div><div className="mt-1 text-xs text-[#8a867e]">{block.description}</div></div>
    </button>)}
  </div>;
}
