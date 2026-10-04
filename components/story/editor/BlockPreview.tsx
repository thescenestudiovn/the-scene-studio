"use client";

import type { StoryBlock } from "./types";
import { mediaUrl } from "../../../lib/media";
import ContentBlockView from "../blocks/content/ContentBlockView";

function text(value: unknown) { return typeof value === "string" ? value : ""; }

function youtubeId(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return url.pathname.slice(1);
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v") || url.pathname.split("/").pop() || "";
  } catch {}
  return "";
}

function TextPreview({ block }: { block: StoryBlock }) {
  const data = block.data ?? {};
  const variant = text(data.layout) || text(data.variant) || block.variant || "regular";
  const body = text(data.body || block.body);
  const title = text(data.title || block.title);
  const eyebrow = text(data.eyebrow || block.eyebrow);
  const storedLines = Array.isArray(data.lines) ? data.lines as unknown[] : [];
  const isHeadingLayout = variant === "heading-1" || variant === "heading-2" || variant === "heading-3";
  const defaultSize = text(data.textSize) || (
    variant === "heading-1" ? "heading-1" :
    variant === "heading-2" ? "heading-2" :
    variant === "heading-3" ? "heading-3" :
    variant === "wide" ? "paragraph-1" :
    variant === "narrow" ? "paragraph-3" :
    "paragraph-2"
  );
  const textStyle = (size: string) =>
    size === "banner-heading" ? "font-serif text-6xl leading-[1.05]" :
    size === "banner-subtitle" ? "text-lg leading-7" :
    size === "heading-1" ? "font-serif text-5xl leading-[1.08]" :
    size === "heading-2" ? "font-serif text-4xl leading-[1.12]" :
    size === "heading-3" ? "font-serif text-3xl leading-[1.16]" :
    size === "heading-4" ? "font-serif text-2xl leading-[1.2]" :
    size === "heading-5" ? "font-serif text-xl leading-[1.25]" :
    size === "heading-6" ? "font-serif text-lg leading-[1.3]" :
    size === "paragraph-1" ? "text-xl leading-8" :
    size === "paragraph-3" ? "text-sm leading-6" :
    "text-base leading-7";

  const lines = storedLines
    .map(item => {
      if (typeof item !== "object" || item === null) return null;
      const value = item as { content?: unknown; textSize?: unknown; align?: unknown };
      return {
        content: typeof value.content === "string" ? value.content : "",
        textSize: typeof value.textSize === "string" ? value.textSize : defaultSize,
        align: typeof value.align === "string" && ["left","center","right","justify"].includes(value.align) ? value.align : (isHeadingLayout ? "center" : "left"),
      };
    })
    .filter((line): line is { content: string; textSize: string; align: "left"|"center"|"right"|"justify" } => line !== null);

  const textWidthClass =
    variant === "heading-1" || variant === "heading-2" || variant === "heading-3" ? "w-full" :
    variant === "wide" ? "w-full" :
    variant === "narrow" ? "w-full md:w-1/2" :
    "w-full md:w-[70%]";

  return <section className="px-6 py-12 md:px-10 md:py-16"><div className={`mx-auto ${textWidthClass}`}>
    {eyebrow && <p className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">{eyebrow}</p>}
    {title && <h2 className="mt-3 font-serif text-3xl">{title}</h2>}
    {lines.length > 0 ? (
      <div className="mt-5 text-[#77736c]">
        {lines.map((line, index) => (
          <div key={index} className={`whitespace-pre-wrap ${textStyle(line.textSize)}`} style={{ textAlign: line.align as "left"|"center"|"right"|"justify" }} dangerouslySetInnerHTML={{ __html: line.content }} />
        ))}
      </div>
    ) : body ? (
      <div className={`mt-5 whitespace-pre-wrap text-[#77736c] ${textStyle(defaultSize)}`} style={{ textAlign: isHeadingLayout ? "center" : "left" }} dangerouslySetInnerHTML={{ __html: body }} />
    ) : null}
  </div></section>;
}
function ImagePreview({ block }: { block: StoryBlock }) {
  const data = block.data ?? {};
  const variant = text(data.variant) || block.variant || "large";
  const fallback = text(data.image_url);
  const images = block.media?.length ? block.media : [];
  const count = variant === "columns-2" ? 2 : variant === "columns-3" ? 3 : variant === "columns-4" ? 4 : variant.startsWith("grid-") ? 4 : 1;
  const items = Array.from({ length: count }, (_, i) => images[i] ?? images[0]);
  const grid = variant === "columns-2" ? "md:grid-cols-2" : variant === "columns-3" ? "md:grid-cols-3" : variant === "columns-4" ? "md:grid-cols-4" : variant.startsWith("grid-") ? "md:grid-cols-4" : "";
  return <section className="px-6 py-12 md:px-10 md:py-16"><div className={`mx-auto max-w-6xl grid gap-3 ${grid || "md:grid-cols-1"}`}>{items.map((item, index) => item || fallback ? <div key={index} className="aspect-[4/3] overflow-hidden bg-[#e8e4dc]">{item ? <img src={mediaUrl(item.path)} alt={item.alt || item.filename || ""} className="h-full w-full object-cover" /> : <img src={fallback} alt="" className="h-full w-full object-cover" />}</div> : <div key={index} className="aspect-[4/3] bg-[#e8e4dc]" />)}</div></section>;
}

function ContactPreview({ block }: { block: StoryBlock }) {
  const data = block.data ?? {};
  return <section className="px-6 py-12 md:px-10 md:py-16"><div className="mx-auto grid max-w-5xl gap-6 border border-[#d8d3ca] bg-[#fbfaf7] p-7 md:grid-cols-2 md:p-10"><div><p className="text-[10px] uppercase tracking-[0.18em] text-[#8a857d]">Contact Form</p><h2 className="mt-4 font-serif text-4xl">{text(data.title) || "Contact"}</h2><p className="mt-4 text-sm leading-7 text-[#77736c]">{text(data.body) || "Your inquiry form will appear here."}</p></div><div className="space-y-3">{["Your name", "WhatsApp", "Wedding date", "Email address", "Message"].map(label => <div key={label} className="h-11 border-b border-[#d8d3ca] text-xs text-[#aaa49b] pt-2">{label}</div>)}<div className="h-10 w-32 bg-[#171717]" /></div></div></section>;
}

function MapPreview({ block }: { block: StoryBlock }) {
  const data = block.data ?? {};
  return <section className="px-6 py-12 md:px-10 md:py-16"><div className="mx-auto max-w-5xl"><p className="text-[10px] uppercase tracking-[0.18em] text-[#77736c]">{text(data.address) || "Map location"}</p><div className="mt-5 flex aspect-[16/7] items-center justify-center bg-[#e8e4dc] text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Google Maps Preview</div></div></section>;
}

function GenericPreview({ block }: { block: StoryBlock }) {
  const data = block.data ?? {};
  return <section className="px-6 py-12 md:px-10 md:py-16"><div className="mx-auto max-w-5xl border border-dashed border-[#d8d3ca] bg-[#fbfaf7] p-10"><p className="text-[10px] uppercase tracking-[0.18em] text-[#8a857d]">{block.type}</p><h2 className="mt-3 font-serif text-4xl">{text(data.title || block.title) || "Block"}</h2><p className="mt-4 text-sm leading-7 text-[#77736c]">{text(data.body || block.body)}</p></div></section>;
}

export default function BlockPreview({ block }: { block: StoryBlock }) {
  const data = block.data ?? {};
  if (block.type === "content") {
    const variant = text(data.variant) || block.variant || "banner-1";
    if (variant === "banner-video") {
      const id = youtubeId(text(data.youtube_url));
      return <section className="px-6 py-12 md:px-10 md:py-16"><div className="mx-auto max-w-5xl overflow-hidden bg-black">{id ? <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" className="aspect-video h-full w-full object-cover" /> : <div className="flex aspect-video items-center justify-center text-xs uppercase tracking-[0.16em] text-white/50">YouTube Video</div>}</div></section>;
    }
    const thumbnail = text(data.thumbnail_url);
    const bannerVariants = ["banner-1", "banner-2", "banner-3"];
    const hasRealMedia = Boolean(block.media?.length);
    if (bannerVariants.includes(variant) && thumbnail && !hasRealMedia) {
      return <div className="overflow-hidden bg-[#e8e4dc]">
        <img src={thumbnail} alt="" className="block h-auto w-full object-cover" />
      </div>;
    }
    return <ContentBlockView variant={variant} data={data} media={block.media ?? []} useThumbnailPreview={false} />;
  }
  if (block.type === "image") return <ImagePreview block={block} />;
  if (block.type === "text") return <TextPreview block={block} />;
  if (block.type === "contact") return <ContactPreview block={block} />;
  if (block.type === "map") return <MapPreview block={block} />;
  return <GenericPreview block={block} />;
}
