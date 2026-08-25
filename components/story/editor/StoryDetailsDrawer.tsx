"use client";

import { useState } from "react";
import StoryDetails from "./StoryDetails";
import type { Destination, Story, StoryCategory, StoryLocation } from "./types";

type Props = { story: Story; categories: StoryCategory[]; locations: StoryLocation[]; destinations: Destination[]; selectedCategoryIds: string[]; selectedLocationIds: string[]; categoryInput: string; locationInput: string; creatingCategory: boolean; creatingLocation: boolean; onStoryChange: (story: Story) => void; onToggleCategory: (id: string) => void; onToggleLocation: (id: string) => void; onCategoryInputChange: (value: string) => void; onLocationInputChange: (value: string) => void; onCreateCategory: () => void; onCreateLocation: () => void };

export default function StoryDetailsDrawer(props: Props) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className="border border-[#bdb7ad] bg-[#f5f2ec] px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] hover:bg-white">Story Details</button>
    {open && <div className="fixed inset-0 z-50"><button aria-label="Close story details" type="button" className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} /><aside className="absolute right-0 top-0 h-full w-full max-w-[430px] overflow-y-auto bg-[#f5f2ec] shadow-2xl animate-[slideIn_.25s_ease-out]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#d9d3ca] bg-[#f5f2ec]/95 px-6 py-5 backdrop-blur"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[#8a857d]">Story Settings</p><p className="mt-1 text-sm font-medium">{props.story.title || "Untitled story"}</p></div><button type="button" onClick={() => setOpen(false)} className="h-9 w-9 border border-[#d9d3ca] text-lg leading-none">×</button></div>
      <div className="p-6"><StoryDetails {...props} /></div>
    </aside></div>}
    <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
  </>;
}
