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

export default function VideoBlockEditor({ block, onChange }: Props) {
  const data = typeof block.data === "string" ? (() => { try { return JSON.parse(block.data) as Record<string, unknown>; } catch { return {}; } })() : (block.data ?? {});
  const [url, setUrl] = useState(typeof data.youtube_url === "string" ? data.youtube_url : "");
  const id = youtubeId(url);

  const save = () => onChange({ data: { youtube_url: url.trim() } });

  return <div className="border border-[#ddd9d0] bg-white p-5 md:p-7">
    <div className="mb-4 text-[10px] uppercase tracking-[0.18em] text-[#8a857d]">YouTube Video</div>
    <div className="flex gap-3 max-md:flex-col">
      <input value={url} onChange={e => setUrl(e.target.value)} onBlur={save} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); save(); } }} placeholder="Paste YouTube link" className="min-w-0 flex-1 border border-[#d9d3ca] bg-[#faf9f6] px-4 py-3 text-sm outline-none focus:border-[#99938a]" />
      <button type="button" onClick={save} className="border border-[#171717] bg-[#171717] px-5 py-3 text-xs uppercase tracking-[0.14em] text-white">Save</button>
    </div>
    {id ? <div className="mt-6 aspect-video overflow-hidden bg-black"><iframe className="h-full w-full" src={`https://www.youtube.com/embed/${id}`} title="YouTube video preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div> : <p className="mt-3 text-xs text-[#8a857d]">Paste a YouTube URL to preview the video.</p>}
  </div>;
}
