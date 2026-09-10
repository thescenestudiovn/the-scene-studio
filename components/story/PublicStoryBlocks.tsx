"use client";

import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "../../lib/media";

type Media = { id: string; path: string; filename?: string | null; alt?: string | null; width?: number | null; height?: number | null };
type Block = { id: string; type: string; variant?: string | null; eyebrow?: string | null; title?: string | null; body?: string | null; data?: string | Record<string, unknown> | null; media?: Media[] };
type TextItem = { title?: string; text?: string };

function parseData(value: Block["data"]) { if (!value) return {}; if (typeof value !== "string") return value; try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {}; } catch { return {}; } }
function youtubeId(value: string) { try { const url = new URL(value.trim()); if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] || null; if (url.hostname.includes("youtube.com")) { if (url.pathname === "/watch") return url.searchParams.get("v"); if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || null; if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || null; } } catch {} return null; }
function imageFor(media: Media[], ids: string[], index: number) { const id = ids[index]; return id ? media.find(item => item.id === id) ?? media[index] : media[index]; }
function itemsFor(data: Record<string, unknown>, count: number): TextItem[] { const source = Array.isArray(data.items) ? data.items : []; return Array.from({ length: count }, (_, index) => { const item = source[index]; return item && typeof item === "object" ? item as TextItem : {}; }); }

