"use client";

import type { ContentBlockSelection, OthersBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };
type Group = { id: string; label: string; items: Array<[OthersBlockVariant, string, string]> };

const groups: Group[] = [
  {
    id: "basic",
    label: "Basic",
    items: [
      ["spacer", "Spacer", "/blocks/spacer.jpg"],
      ["divider-large", "Large Divider", "/blocks/divider-large.jpg"],
      ["divider-medium", "Medium Divider", "/blocks/divider-medium.jpg"],
      ["divider-small", "Small Divider", "/blocks/divider-small.jpg"],
      ["button", "Button", "/blocks/button.jpg"],
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    items: [
      ["embed-code", "Custom Embed Code", "/blocks/embed-code.jpg"],
    ],
  },
];

export default function OthersBlockPicker({ onSelect }: Props) {
  return (
    <div className="space-y-9">
      {groups.map(group => (
        <section key={group.id}>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a867e]">{group.label}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map(([variant, label, preview]) => (
              <button
                key={variant}
                type="button"
                onClick={() => onSelect({ category: "others", variant, data: {} })}
                className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#e8e4dc]">
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="px-5 py-4 text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
