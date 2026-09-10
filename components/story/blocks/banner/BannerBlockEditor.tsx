"use client";

import { useState } from "react";
import type { StoryBlock } from "../../editor/types";

type Props = { block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void };

function youtubeId(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || null;
      if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || null;
    }
  } catch {}
  return null;
}

export default function BannerBlockEditor({ block, onChange }: Props) {
  const [value, setValue] = useState(typeof block.data?.youtube_url === "string" ? block.data.youtube_url : "");
  const id = youtubeId(value);
  const update = (next: string) => {
    setValue(next);
    onChange({ data: { ...(block.data ?? {}), youtube_url: next } });
  };

  return <div className="overflow-hidden border border-[#d9d3ca] bg-white">
    <div className="aspect-video bg-[#ece9e3]">
      {id ? <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${id}`} title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div className="flex h-full items-center justify-center text-sm text-[#8a867e]">Paste a YouTube link below</div>}
    </div>
    <div className="border-t border-[#ebe7e0] p-5">
      <label className="block text-xs text-[#77736c]">YouTube URL<input value={value} onChange={e => update(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="mt-2 h-11 w-full border border-[#d9d3ca] bg-[#faf9f6] px-3 text-sm text-[#27251f] outline-none focus:border-[#99938a]" /></label>
      {value && !id && <p className="mt-2 text-xs text-[#9a4c42]">This doesn’t look like a valid YouTube link.</p>}
    </div>
  </div>;
}
