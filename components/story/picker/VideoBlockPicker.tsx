"use client";

import type { ContentBlockSelection, VideoBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

type VideoItem = {
  variant: VideoBlockVariant;
  label: string;
  preview: React.ReactNode;
  defaults?: Record<string, unknown>;
};

type Group = {
  id: string;
  label: string;
  items: VideoItem[];
};

function PlayIcon({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-6 w-6 text-[10px]" : size === "lg" ? "h-11 w-11 text-base" : "h-8 w-8 text-xs";
  return (
    <div className={`flex ${dim} items-center justify-center rounded-full border border-white/60 bg-black/30 text-white backdrop-blur-[2px]`}>
      ▶
    </div>
  );
}

export default function VideoBlockPicker({ onSelect }: Props) {
  const groups: Group[] = [
    {
      id: "video",
      label: "Video",
      items: [
        {
          variant: "video-large",
          label: "Large Video",
          defaults: {
            title: "Wedding Highlights",
            youtube_url: "",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center p-3">
              <div className="flex aspect-[16/10] w-[75%] items-center justify-center bg-gradient-to-tr from-[#3b3a4a] via-[#756a7e] to-[#cbb4a6]">
                <PlayIcon />
              </div>
            </div>
          ),
        },
        {
          variant: "video-medium",
          label: "Medium Video",
          defaults: {
            title: "Featured Film",
            youtube_url: "",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center p-3">
              <div className="flex aspect-[16/10] w-[50%] items-center justify-center bg-gradient-to-tr from-[#3b3a4a] via-[#756a7e] to-[#cbb4a6]">
                <PlayIcon size="sm" />
              </div>
            </div>
          ),
        },
        {
          variant: "video-full",
          label: "Full Width Video",
          defaults: {
            title: "Cinematic Film",
            youtube_url: "",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center p-1">
              <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-tr from-[#3b3a4a] via-[#756a7e] to-[#cbb4a6]">
                <PlayIcon size="lg" />
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "video-banners",
      label: "Video Banners",
      items: [
        {
          variant: "video-banner-center",
          label: "Video Banner · Center",
          defaults: {
            title: "Video Banner",
            body: "LOREM IPSUM DOLOR SIT AMET",
            youtube_url: "",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center p-1">
              <div className="relative flex aspect-[16/8] w-full flex-col items-center justify-center bg-gradient-to-b from-[#111922] via-[#21383b] to-[#121c17] text-white">
                <PlayIcon size="sm" />
                <span className="mt-2 font-serif text-[11px] tracking-wider">Video Banner</span>
                <span className="mt-0.5 text-[7px] tracking-widest opacity-60">LOREM IPSUM DOLOR SIT AMET</span>
              </div>
            </div>
          ),
        },
        {
          variant: "video-banner-bottom",
          label: "Video Banner · Subtitle",
          defaults: {
            title: "Video Banner",
            body: "MOMENTS CAPTURED IN MOTION",
            youtube_url: "",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center p-1">
              <div className="relative flex aspect-[16/8] w-full flex-col items-center justify-end bg-gradient-to-b from-[#111922] via-[#21383b] to-[#121c17] pb-3 text-white">
                <div className="mb-2"><PlayIcon size="sm" /></div>
                <span className="font-serif text-[11px] tracking-wider">Video Banner</span>
                <span className="mt-0.5 text-[7px] tracking-widest opacity-60">MOMENTS CAPTURED IN MOTION</span>
              </div>
            </div>
          ),
        },
        {
          variant: "video-banner-split",
          label: "Video Banner · Split Card",
          defaults: {
            title: "Video Banner",
            body: "LOREM IPSUM DOLOR SIT AMET",
            youtube_url: "",
          },
          preview: (
            <div className="grid h-full w-full grid-cols-2 p-1">
              <div className="flex items-center justify-center bg-gradient-to-b from-[#111922] via-[#21383b] to-[#121c17]">
                <PlayIcon size="sm" />
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-3 text-center">
                <span className="font-serif text-[11px] text-[#171717]">Video Banner</span>
                <span className="mt-1 text-[6px] tracking-widest text-[#77736c]">LOREM IPSUM DOLOR SIT AMET</span>
                <div className="mt-2 h-px w-6 bg-[#d8d3ca]" />
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "video-with-text",
      label: "Video with Text",
      items: [
        {
          variant: "video-text-large",
          label: "Large Video with Text",
          defaults: {
            title: "Large Video with Text",
            body: "This is a paragraph. Enter your story, video description, or couple's reflection here.",
            youtube_url: "",
          },
          preview: (
            <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
              <div className="flex aspect-[16/9] w-[70%] items-center justify-center bg-gradient-to-tr from-[#1b2b3a] to-[#5b7282]">
                <PlayIcon size="sm" />
              </div>
              <span className="mt-2 text-[8px] uppercase tracking-wider text-[#171717]">Large Video with Text</span>
              <span className="mt-0.5 text-[6px] text-[#8a857d]">Paragraph text below video</span>
            </div>
          ),
        },
        {
          variant: "video-text-medium",
          label: "Video with Text",
          defaults: {
            title: "Video with Text",
            body: "An intimate glimpse into their destination wedding day.",
            youtube_url: "",
          },
          preview: (
            <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
              <div className="flex aspect-[16/9] w-[45%] items-center justify-center bg-gradient-to-tr from-[#1b2b3a] to-[#5b7282]">
                <PlayIcon size="sm" />
              </div>
              <span className="mt-2 text-[8px] uppercase tracking-wider text-[#171717]">Video with Text</span>
              <span className="mt-0.5 text-[6px] text-[#8a857d]">Short description</span>
            </div>
          ),
        },
        {
          variant: "video-text-split",
          label: "Video with Text · Split",
          defaults: {
            title: "Video with Text",
            body: "Every couple has an unforgettable story waiting to be remembered in moving frames.",
            youtube_url: "",
          },
          preview: (
            <div className="grid h-full w-full grid-cols-2 items-center gap-2 p-3">
              <div className="text-left">
                <span className="block text-[8px] uppercase tracking-wider text-[#171717]">Video with Text</span>
                <span className="mt-1 block text-[6px] leading-tight text-[#8a857d]">This is a paragraph. Click edit and enter your own story.</span>
              </div>
              <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-tr from-[#3d322b] to-[#8d7c68]">
                <PlayIcon size="sm" />
              </div>
            </div>
          ),
        },
        {
          variant: "video-text-split-large",
          label: "Large Video with Text · Left Text",
          defaults: {
            title: "Large Video with Text",
            body: "Moments framed with emotional honesty and timeless aesthetic.",
            youtube_url: "",
          },
          preview: (
            <div className="grid h-full w-full grid-cols-3 items-center gap-2 p-2">
              <div className="col-span-1 text-left">
                <span className="block text-[7px] uppercase tracking-wider text-[#171717]">Large Video</span>
                <span className="mt-0.5 block text-[6px] text-[#8a857d]">Description text</span>
              </div>
              <div className="col-span-2 flex aspect-[16/10] items-center justify-center bg-gradient-to-tr from-[#1a233a] to-[#4c3f58]">
                <PlayIcon size="sm" />
              </div>
            </div>
          ),
        },
        {
          variant: "video-text-split-right",
          label: "Large Video with Text · Right Text",
          defaults: {
            title: "Large Video with Text",
            body: "Capturing emotional depth and organic beauty in motion.",
            youtube_url: "",
          },
          preview: (
            <div className="grid h-full w-full grid-cols-3 items-center gap-2 p-2">
              <div className="col-span-2 flex aspect-[16/10] items-center justify-center bg-gradient-to-tr from-[#1a233a] to-[#4c3f58]">
                <PlayIcon size="sm" />
              </div>
              <div className="col-span-1 text-left">
                <span className="block text-[7px] uppercase tracking-wider text-[#171717]">Large Video</span>
                <span className="mt-0.5 block text-[6px] text-[#8a857d]">Description text</span>
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <div className="space-y-9">
      {groups.map(group => (
        <section key={group.id}>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a867e]">{group.label}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map(item => (
              <button
                key={item.variant}
                type="button"
                onClick={() =>
                  onSelect({
                    category: "video",
                    variant: item.variant,
                    data: {
                      ...(item.defaults ?? {}),
                      variant: item.variant,
                    },
                  })
                }
                className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#f0eee9]">
                  {item.preview}
                </div>
                <div className="px-5 py-4 text-sm font-medium text-[#27251f]">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
