"use client";

import type { ContactBlockVariant, ContentBlockSelection } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

const base = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const blocks: Array<[ContactBlockVariant, string, string]> = [
  ["form-1", "Form 1", "form-1.jpg"],
  ["form-2", "Form 2", "form-2.jpg"],
  ["form-3", "Form 3", "form-3.jpg"],
  ["form-with-text-left", "Form with Text Left", "form-with-text-left.jpg"],
  ["form-with-text-right", "Form with Text Right", "form-with-text-right.jpg"],
  ["form-with-image-left", "Form with Image Left", "form-with-image-left.jpg"],
  ["form-with-image-right", "Form with Image Right", "form-with-image-right.jpg"],
];

export default function ContactBlockPicker({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {blocks.map(([variant, label, preview]) => (
        <button
          key={variant}
          type="button"
          onClick={() =>
            onSelect({
              category: "contact",
              variant,
              data: {
                title: "Get in touch",
                body: "Tell us about your plans.",
                media_ids: [],
              },
            })
          }
          className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]"
        >
          <div className="aspect-[16/10] overflow-hidden bg-[#e8e4dc]">
            <img
              src={base + preview}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <div className="px-5 py-4 text-sm font-medium">{label}</div>
        </button>
      ))}
    </div>
  );
}
