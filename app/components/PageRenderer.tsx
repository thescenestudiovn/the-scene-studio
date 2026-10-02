import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { getDB } from "../../lib/db";
import { mediaUrl } from "../../lib/media";
import { blockLayout, blockGrid, imageBlockContainer } from "../../components/content/blockLayout";
import ContactForm from "../contact/ContactForm";

type Media = { id: string; path: string; filename?: string | null; alt?: string | null; width?: number | null; height?: number | null };
type Block = { id: string; type: string; data: string | Record<string, unknown>; media?: Media[] };
type PageData = { title: string; seo_title: string | null; seo_description: string | null; blocks: Block[] };

export async function getPage(slug: string): Promise<PageData | null> {
    const db = getDB();
    const page = await db.prepare(`SELECT title,seo_title,seo_description,id FROM pages WHERE slug=? AND published=1`).bind(slug).first<{ id: string; title: string; seo_title: string | null; seo_description: string | null }>();
    if (!page) return null;
    const result = await db.prepare(`SELECT id,type,data FROM page_blocks WHERE page_id=? ORDER BY sort_order ASC`).bind(page.id).all<Block>();
    const media = await db.prepare(`SELECT id,path,filename,alt,width,height FROM media`).all<Media>();
    const mediaById = new Map((media.results ?? []).map(item => [item.id, item]));
    const blocks = (result.results ?? []).map(block => {
        const data = parseData(block.data);
        const ids = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string") : [];
        return { ...block, media: ids.map(id => mediaById.get(id)).filter((item): item is Media => Boolean(item)) };
    });
    return { title: page.title, seo_title: page.seo_title, seo_description: page.seo_description, blocks };
}

