import Link from "next/link";
import { getDB } from "../../lib/db";
import { mediaUrl } from "../../lib/media";

type Block = { id: string; type: string; data: string | Record<string, unknown> };

type PageData = { title: string; seo_title: string | null; seo_description: string | null; blocks: Block[] };

export async function getPage(slug: string): Promise<PageData | null> {
  const db = getDB();
  const page = await db.prepare(`SELECT title,seo_title,seo_description,id FROM pages WHERE slug=? AND published=1`).bind(slug).first<{ id: string; title: string; seo_title: string | null; seo_description: string | null }>();
  if (!page) return null;
  const result = await db.prepare(`SELECT id,type,data FROM page_blocks WHERE page_id=? ORDER BY sort_order ASC`).bind(page.id).all<Block>();
  return { title: page.title, seo_title: page.seo_title, seo_description: page.seo_description, blocks: result.results ?? [] };
}

function parseData(value: string | Record<string, unknown>) {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
}

function text(value: unknown) { return typeof value === "string" ? value : ""; }

export default function PageRenderer({ blocks }: { blocks: Block[] }) {
  return <div>{blocks.map((block) => { const data=parseData(block.data); const type=block.type; const title=text(data.title); const body=text(data.body); const eyebrow=text(data.eyebrow); const url=text(data.url); const image=text(data.image_url); return <section key={block.id} className="px-6 py-20 md:px-10 md:py-32">{type==="text"&&<div className="mx-auto max-w-4xl"><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">{eyebrow}</p>{title&&<h2 className="mt-5 font-serif text-5xl tracking-[-0.03em] md:text-7xl">{title}</h2>}<div className="mt-7 whitespace-pre-line text-sm leading-7 text-[#77736c]">{body}</div></div>}{type==="image"&&image&&<div className="mx-auto max-w-6xl overflow-hidden"><img src={mediaUrl(image)} alt={text(data.alt)||title||"The Scene Studio"} className="h-auto w-full" /></div>}{type==="content"&&<div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12 md:items-end"><div className="md:col-span-7">{eyebrow&&<p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">{eyebrow}</p>}<h2 className="mt-5 font-serif text-5xl leading-[0.95] tracking-[-0.03em] md:text-7xl">{title}</h2></div><div className="md:col-span-4 md:col-start-9 whitespace-pre-line text-sm leading-7 text-[#77736c]">{body}</div></div>}{type==="links"&&<div className="mx-auto max-w-6xl border-t border-[#d8d3ca] pt-6">{title&&<h2 className="font-serif text-4xl">{title}</h2>}<div className="mt-6 flex flex-wrap gap-6">{(Array.isArray(data.links)?data.links:[]).map((item,index)=>{const link=typeof item==="object"&&item!==null?item as Record<string,unknown>:{};return <Link key={index} href={text(link.url)||"#"} className="text-xs uppercase tracking-[0.15em] hover:opacity-50">{text(link.label)||"Link"} →</Link>})}</div></div>}{type==="video"&&url&&<div className="mx-auto max-w-6xl"><div className="aspect-video overflow-hidden bg-black"><iframe src={url} title={title||"The Scene Studio film"} className="h-full w-full" allowFullScreen /></div></div>}{type==="blog"&&<div className="mx-auto max-w-6xl"><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">Stories</p><h2 className="mt-4 font-serif text-5xl">{title||"Stories"}</h2><Link href="/stories" className="mt-6 inline-block text-xs uppercase tracking-[0.15em]">View stories →</Link></div>}{type==="contact"&&<div className="mx-auto max-w-6xl border-y border-[#d8d3ca] py-16"><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">Contact</p><h2 className="mt-5 max-w-3xl font-serif text-5xl tracking-[-0.03em] md:text-7xl">{title||"Let's create something meaningful."}</h2><Link href={url||"/contact"} className="mt-8 inline-block text-xs uppercase tracking-[0.15em]">{text(data.label)||"Get in touch"} →</Link></div>}{type==="social"&&<div className="mx-auto max-w-6xl"><p className="text-xs uppercase tracking-[0.2em] text-[#77736c]">{eyebrow||"Follow"}</p><div className="mt-5 flex flex-wrap gap-6">{(Array.isArray(data.links)?data.links:[]).map((item,index)=>{const link=typeof item==="object"&&item!==null?item as Record<string,unknown>:{};return <a key={index} href={text(link.url)||"#"} className="text-sm hover:opacity-50">{text(link.label)||"Social"}</a>})}</div></div>}{type==="flex"&&<div className="mx-auto max-w-6xl">{image&&<img src={mediaUrl(image)} alt={text(data.alt)||title||""} className="mb-8 w-full" />}<h2 className="font-serif text-5xl">{title}</h2><div className="mt-5 whitespace-pre-line text-sm leading-7 text-[#77736c]">{body}</div></div>}{type==="others"&&<div className="mx-auto max-w-6xl"><h2 className="font-serif text-4xl">{title}</h2><div className="mt-5 whitespace-pre-line text-sm leading-7 text-[#77736c]">{body}</div></div>}</section>; })}</div>;
}
