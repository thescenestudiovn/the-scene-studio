"use client";

import { useMemo } from "react";
import type { StoryBlock } from "../../editor/types";

const LABELS: Record<string, string> = {
  "banner-1": "Banner 1",
  "banner-2": "Banner 2",
  "banner-3": "Banner 3",
  "banner-headline": "Banner with Headline",
  "banner-media": "Banner Media Only",
  "banner-slider": "Banner Slider",
};

type Props = { block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void };

export default function BannerBlockEditor({ block, onChange }: Props) {
  const preview = useMemo(() => {
    const value = block.data?.demo_preview;
    return typeof value === "string" ? value : null;
  }, [block.data]);
  const label = LABELS[block.variant ?? ""] ?? "Banner";

  return <div className="overflow-hidden border border-[#d9d3ca] bg-white">
    <div className="relative aspect-[16/6] overflow-hidden bg-[#e8e4dc]">
      {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-[#8a867e]">Choose media for this banner</div>}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
        <div>
          {block.variant === "banner-headline" && <p className="mb-2 text-[10px] uppercase tracking-[0.2em] opacity-80">The Scene Studio</p>}
          {block.variant !== "banner-media" && <h3 className="font-serif text-3xl">{block.title || label}</h3>}
          {block.variant !== "banner-media" && <p className="mt-2 text-sm opacity-90">{block.body || "Add a short message to this banner."}</p>}
        </div>
      </div>
    </div>
    <div className="grid gap-4 border-t border-[#ebe7e0] p-5 sm:grid-cols-2">
      <label className="text-xs text-[#77736c]">Title<input value={block.title ?? ""} onChange={e => onChange({ title: e.target.value })} placeholder={label} className="mt-2 h-10 w-full border border-[#d9d3ca] bg-[#faf9f6] px-3 text-sm text-[#27251f] outline-none focus:border-[#99938a]" /></label>
      <label className="text-xs text-[#77736c]">Message<textarea value={block.body ?? ""} onChange={e => onChange({ body: e.target.value })} placeholder="Add a short message…" rows={2} className="mt-2 w-full resize-none border border-[#d9d3ca] bg-[#faf9f6] px-3 py-2 text-sm text-[#27251f] outline-none focus:border-[#99938a]" /></label>
    </div>
  </div>;
}
