"use client";

import type { ContentBlockSelection, VideoBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };
type Group = { id: string; label: string; items: Array<[VideoBlockVariant, string, string]> };

const base = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const groups: Group[] = [
  {
    id: "video",
    label: "Video",
    items: [
      ["video-large", "Large Video", `${base}video-large.jpg`],
      ["video-medium", "Medium Video", `${base}video-medium.jpg`],
      ["video-full", "Full Width Video", `${base}video-full.jpg`],
    ],
  },
  {
    id: "video-banners",
    label: "Video Banners",
    items: [
      ["video-banner-1", "Video Banner", `${base}video-banner-1.jpg`],
      ["video-banner-2", "Video Banner (Contained)", `${base}video-banner-2.jpg`],
      ["video-banner-3", "Video Banner with Text", `${base}video-banner-3.jpg`],
    ],
  },
  {
    id: "video-text",
    label: "Video with Text",
    items: [
      ["video-text-large", "Large Video with Text", "/blocks/video-text-large.jpg"],
      ["video-text-small", "Small Video with Text", "/blocks/video-text-small.jpg"],
      ["video-text-left", "Video with Text Left", `${base}video-text-left.jpg`],
      ["video-text-right", "Video with Text Right", `${base}video-text-right.jpg`],
      ["video-text-left-large", "Large Video with Text Left", `${base}video-text-left-large.jpg`],
      ["video-text-right-large", "Large Video with Text Right", `${base}video-text-right-large.jpg`],
    ],
  },
];

export default function VideoBlockPicker({ onSelect }: Props) {
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
                onClick={() => onSelect({ category: "content", variant, data: { youtube_url: "" } })}
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
