"use client";

import type { ContentBlockSelection } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

export default function VideoBlockPicker({ onSelect }: Props) {
  return <div className="mx-auto max-w-3xl">
    <button type="button" onClick={() => onSelect({ category: "content", variant: "banner-video", data: { youtube_url: "" } })} className="group w-full text-left">
      <div className="overflow-hidden border border-[#d9d3ca] bg-white transition hover:border-[#aaa49b]">
        <div className="flex aspect-video items-center justify-center bg-[#ece9e3]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl shadow-sm transition group-hover:scale-105">▶</div>
        </div>
        <div className="border-t border-[#ebe7e0] p-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[#8a857d]">YouTube</div>
          <h3 className="mt-2 font-serif text-2xl">YouTube Video</h3>
          <p className="mt-2 text-sm text-[#77736c]">Add a YouTube link and show the video directly in the story.</p>
        </div>
      </div>
    </button>
  </div>;
}