function Slider({ media }: { media: Media[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => { if (media.length < 2) return; const timer = window.setInterval(() => setIndex(value => (value + 1) % media.length), 5000); return () => window.clearInterval(timer); }, [media.length]);
  if (!media.length) return null;
  const current = media[Math.min(index, media.length - 1)];
  return <div className="relative mx-auto max-w-7xl px-6 md:px-10"><div className="relative overflow-hidden bg-[#ebe8e1]"><img src={mediaUrl(current.path)} alt={current.alt || current.filename || "The Scene Studio"} className="block h-[70vh] w-full object-cover md:h-[78vh]" />{media.length > 1 && <><button type="button" aria-label="Previous image" onClick={() => setIndex(value => (value - 1 + media.length) % media.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-4 py-3 text-lg backdrop-blur transition hover:bg-white">←</button><button type="button" aria-label="Next image" onClick={() => setIndex(value => (value + 1) % media.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-4 py-3 text-lg backdrop-blur transition hover:bg-white">→</button></>}</div>{media.length > 1 && <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#77736c]"><span>{String(index + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}</span><div className="flex gap-1.5">{media.map((item, itemIndex) => <button key={item.id} type="button" aria-label={`Go to image ${itemIndex + 1}`} onClick={() => setIndex(itemIndex)} className={`h-1 w-8 transition ${itemIndex === index ? "bg-[#171717]" : "bg-[#c9c5bc]"}`} />)}</div></div>}</div>;
}

function Carousel({ media }: { media: Media[] }) { const viewportRef = useRef<HTMLDivElement>(null); if (!media.length) return null; const scroll = (direction: number) => viewportRef.current?.scrollBy({ left: direction * (viewportRef.current.clientWidth * 0.78), behavior: "smooth" }); return <div className="mx-auto max-w-7xl px-6 md:px-10"><div ref={viewportRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{media.map(item => <div key={item.id} className="w-[82%] shrink-0 snap-start md:w-[32%]"><img src={mediaUrl(item.path)} alt={item.alt || item.filename || "The Scene Studio"} className="h-[58vh] w-full object-cover" /></div>)}</div>{media.length > 1 && <div className="mt-5 flex justify-end gap-2"><button type="button" aria-label="Previous images" onClick={() => scroll(-1)} className="border border-[#d8d3ca] px-4 py-2 text-sm transition hover:bg-white">←</button><button type="button" aria-label="Next images" onClick={() => scroll(1)} className="border border-[#d8d3ca] px-4 py-2 text-sm transition hover:bg-white">→</button></div>}</div>; }

function ImageWithText({ block, data, media, variant }: { block: Block; data: Record<string, unknown>; media: Media[]; variant: string }) {
  const ids = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
  const count = variant === "text-columns-2" ? 2 : variant === "text-columns-3" ? 3 : variant === "text-columns-4" ? 4 : 1;
  const items = itemsFor(data, count);
  const selected = Array.from({ length: count }, (_, index) => imageFor(media, ids, index));
  const image = (item: Media | undefined, className = "") => item ? <img src={mediaUrl(item.path)} alt={item.alt || item.filename || "The Scene Studio"} className={`h-full w-full object-cover ${className}`} /> : <div className="h-full w-full bg-[#ebe7df]" />;
  const text = (item: TextItem) => <div className="space-y-2"><h3 className="font-serif text-2xl leading-tight md:text-3xl">{item.title || ""}</h3>{item.text && <p className="text-sm leading-7 text-[#77736c]">{item.text}</p>}</div>;

  if (variant.startsWith("text-overlay-")) return <section className="px-6 py-16 md:px-10 md:py-24"><div className={`relative mx-auto overflow-hidden ${variant === "text-overlay-full" ? "max-w-7xl" : variant === "text-overlay-medium" ? "max-w-5xl" : "max-w-6xl"}`}><div className={`${variant === "text-overlay-full" ? "aspect-[16/9]" : "aspect-[4/3]"}`}>{image(selected[0])}</div><div className="absolute inset-0 bg-black/25"/><div className="absolute inset-x-0 bottom-0 max-w-2xl p-7 text-white md:p-12">{block.eyebrow && <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/75">{block.eyebrow}</p>}{text(items[0])}</div></div></section>;

  if (variant.startsWith("text-columns-")) return <section className="px-6 py-16 md:px-10 md:py-24"><div className={`mx-auto grid max-w-7xl gap-8 ${count === 2 ? "md:grid-cols-2" : count === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>{selected.map((item, index) => <article key={index}><div className="aspect-[4/3] overflow-hidden">{image(item)}</div><div className="pt-5">{text(items[index])}</div></article>)}</div></section>;

  if (variant.startsWith("text-below-")) return <section className="px-6 py-16 md:px-10 md:py-24"><article className={`mx-auto ${variant === "text-below-medium" ? "max-w-3xl" : "max-w-5xl"}`}><div className="aspect-[4/3] overflow-hidden">{image(selected[0])}</div><div className="pt-6">{text(items[0])}</div></article></section>;

  if (variant === "text-left-regular" || variant === "text-right-regular" || variant === "text-left-large" || variant === "text-right-large") {
    const left = variant === "text-left-regular" || variant === "text-left-large";
    const large = variant.endsWith("-large");
    return <section className="px-6 py-16 md:px-10 md:py-24"><div className={`mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 ${large ? "md:gap-16" : ""}`}><div className={left ? "md:order-1" : "md:order-2"}><div className={`${large ? "aspect-[4/3]" : "aspect-[3/2]"} overflow-hidden`}>{image(selected[0])}</div></div><div className={left ? "md:order-2" : "md:order-1"}>{text(items[0])}</div></div></section>;
  }
  return null;
}

export default function PublicStoryBlocks({ blocks }: { blocks: Block[] }) {
  return <div>{blocks.map(block => {
    const data = parseData(block.data);
    const media = block.media ?? [];
    const variant = String(block.variant ?? "").trim().toLowerCase();
    if (variant === "banner-video") { const url = typeof data.youtube_url === "string" ? data.youtube_url : ""; const id = youtubeId(url); if (!id) return null; return <section key={block.id} className="px-6 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-6xl overflow-hidden bg-black"><div className="aspect-video"><iframe className="h-full w-full" src={`https://www.youtube.com/embed/${id}`} title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div></div></section>; }
    if (block.type === "image" && variant.startsWith("text-")) return <ImageWithText key={block.id} block={block} data={data} media={media} variant={variant} />;
    if (block.type === "image" && (variant === "slideshow" || variant === "carousel")) return <section key={block.id} className="py-16 md:py-24">{block.eyebrow && <p className="mb-4 px-6 text-xs uppercase tracking-[0.2em] text-[#77736c] md:px-10">{block.eyebrow}</p>}{block.title && <h2 className="mb-8 px-6 font-serif text-4xl tracking-[-0.03em] md:px-10 md:text-6xl">{block.title}</h2>}{variant === "slideshow" ? <Slider media={media} /> : <Carousel media={media} />}</section>;
    if (block.type === "image" && media[0]) return <section key={block.id} className="px-6 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-7xl overflow-hidden"><img src={mediaUrl(media[0].path)} alt={media[0].alt || "The Scene Studio"} className="h-auto w-full" /></div></section>;
    if (block.type === "text" || block.type.startsWith("text-")) return <section key={block.id} className="px-6 py-20 md:px-10 md:py-32"><div className="mx-auto max-w-4xl">{block.eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">{block.eyebrow}</p>}{block.title && <h2 className="mt-5 font-serif text-5xl tracking-[-0.03em] md:text-7xl">{block.title}</h2>}{block.body && <div className="mt-7 whitespace-pre-line text-sm leading-7 text-[#77736c]">{block.body}</div>}</div></section>;
    return null;
  })}</div>;
}
