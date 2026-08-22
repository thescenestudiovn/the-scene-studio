import type { Metadata } from "next";
import Link from "next/link";
import { getDB } from "../../lib/db";
import { mediaUrl } from "../../lib/media";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ destination?: string }> };
type CollectionRow = { id:string;title:string;slug:string;client_name:string|null;destination_name:string|null;destination_slug:string|null;destination_country:string|null;cover_path:string|null;media_count:number };
type DestinationRow = { id:string;name:string;slug:string;country:string };
type GalleryPage = { title:string;seo_title:string|null;seo_description:string|null;eyebrow:string;description:string };

async function getGalleryPage(): Promise<GalleryPage> {
  const db=getDB();
  const page=await db.prepare(`SELECT id,title,seo_title,seo_description FROM pages WHERE slug='gallery' AND published=1 LIMIT 1`).first<{id:string;title:string;seo_title:string|null;seo_description:string|null}>();
  if(!page) return {title:"Gallery",seo_title:"Gallery — The Scene Studio",seo_description:"A living archive of celebrations, destinations and stories photographed around the world.",eyebrow:"Collections",description:"One collection represents one client gallery. Photos are managed inside each collection and can be reused by Stories."};
  const block=await db.prepare(`SELECT data FROM page_blocks WHERE page_id=? AND type='hero' ORDER BY sort_order ASC LIMIT 1`).bind(page.id).first<{data:string}>();
  let data:{eyebrow?:string;body?:string}={};
  if(block?.data){try{data=JSON.parse(block.data) as {eyebrow?:string;body?:string};}catch{data={};}}
  return {title:page.title,seo_title:page.seo_title,seo_description:page.seo_description,eyebrow:data.eyebrow??"",description:data.body??""};
}

export async function generateMetadata(): Promise<Metadata> {
  const page=await getGalleryPage();
  return { title: page.seo_title || `${page.title} — The Scene Studio`, description: page.seo_description || page.description || undefined };
}

export default async function GalleryPage({ searchParams }: Props) {
  const { destination } = await searchParams;
  const db=getDB();
  const [page,result,destinations]=await Promise.all([
    getGalleryPage(),
    db.prepare(`SELECT c.id,c.title,c.slug,c.client_name,d.name AS destination_name,d.slug AS destination_slug,d.country AS destination_country,COALESCE((SELECT m.path FROM media m WHERE m.id=c.cover_media_id AND m.type='image'),(SELECT m.path FROM media m WHERE m.collection_id=c.id AND m.type='image' ORDER BY m.sort_order ASC,m.created_at ASC LIMIT 1)) AS cover_path,(SELECT COUNT(*) FROM media m WHERE m.collection_id=c.id AND m.type='image') AS media_count FROM collections c LEFT JOIN destinations d ON d.id=c.destination_id WHERE c.published=1 ${destination?"AND d.slug=?":""} ORDER BY COALESCE(c.event_date,c.created_at) DESC,c.created_at DESC`).bind(...(destination?[destination]:[])).all<CollectionRow>(),
    db.prepare(`SELECT id,name,slug,country FROM destinations ORDER BY name ASC`).all<DestinationRow>()
  ]);
  const collections=result.results??[]; const destinationList=destinations.results??[]; const activeDestination=destinationList.find(item=>item.slug===destination);
  return <main className="min-h-screen bg-[#f7f5f0] text-[#171717]"><Header light/><section className="px-6 pb-16 pt-36 md:px-10 md:pt-44"><div className="mx-auto max-w-[1180px]"><div className="mx-auto max-w-[700px] text-center"><p className="text-[10px] uppercase tracking-[0.24em] text-[#77736c]">{page.eyebrow}</p><h1 className="mt-5 font-serif text-6xl tracking-[-0.05em] md:text-8xl">{page.title}</h1>{activeDestination&&<p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#77736c]">{activeDestination.name}</p>}<p className="mx-auto mt-6 max-w-[640px] text-sm leading-7 text-[#77736c]">{page.description}</p></div><nav className="mt-12 flex flex-wrap justify-center gap-x-7 gap-y-3 border-t border-[#d8d3ca] pt-5 text-[10px] uppercase tracking-[0.18em]"><Link href="/gallery" className={!destination?"font-medium":"hover:opacity-50"}>All</Link>{destinationList.map(d=><Link key={d.id} href={`/gallery?destination=${encodeURIComponent(d.slug)}`} className={destination===d.slug?"font-medium":"hover:opacity-50"}>{d.name}</Link>)}</nav></div></section><section className="px-6 pb-32 md:px-10 md:pb-48"><div className="mx-auto max-w-[1180px]"><div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{collections.map((collection)=>{const cover=collection.cover_path?mediaUrl(collection.cover_path):null;return <Link key={collection.id} href={`/gallery/${collection.slug}`} className="group block"><div className="relative w-full overflow-hidden bg-[#ddd8cf]" style={{aspectRatio:"4 / 5"}}>{cover&&<img src={cover} alt={collection.title} className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-[1.025]"/>}<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"/><div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between p-5 text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><span className="text-[10px] uppercase tracking-[0.16em]">View collection</span><span>→</span></div></div><div className="mt-4 flex items-start justify-between gap-4"><div><h2 className="font-serif text-2xl tracking-[-0.02em]">{collection.title}</h2><p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#77736c]">{collection.destination_name??""}</p></div><span className="pt-1 text-[10px] text-[#77736c]">{collection.media_count}</span></div></Link>})}</div></div>{collections.length===0&&<div className="mx-auto max-w-[1180px] border-t border-[#d8d3ca] pt-10 text-sm text-[#77736c]">No collections published for this destination yet.</div>}</section><Footer/></main>;
}
