import Link from "next/link";
import { getDB } from "../../lib/db";
import { mediaUrl } from "../../lib/media";

type Media = { id: string; path: string; filename?: string | null; alt?: string | null; width?: number | null; height?: number | null };
type Block = { id: string; type: string; data: string | Record<string, unknown>; media?: Media[] };
type PageData = { title: string; seo_title: string | null; seo_description: string | null; blocks: Block[] };

export async function getPage(slug: string): Promise<PageData | null> {
  const db = getDB();
  const page = await db.prepare(`SELECT title,seo_title,seo_description,id FROM pages WHERE slug=? AND published=1`).bind(slug).first<{ id: string; title: string; seo_title: string | null; seo_description: string | null }>();
  if (!page) return null;

  const result = await db.prepare(`SELECT id,type,data FROM page_blocks WHERE page_id=? ORDER BY sort_order ASC`).bind(page.id).all<Block>();
  const blocks = await Promise.all((result.results ?? []).map(async (block) => {
    const data = parseData(block.data);
    const mediaIds = Array.isArray(data.media_ids) ? data.media_ids.filter((id): id is string => typeof id === "string" && id.length > 0) : [];
    const media = mediaIds.length
      ? (await db.prepare(`SELECT id,path,filename,alt,width,height FROM media WHERE id IN (${mediaIds.map(() => "?").join(",")})`).bind(...mediaIds).all<Media>()).results ?? []
      : [];
    const byId = new Map(media.map(item => [item.id, item]));
    return { ...block, data, media: mediaIds.map(id => byId.get(id)).filter((item): item is Media => Boolean(item)) };
  }));

  return { title: page.title, seo_title: page.seo_title, seo_description: page.seo_description, blocks };
}

function parseData(value: string | Record<string, unknown>) {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
}
function text(value: unknown) { return typeof value === "string" ? value : ""; }
function imageSrc(value: string) { return /^https?:\/\//i.test(value) || value.startsWith("/") ? value : mediaUrl(value); }

function BlockMedia({ block, className = "h-auto w-full", alt = "" }: { block: Block; className?: string; alt?: string }) {
  const first = block.media?.[0];
  return first ? <img src={imageSrc(first.path)} alt={first.alt || alt} className={className} /> : null;
}

export default function PageRenderer({ blocks }: { blocks: Block[] }) {
  return <div>{blocks.map(block => {
    const data = parseData(block.data);
    const type = block.type;
    const title = text(data.title);
    const body = text(data.body);
    const eyebrow = text(data.eyebrow);
    const url = text(data.url);
    const image = text(data.image_url);

    return <section key={block.id} className="px-6 py-20 md:px-10 md:py-32">
      {type === "cover" && <div className="relative mx-auto max-w-7xl overflow-hidden bg-[#ddd8cf]">
        <div className="aspect-[16/7]">
          {block.media?.[0] && <BlockMedia block={block} className="h-full w-full object-cover" alt={title || "The Scene Studio"} />}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white md:p-10">
          <p className="text-xs uppercase tracking-[0.2em]">{eyebrow || "Vietnam · Worldwide"}</p>
          <h1 className="mt-3 font-serif text-4xl tracking-[-0.03em] md:text-7xl">{title || "The Scene Studio"}</h1>
          {body && <p className="mt-4 max-w-xl text-sm leading-6">{body}</p>}
        </div>
      </div>}

      {type === "text" && <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">{eyebrow}</p>
        {title && <h2 className="mt-5 font-serif text-5xl tracking-[-0.03em] md:text-7xl">{title}</h2>}
        <div className="mt-7 whitespace-pre-line text-sm leading-7 text-[#77736c]">{body}</div>
      </div>}

      {type === "image" && <div className="mx-auto max-w-6xl overflow-hidden">
        {block.media?.length ? <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(block.media.length, 4)}, minmax(0, 1fr))` }}>
          {block.media.map(item => <img key={item.id} src={imageSrc(item.path)} alt={item.alt || title || "The Scene Studio"} className="h-auto w-full object-cover" />)}
        </div> : image && <img src={imageSrc(image)} alt={text(data.alt) || title || "The Scene Studio"} className="h-auto w-full" />}
      </div>}

      {type === "content" && <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">{eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">{eyebrow}</p>}<h2 className="mt-5 font-serif text-5xl leading-[0.95] tracking-[-0.03em] md:text-7xl">{title}</h2></div>
        <div className="whitespace-pre-line text-sm leading-7 text-[#77736c] md:col-span-4 md:col-start-9">{body}</div>
      </div>}

      {type === "links" && <div className="mx-auto max-w-6xl border-t border-[#d8d3ca] pt-6"><p className="font-serif text-4xl">{title}</p><div className="mt-6 flex flex-wrap gap-6">{(Array.isArray(data.links) ? data.links : []).map((item,index) => { const link = typeof item === "object" && item !== null ? item as Record<string,unknown> : {}; return <Link key={index} href={text(link.url) || "#"} className="text-xs uppercase tracking-[0.15em] hover:opacity-50">{text(link.label) || "Link"} →</Link>; })}</div></div>}

      {type === "video" && url && <div className="mx-auto max-w-6xl"><div className="aspect-video overflow-hidden bg-black"><iframe src={url} title={title || "The Scene Studio film"} className="h-full w-full" allowFullScreen /></div></div>}
      {type === "blog" && <div className="mx-auto max-w-6xl"><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">{eyebrow || "Stories"}</p><h2 className="mt-4 font-serif text-5xl">{title || "Recent stories"}</h2><Link href="/stories" className="mt-6 inline-block text-xs uppercase tracking-[0.15em]">View stories →</Link></div>}
      {type === "contact" && <div className="mx-auto max-w-6xl border-y border-[#d8d3ca] py-16"><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">Contact</p><h2 className="mt-5 max-w-3xl font-serif text-5xl tracking-[-0.03em] md:text-7xl">{title || "Let's create something meaningful."}</h2><Link href={url || "/contact"} className="mt-8 inline-block text-xs uppercase tracking-[0.15em]">{text(data.label) || "Get in touch"} →</Link></div>}
      {type === "social" && <div className="mx-auto max-w-6xl"><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">{eyebrow || "Follow"}</p><div className="mt-5 flex flex-wrap gap-6">{(Array.isArray(data.links) ? data.links : []).map((item,index) => { const link = typeof item === "object" && item !== null ? item as Record<string,unknown> : {}; return <a key={index} href={text(link.url) || "#"} className="text-sm hover:opacity-50">{text(link.label) || "Social"}</a>; })}</div></div>}
      {type === "flex" && <div className="mx-auto max-w-6xl">{block.media?.[0] ? <BlockMedia block={block} className="mb-8 h-auto w-full" alt={text(data.alt) || title} /> : image && <img src={imageSrc(image)} alt={text(data.alt) || title || ""} className="mb-8 w-full" />}<h2 className="font-serif text-5xl">{title}</h2><div className="mt-5 whitespace-pre-line text-sm leading-7 text-[#77736c]">{body}</div></div>}
      {type === "others" && <div className="mx-auto max-w-6xl"><h2 className="font-serif text-4xl">{title}</h2><div className="mt-5 whitespace-pre-line text-sm leading-7 text-[#77736c]">{body}</div></div>}
    </section>;
  })}</div>;
}
