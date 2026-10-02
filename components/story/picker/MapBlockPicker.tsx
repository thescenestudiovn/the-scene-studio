"use client";

import type { MapBlockVariant, ContentBlockSelection } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

const base = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const blocks: Array<[MapBlockVariant, string, string]> = [
  ["map-1-full", "Map 1 · Full", "map-1-full.jpg"],
  ["map-1-regular", "Map 1 · Regular", "map-1-regular.jpg"],
  ["map-2-regular", "Map 2 · Regular", "map-2-regular.jpg"],
  ["map-3-regular", "Map 3 · Regular", "map-3-regular.jpg"],
];

export default function MapBlockPicker({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {blocks.map(([variant, label, preview]) => (
        <button
          key={variant}
          type="button"
          onClick={() =>
            onSelect({
              category: "map",
              variant,
              data: {
                address: "",
                embed_url: "",
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
