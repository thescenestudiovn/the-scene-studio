"use client";

import { mediaUrl } from "@/lib/media";
import StoryCoverPositionEditor from "@/app/admin/components/StoryCoverPositionEditor";
import type { Story } from "./types";

type Props = {
  story: Story;
  storyId: string;
  tags: string[];
  categoryNames: string[];
  onChange: (story: Story) => void;
};

export default function StoryCover({ story, storyId, tags, categoryNames, onChange }: Props) {
  return (
    <section className="relative mb-10 overflow-hidden bg-[#ddd7cd]">
      <div className="aspect-[16/7] min-h-[340px] w-full">
        {story.cover_path ? (
          <img src={mediaUrl(story.cover_path)} alt={story.title} className="h-full w-full bg-[#e7e2da] object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[#8a857d]">No cover image</div>
        )}
      </div>
      <div className="absolute right-5 top-5">
        <StoryCoverPositionEditor
          compact
          storyId={storyId}
          onChanged={(next) => onChange({
            ...story,
            cover_media_id: next.cover_media_id ?? null,
            cover_path: next.cover_path ?? null,
            cover_filename: next.cover_filename ?? null,
          })}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-7 pb-7 pt-28 text-white lg:px-10 lg:pb-10">
        <input
          value={story.title}
          onChange={(event) => onChange({ ...story, title: event.target.value })}
          placeholder="Post Name"
          className="w-full bg-transparent font-serif text-4xl leading-tight outline-none placeholder:text-white/60 lg:text-6xl"
        />
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.15em] text-white/85">
          <span>{story.published ? "Published" : "Draft"}</span>
          {story.published_at && <span>Published {new Date(story.published_at).toLocaleDateString()}</span>}
          <span>{tags.length ? tags.join(" · ") : "No tags"}</span>
          <span>{categoryNames.length ? categoryNames.join(" · ") : "No category"}</span>
        </div>
      </div>
    </section>
  );
}
