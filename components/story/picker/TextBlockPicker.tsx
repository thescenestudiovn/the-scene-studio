"use client";

import type { TextBlockVariant, ContentBlockSelection } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

const base = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";

const blocks: Array<{ variant: TextBlockVariant; label: string; description: string; preview: string }> = [
  { variant: "heading-1", label: "Heading 1", description: "Large editorial heading", preview: "text-heading-1.jpg" },
  { variant: "heading-2", label: "Heading 2", description: "Medium editorial heading", preview: "text-heading-2.jpg" },
  { variant: "heading-3", label: "Heading 3", description: "Small editorial heading", preview: "text-heading-3.jpg" },
  { variant: "wide", label: "Wide Text", description: "Wide editorial paragraph", preview: "text-wide.jpg" },
  { variant: "regular", label: "Regular Text", description: "Regular reading width", preview: "text-regular.jpg" },
  { variant: "narrow", label: "Narrow Text", description: "Narrow editorial column", preview: "text-narrow.jpg" },
  { variant: "columns-2", label: "Text Columns 2", description: "Two text columns", preview: "text-columns-2.jpg" },
  { variant: "columns-3", label: "Text Columns 3", description: "Three text columns", preview: "text-columns-3.jpg" },
  { variant: "columns-4", label: "Text Columns 4", description: "Four text columns", preview: "text-columns-4.jpg" },
];

function defaultData(variant: TextBlockVariant): Record<string, unknown> {
  if (variant === "heading-1") return { variant, body: "Enter a Heading" };
  if (variant === "heading-2") return { variant, body: "Enter a Heading" };
  if (variant === "heading-3") return { variant, body: "Enter a Heading" };
  if (variant === "wide") return { variant, body: "This is a sample wide text. Replace this copy with your own story." };
  if (variant === "narrow") return { variant, body: "This is a sample narrow text. Replace this copy with your own story." };
  if (variant === "columns-2") return {
    variant,
    columns: [
      { content: "This is the first column. Add your story, a meaningful detail, or a short reflection here." },
      { content: "This is the second column. Continue the story with another detail, memory, or thought here." },
    ],
  };
  if (variant === "columns-3") return {
    variant,
    columns: [
      { content: "First column sample text. Add a short story or detail here." },
      { content: "Second column sample text. Add another meaningful moment here." },
      { content: "Third column sample text. Finish this section with another thought here." },
    ],
  };
  if (variant === "columns-4") return {
    variant,
    columns: [
      { content: "First column sample text." },
      { content: "Second column sample text." },
      { content: "Third column sample text." },
      { content: "Fourth column sample text." },
    ],
  };
  return { variant, body: "This is a sample regular text. Replace this copy with your own story." };
}

export default function TextBlockPicker({ onSelect }: Props) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {blocks.map(block => <button
      key={block.variant}
      type="button"
      onClick={() => onSelect({ category: "text", variant: block.variant, data: defaultData(block.variant) })}
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
