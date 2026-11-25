"use client";

import type { ContentBlockSelection, SocialBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };
type Group = { id: string; label: string; items: Array<[SocialBlockVariant, string, string]> };

const base = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const groups: Group[] = [
  {
    id: "instagram",
    label: "Instagram",
    items: [
      ["instagram-1", "Instagram Grid", `${base}instagram-1.jpg`],
      ["instagram-2", "Instagram Overlay", `${base}instagram-2.jpg`],
      ["instagram-3", "Instagram Sidebar", `${base}instagram-3.jpg`],
    ],
  },
  {
    id: "social-links",
    label: "Social Links",
    items: [
      ["social-links-1", "Plain Icons", "/blocks/social-links-1.jpg"],
      ["social-links-2", "Square Badges", "/blocks/social-links-2.jpg"],
      ["social-links-3", "Outline Icons", "/blocks/social-links-3.jpg"],
      ["social-links-4", "Monochrome Badges", "/blocks/social-links-4.jpg"],
    ],
  },
];

export default function SocialBlockPicker({ onSelect }: Props) {
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
                onClick={() => onSelect({ category: "social", variant, data: {} })}
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
