"use client";

import type { TextBlockVariant, ContentBlockSelection } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

const base = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";

const blocks: Array<{ variant: TextBlockVariant; label: string; description: string; preview: string; layout: string }> = [
  { variant: "heading", label: "Heading 1", description: "Large editorial heading", preview: "text-heading-1.jpg", layout: "heading-1" },
  { variant: "heading", label: "Heading 2", description: "Medium editorial heading", preview: "text-heading-2.jpg", layout: "heading-2" },
  { variant: "heading", label: "Heading 3", description: "Small editorial heading", preview: "text-heading-3.jpg", layout: "heading-3" },
  { variant: "paragraph", label: "Wide Text", description: "Wide editorial paragraph", preview: "text-wide.jpg", layout: "wide" },
  { variant: "paragraph", label: "Regular Text", description: "Regular reading width", preview: "text-regular.jpg", layout: "regular" },
  { variant: "paragraph", label: "Narrow Text", description: "Narrow editorial column", preview: "text-narrow.jpg", layout: "narrow" },
  { variant: "columns", label: "Text Columns 2", description: "Two text columns", preview: "text-columns-2.jpg", layout: "columns-2" },
  { variant: "columns", label: "Text Columns 3", description: "Three text columns", preview: "text-columns-3.jpg", layout: "columns-3" },
  { variant: "columns", label: "Text Columns 4", description: "Four text columns", preview: "text-columns-4.jpg", layout: "columns-4" },
];

function defaultData(variant: TextBlockVariant, layout: string): Record<string, unknown> {
  if (variant === "heading") return { variant, layout, body: "Enter a Heading" };
  if (variant === "columns") {
    const count = Number(layout.replace("columns-", ""));
    return { variant, layout, columns: Array.from({ length: count }, (_, index) => ({ content: `Column ${index + 1} text.` })) };
  }
  return { variant, layout, body: "This is a sample text. Replace this copy with your own story." };
}

export default function TextBlockPicker({ onSelect }: Props) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {blocks.map(block => <button
      key={block.variant}
      type="button"
      onClick={() => onSelect({ category: "text", variant: block.variant, data: defaultData(block.variant, block.layout) })}
      className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#aaa49b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]"
    >
      <div className="aspect-[16/10] overflow-hidden bg-[#e8e4dc]">
        <img src={base + block.preview} alt={block.label} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
      </div>
      <div className="px-6 py-5">
        <div className="text-sm font-medium">{block.label}</div>
        <div className="mt-1 text-xs text-[#8a867e]">{block.description}</div>
      </div>
    </button>)}
  </div>;
}
