"use client";

import { useMemo, useState } from "react";
import { mediaUrl } from "@/lib/media";
import type { StoryBlock } from "../../editor/types";
import MediaPickerModal from "../image/MediaPickerModal";

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
  const [pickerOpen, setPickerOpen] = useState(false);
  const data = block.data ?? {};
  const availableMedia = Array.isArray(block.media) ? block.media : [];
  const configuredIds = Array.isArray(data.media_ids)
    ? data.media_ids.filter((id): id is string => typeof id === "string")
    : [];
  const availableIds = useMemo(() => new Set(availableMedia.map(item => item.id)), [availableMedia]);
  const selectedIds = useMemo(
    () => configuredIds.filter(id => availableIds.has(id)),
    [configuredIds, availableIds]
  );
  const selectedMedia = selectedIds[0]
    ? availableMedia.find(item => item.id === selectedIds[0])
    : undefined;
  const demoPreview = typeof data.demo_preview === "string" ? data.demo_preview : null;
  const preview = selectedMedia ? mediaUrl(selectedMedia.path) : demoPreview;
  const label = LABELS[block.variant ?? ""] ?? "Banner";

  const applySelection = (collectionId: string, mediaIds: string[]) => {
    if (!mediaIds[0]) return;
    onChange({
      data: {
        ...data,
        collection_id: collectionId || null,
        media_ids: [mediaIds[0]],
      },
    });
    setPickerOpen(false);
  };

  return (
    <div className="overflow-hidden border border-[#d9d3ca] bg-white">
      <div className="relative aspect-[16/6] overflow-hidden bg-[#e8e4dc]">
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex h-full w-full items-center justify-center text-sm text-[#8a867e] hover:bg-[#e2ded6]"
          >
            Choose media for this banner
          </button>
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
          <div>
            {block.variant === "banner-headline" && (
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] opacity-80">The Scene Studio</p>
            )}
            {block.variant !== "banner-media" && <h3 className="font-serif text-3xl">{block.title || label}</h3>}
            {block.variant !== "banner-media" && (
              <p className="mt-2 text-sm opacity-90">{block.body || "Add a short message to this banner."}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-[#ebe7e0] p-5 sm:grid-cols-2">
        <label className="text-xs text-[#77736c]">
          Title
          <input
            value={block.title ?? ""}
            onChange={e => onChange({ title: e.target.value })}
            placeholder={label}
            className="mt-2 h-10 w-full border border-[#d9d3ca] bg-[#faf9f6] px-3 text-sm text-[#27251f] outline-none focus:border-[#99938a]"
          />
        </label>
        <label className="text-xs text-[#77736c]">
          Message
          <textarea
            value={block.body ?? ""}
            onChange={e => onChange({ body: e.target.value })}
            placeholder="Add a short message…"
            rows={2}
            className="mt-2 w-full resize-none border border-[#d9d3ca] bg-[#faf9f6] px-3 py-2 text-sm text-[#27251f] outline-none focus:border-[#99938a]"
          />
        </label>
        <div className="sm:col-span-2 flex items-center justify-between border-t border-[#ebe7e0] pt-4">
          <div className="text-[10px] uppercase tracking-[.14em] text-[#8a857d]">
            {selectedMedia ? selectedMedia.filename : "No media selected"}
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="rounded-full bg-[#171717] px-5 py-2.5 text-xs text-white hover:bg-[#333]"
          >
            {selectedMedia ? "Change media" : "Choose media"}
          </button>
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        required={1}
        selectedIds={selectedIds.slice(0, 1)}
        collectionId={typeof data.collection_id === "string" ? data.collection_id : ""}
        onClose={() => setPickerOpen(false)}
        onDone={applySelection}
      />
    </div>
  );
}
