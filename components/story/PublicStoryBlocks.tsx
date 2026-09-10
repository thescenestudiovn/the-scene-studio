"use client";

import { useRef, useState } from "react";
import { mediaUrl } from "../../lib/media";

type Media = {
  id: string;
  path: string;
  filename?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type Block = {
  id: string;
  type: string;
  variant?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  body?: string | null;
  data?: string | Record<string, unknown> | null;
  media?: Media[];
};

function parseData(value: Block["data"]) {
  if (!value) return {} as Record<string, unknown>;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
}

function Slider({ media }: { media: Media[] }) {
  const [index, setIndex] = useState(0);
  if (!media.length) return null;
  const current = media[index];

  return (
    <div className="relative mx-auto max-w-7xl px-6 md:px-10">
      <div className="relative overflow-hidden bg-[#ebe8e1]">
        <img src={mediaUrl(current.path)} alt={current.alt || current.filename || "The Scene Studio"} className="block h-[70vh] w-full object-cover md:h-[78vh]" />
        {media.length > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => setIndex((value) => (value - 1 + media.length) % media.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-4 py-3 text-lg backdrop-blur transition hover:bg-white">←</button>
            <button type="button" aria-label="Next image" onClick={() => setIndex((value) => (value + 1) % media.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-4 py-3 text-lg backdrop-blur transition hover:bg-white">→</button>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#77736c]">
          <span>{String(index + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}</span>
          <div className="flex gap-1.5">
            {media.map((item, itemIndex) => (
              <button key={item.id} type="button" aria-label={`Go to image ${itemIndex + 1}`} onClick={() => setIndex(itemIndex)} className={`h-1 w-8 transition ${itemIndex === index ? "bg-[#171717]" : "bg-[#c9c5bc]"}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Carousel({ media }: { media: Media[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  if (!media.length) return null;

  const scroll = (direction: number) => {
    viewportRef.current?.scrollBy({ left: direction * viewportRef.current.clientWidth * 0.72, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div ref={viewportRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {media.map((item) => (
          <div key={item.id} className="w-[82%] shrink-0 snap-start md:w-[32%]">
            <img src={mediaUrl(item.path)} alt={item.alt || item.filename || "The Scene Studio"} className="h-[58vh] w-full object-cover" />
          </div>
        ))}
      </div>
      {media.length > 1 && (
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" aria-label="Previous images" onClick={() => scroll(-1)} className="border border-[#d8d3ca] px-4 py-2 text-sm transition hover:bg-white">←</button>
          <button type="button" aria-label="Next images" onClick={() => scroll(1)} className="border border-[#d8d3ca] px-4 py-2 text-sm transition hover:bg-white">→</button>
        </div>
      )}
    </div>
  );
}

export default function PublicStoryBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((block) => {
        parseData(block.data);
        const media = block.media ?? [];
        const variant = block.variant ?? "";

        if (block.type === "image" && (variant === "slideshow" || variant === "carousel")) {
          return (
            <section key={block.id} className="py-16 md:py-24">
              {block.eyebrow && <p className="mb-4 px-6 text-xs uppercase tracking-[0.2em] text-[#77736c] md:px-10">{block.eyebrow}</p>}
              {block.title && <h2 className="mb-8 px-6 font-serif text-4xl tracking-[-0.03em] md:px-10 md:text-6xl">{block.title}</h2>}
              {variant === "slideshow" ? <Slider media={media} /> : <Carousel media={media} />}
            </section>
          );
        }

        if (block.type === "image" && media[0]) {
          return (
            <section key={block.id} className="px-6 py-16 md:px-10 md:py-24">
              <div className="mx-auto max-w-7xl overflow-hidden">
                <img src={mediaUrl(media[0].path)} alt={media[0].alt || "The Scene Studio"} className="h-auto w-full" />
              </div>
            </section>
          );
        }

        if (block.type === "text" || block.type.startsWith("text-")) {
          return (
            <section key={block.id} className="px-6 py-20 md:px-10 md:py-32">
              <div className="mx-auto max-w-4xl">
                {block.eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">{block.eyebrow}</p>}
                {block.title && <h2 className="mt-5 font-serif text-5xl tracking-[-0.03em] md:text-7xl">{block.title}</h2>}
                {block.body && <div className="mt-7 whitespace-pre-line text-sm leading-7 text-[#77736c]">{block.body}</div>}
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