function parseData(value: string | Record<string, unknown>) { if (typeof value !== "string") return value; try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {}; } catch { return {}; } }
function text(value: unknown) { return typeof value === "string" ? value : ""; }
function imageSrc(value: string) { return /^https?:\/\//i.test(value) || value.startsWith("/") ? value : mediaUrl(value); }
function youtubeId(value: string) { try { const url = new URL(value); if (url.hostname === "youtu.be") return url.pathname.slice(1); if (url.hostname.includes("youtube.com")) return url.searchParams.get("v") || url.pathname.split("/").pop() || ""; } catch { } return ""; }
function imageCount(variant: string) { return variant === "columns-2" || variant === "text-columns-2" ? 2 : variant === "columns-3" || variant === "text-columns-3" ? 3 : variant === "columns-4" || variant === "text-columns-4" ? 4 : 1; }

const richTextOptions: sanitizeHtml.IOptions = {
    allowedTags: ["a", "b", "blockquote", "br", "div", "em", "font", "h1", "h2", "h3", "i", "li", "ol", "p", "span", "strong", "u", "ul"],
    allowedAttributes: { a: ["href", "target", "rel"], "*": ["class", "style", "align"], font: ["color"] },
    allowedClasses: {
        h1: ["text-5xl", "font-serif", "leading-[1.08]"],
        h2: ["text-4xl", "font-serif", "leading-[1.12]"],
        h3: ["text-3xl", "font-serif", "leading-[1.16]"],
        p: ["text-xl", "text-base", "text-sm", "leading-8", "leading-7", "leading-6"],
    },
    allowedStyles: {
        "*": {
            color: [/^#[\da-f]{3,8}$/i],
            "text-align": [/^(left|center|right|justify)$/],
            "font-weight": [/^(normal|bold|[1-9]00)$/],
            "font-style": [/^(normal|italic)$/],
            "text-decoration": [/^(none|underline|line-through)$/],
        },
    },
};

function CoverBlock({ data, media }: { data: Record<string, unknown>; media: Media[] }) {
    const image = media[0];
    const title = text(data.title);
    const body = text(data.body);
    const contained = text(data.variant) === "cover-contained";
    return <section className={`relative overflow-hidden ${contained ? blockLayout.section.compact : "w-full"}`}><div className={`relative overflow-hidden bg-[#ddd8cf] ${contained ? `mx-auto ${blockLayout.container.medium}` : "w-full"}`}><div className={blockLayout.image.cover}>{image ? <img src={mediaUrl(image.path)} alt={image.alt || image.filename || title || "The Scene Studio"} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[#ddd8cf]" />}</div><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-6 pb-7 pt-24 text-white md:px-10 md:pb-10"><p className="text-xs uppercase tracking-[0.2em] text-white/80">{text(data.eyebrow) || "The Scene Studio"}</p>{title && <h1 className="mt-4 font-serif text-4xl leading-none md:text-7xl">{title}</h1>}{body && <p className="mt-4 max-w-md whitespace-pre-line text-sm leading-6 text-white/85">{body}</p>}</div></div></section>;
}

function ImageBlock({ data, media }: { data: Record<string, unknown>; media: Media[] }) {
    const variant = text(data.variant) || "large";
    const title = text(data.title);
    const eyebrow = text(data.eyebrow);
    const body = text(data.body);
    const fallback = text(data.image_url);
    const images = Array.from({ length: imageCount(variant) }, (_, index) => media[index]);
    const image = (item: Media | undefined, className = "h-full w-full object-cover") => item ? <img src={mediaUrl(item.path)} alt={item.alt || item.filename || title || "The Scene Studio"} className={className} /> : fallback ? <img src={imageSrc(fallback)} alt={title || "The Scene Studio"} className={className} /> : <div className="h-full w-full bg-[#ebe7df]" />;
    const copy = (item?: Record<string, unknown>) => <>{item?.title && <h3 className="font-serif text-2xl">{text(item.title)}</h3>}{item?.text && <p className="mt-2 text-sm leading-7 text-[#77736c]">{text(item.text)}</p>}</>;
    const items = Array.isArray(data.items) ? data.items.map(item => item && typeof item === "object" ? item as Record<string, unknown> : {}) : [];

    if (variant.startsWith("text-overlay")) return <section className={blockLayout.section.compact}><div className={`relative mx-auto ${blockLayout.container.wide} overflow-hidden`}><div className="aspect-[16/9]">{image(images[0])}</div><div className="absolute inset-0 bg-black/25" /><div className="absolute inset-x-0 bottom-0 max-w-2xl p-7 text-white md:p-12">{eyebrow && <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/75">{eyebrow}</p>}{title && <h2 className="font-serif text-4xl md:text-6xl">{title}</h2>}{body && <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/85">{body}</p>}</div></div></section>;
    if (variant.startsWith("text-columns")) return <section className="px-6 py-16 md:px-10 md:py-24"><div className={`mx-auto grid ${blockLayout.container.wide} gap-8 ${blockGrid[images.length as 2 | 3 | 4]}`}>{images.map((item, index) => <article key={item?.id ?? index}><div className={`${blockLayout.image.standard} overflow-hidden`}>{image(item)}</div><div className="pt-5">{copy(items[index])}</div></article>)}</div></section>;
    if (variant.startsWith("text-below")) return <section className="px-6 py-16 md:px-10 md:py-24"><article className={`mx-auto ${blockLayout.container.medium}`}><div className={`${blockLayout.image.standard} overflow-hidden`}>{image(images[0])}</div><div className="pt-6">{copy(items[0] ?? { title, text: body })}</div></article></section>;
    if (variant.startsWith("text-left") || variant.startsWith("text-right")) { const left = variant.startsWith("text-left"); return <section className="px-6 py-16 md:px-10 md:py-24"><div className={`mx-auto grid ${blockLayout.container.wide} items-center gap-10 md:grid-cols-2`}><div className={left ? "md:order-1" : "md:order-2"}><div className="aspect-[4/3] overflow-hidden">{image(images[0])}</div></div><div className={left ? "md:order-2" : "md:order-1"}>{copy(items[0] ?? { title, text: body })}</div></div></section>; }
    if (variant === "slideshow" || variant === "carousel") return <section className="px-6 py-16 md:px-10 md:py-24"><div className={`mx-auto flex ${blockLayout.container.wide} gap-4 overflow-hidden`}>{media.map(item => <div key={item.id} className={`${blockLayout.gallery.carouselItem} shrink-0`}><img src={mediaUrl(item.path)} alt={item.alt || item.filename || "The Scene Studio"} className={`${blockLayout.gallery.carouselHeight} w-full object-cover`} /></div>)}</div></section>;
    return <section className="px-6 py-16 md:px-10 md:py-24"><div className={`mx-auto ${imageBlockContainer(variant)} overflow-hidden`}>{image(images[0], "h-auto w-full object-cover")}</div></section>;
}

function TextBlock({ data }: { data: Record<string, unknown> }) {
    const variant = text(data.variant) || "regular";
    const title = text(data.title);
    const count = imageCount(variant);
    const columns = Array.isArray(data.columns) ? data.columns.map(item => typeof item === "object" && item !== null && "content" in item ? String((item as { content?: unknown }).content ?? "") : String(item ?? "")) : [];
    const isColumns = variant === "columns-2" || variant === "columns-3" || variant === "columns-4";
    const width = variant === "narrow" ? "max-w-2xl" : isColumns ? blockLayout.container.wide : blockLayout.container.medium;
    const bodyStyle = variant === "heading-1" ? "font-serif text-5xl leading-[1.08]" : variant === "heading-2" ? "font-serif text-4xl leading-[1.12]" : variant === "heading-3" ? "font-serif text-3xl leading-[1.16]" : variant === "wide" ? "text-xl leading-8" : variant === "narrow" || variant === "regular" ? "text-base leading-7" : "text-sm leading-6";
    const body = sanitizeHtml(text(data.body), richTextOptions);
    return <section className={blockLayout.section.spacious}><div className={`mx-auto ${width}`}>
        {text(data.eyebrow) && <p className={blockLayout.typography.eyebrow}>{text(data.eyebrow)}</p>}
        {title && <h2 className={`mt-5 ${blockLayout.typography.heading}`}>{title}</h2>}
        {isColumns ? <div className={`mt-7 grid gap-8 ${count === 2 ? "md:grid-cols-2" : count === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>{Array.from({ length: count }, (_, index) => <div key={index} className="min-w-0 text-base leading-7 text-[#77736c]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(columns[index] ?? "", richTextOptions) }} />)}</div> : body && <div className={`mt-7 whitespace-pre-wrap text-[#77736c] ${bodyStyle}`} dangerouslySetInnerHTML={{ __html: body }} />}
    </div></section>;
}

function ContactBlock({ data, media }: { data: Record<string, unknown>; media: Media[] }) {
    const title = text(data.title);
    const body = text(data.body);
    const variant = text(data.variant) as import("../../components/story/picker/blockTypes").ContactBlockVariant;
    return (
        <ContactForm
            variant={variant || "form-1"}
            title={title}
            body={body}
            image={media[0] ? mediaUrl(media[0].path) : text(data.image_url)}
            blockMode
        />
    );
}

function MapBlock({ data }: { data: Record<string, unknown> }) {
    const address = text(data.address);
    const embedUrl = text(data.embed_url);
    const variant = text(data.variant) || "map-1-regular";
    const full = variant === "map-1-full";
    return (
        <section className={full ? "px-0 py-16 md:py-24" : "px-6 py-16 md:px-10 md:py-24"}>
            <div className={`mx-auto ${full ? "w-full" : blockLayout.container.content}`}>
                {address && <p className="mb-6 text-xs uppercase tracking-[0.16em] text-[#77736c]">{address}</p>}
                {embedUrl ? (
                    <div className="aspect-[16/9] overflow-hidden bg-[#e8e4dc]">
                        <iframe src={embedUrl} title={address || "The Scene Studio location"} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                    </div>
                ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-[#e8e4dc] text-xs uppercase tracking-[0.14em] text-[#8a857d]">
                        Add a Google Maps embed URL
                    </div>
                )}
            </div>
        </section>
    );
}
export default function PageRenderer({ blocks }: { blocks: Block[] }) {
    const renderedBlocks = blocks.map(block => {
        const data = parseData(block.data);
        const type = block.type;
        const url = text(data.youtube_url) || text(data.url);
        const title = text(data.title);
        if (type === "cover") return <CoverBlock key={block.id} data={data} media={block.media ?? []} />;
        if (type === "image") return <ImageBlock key={block.id} data={data} media={block.media ?? []} />;
        if (type === "text") return <TextBlock key={block.id} data={data} />;
        if (type === "contact") return <ContactBlock key={block.id} data={data} media={block.media ?? []} />;
        if (type === "map") return <MapBlock key={block.id} data={data} />;
        if (type === "content" && text(data.variant) === "banner-video" && url) {
            const id = youtubeId(url);
            return id ? <section key={block.id} className="px-6 py-16 md:px-10 md:py-24"><div className={`mx-auto ${blockLayout.container.content} overflow-hidden bg-black`}><div className="aspect-video"><iframe className="h-full w-full" src={`https://www.youtube.com/embed/${id}`} title={title || "The Scene Studio film"} allowFullScreen /></div></div></section> : null;
        }
        if (type === "content") return <section key={block.id} className="px-6 py-20 md:px-10 md:py-32"><div className={`mx-auto grid ${blockLayout.container.content} gap-10 md:grid-cols-12 md:items-end`}><div className="md:col-span-7"><p className={blockLayout.typography.eyebrow}>{text(data.eyebrow)}</p><h2 className={`mt-5 ${blockLayout.typography.display} leading-[0.95]`}>{title}</h2></div><div className="whitespace-pre-line text-sm leading-7 text-[#77736c] md:col-span-4 md:col-start-9">{text(data.body)}</div></div></section>;
        if (type === "links") return <section key={block.id} className="px-6 py-16 md:px-10 md:py-24"><div className={`mx-auto ${blockLayout.container.content} border-t border-[#d8d3ca] pt-6`}><h2 className="font-serif text-4xl">{title}</h2><div className="mt-6 flex flex-wrap gap-6">{(Array.isArray(data.links) ? data.links : []).map((item, index) => { const link = item && typeof item === "object" ? item as Record<string, unknown> : {}; return <Link key={index} href={text(link.url) || "#"} className="text-xs uppercase tracking-[0.15em]">{text(link.label) || "Link"} →</Link>; })}</div></div></section>;
        return null;
    });
    return <div>{renderedBlocks}</div>;
}