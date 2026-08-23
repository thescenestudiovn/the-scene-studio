import type { Metadata } from "next";
import Link from "next/link";
import { getDB } from "../../lib/db";
import { mediaUrl } from "../../lib/media";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ destination?: string }> };
type CollectionRow = { id:string;title:string;slug:string;client_name:string|null;destination_name:string|null;destination_slug:string|null;destination_country:string|null;cover_path:string|null;cover_width:number|null;cover_height:number|null;media_count:number };
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

async function getCoverPositions(db: D1Database, collectionIds: string[]) {
  const positions = new Map<string, { x:number; y:number }>();
  if (!collectionIds.length) return positions;
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS collection_cover_positions (collection_id TEXT PRIMARY KEY, position_x REAL NOT NULL DEFAULT 50, position_y REAL NOT NULL DEFAULT 50, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
    const result = await db.prepare(`SELECT collection_id,position_x,position_y FROM collection_cover_positions WHERE collection_id IN (${collectionIds.map(()=>"?").join(",")})`).bind(...collectionIds).all<{collection_id:string;position_x:number;position_y:number}>();
    for (const row of result.results ?? []) positions.set(row.collection_id, { x:Number(row.position_x ?? 50), y:Number(row.position_y ?? 50) });
  } catch (error) { console.error("Gallery cover positions unavailable:", error); }
  return positions;
}

function getCropObjectPosition(focusX:number, focusY:number, imageWidth:number|null, imageHeight:number|null, containerWidth:number, containerHeight:number) {
  if (!imageWidth || !imageHeight || imageWidth <= 0 || imageHeight <= 0) return `${focusX}% ${focusY}%`;
  const imageRatio=imageWidth/imageHeight;
  const containerRatio=containerWidth/containerHeight;
  let x=50;
  let y=50;
  if (imageRatio > containerRatio) {
    const visibleFraction=containerRatio/imageRatio;
    const maxOffset=1-visibleFraction;
    x=maxOffset > 0 ? ((focusX/100)-visibleFraction/2)/maxOffset*100 : 50;
    y=focusY;
  } else if (imageRatio < containerRatio) {
    const visibleFraction=imageRatio/containerRatio;
    const maxOffset=1-visibleFraction;
    x=focusX;
    y=maxOffset > 0 ? ((focusY/100)-visibleFraction/2)/maxOffset*100 : 50;
  } else {
    x=50;
    y=50;
  }
  return `${Math.max(0,Math.min(100,x))}% ${Math.max(0,Math.min(100,y))}%`;
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
    db.prepare(`SELECT c.id,c.title,c.slug,c.client_name,d.name AS destination_name,d.slug AS destination_slug,d.country AS destination_country,COALESCE((SELECT m.path FROM media m WHERE m.id=c.cover_media_id AND m.type='image'),(SELECT m.path FROM media m WHERE m.collection_id=c.id AND m.type='image' ORDER BY m.sort_order ASC,m.created_at ASC LIMIT 1)) AS cover_path,COALESCE((SELECT m.width FROM media m WHERE m.id=c.cover_media_id AND m.type='image'),(SELECT m.width FROM media m WHERE m.collection_id=c.id AND m.type='image' ORDER BY m.sort_order ASC,m.created_at ASC LIMIT 1)) AS cover_width,COALESCE((SELECT m.height FROM media m WHERE m.id=c.cover_media_id AND m.type='image'),(SELECT m.height FROM media m WHERE m.collection_id=c.id AND m.type='image' ORDER BY m.sort_order ASC,m.created_at ASC LIMIT 1)) AS cover_height,(SELECT COUNT(*) FROM media m WHERE m.collection_id=c.id AND m.type='image') AS media_count FROM collections c LEFT JOIN destinations d ON d.id=c.destination_id WHERE c.published=1 ${destination?"AND d.slug=?":""} ORDER BY COALESCE(c.event_date,c.created_at) DESC,c.created_at DESC`).bind(...(destination?[destination]:[])).all<CollectionRow>(),
    db.prepare(`SELECT id,name,slug,country FROM destinations ORDER BY name ASC`).all<DestinationRow>()
  ]);
  const collections=result.results??[]; const positions=await getCoverPositions(db,collections.map(item=>item.id)); const destinationList=destinations.results??[]; const activeDestination=destinationList.find(item=>item.slug===destination);
  return <main className="min-h-screen bg-[#f7f5f0] text-[#171717]"><Header light/><section className="px-6 pb-16 pt-36 md:px-10 md:pt-44"><div className="mx-auto max-w-[1180px]"><div className="mx-auto max-w-[700px] text-center"><p className="text-[10px] uppercase tracking-[0.24em] text-[#77736c]">{page.eyebrow}</p><h1 className="mt-5 font-serif text-6xl tracking-[-0.05em] md:text-8xl">{page.title}</h1>{activeDestination&&<p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#77736c]">{activeDestination.name}</p>}<p className="mx-auto mt-6 max-w-[640px] text-sm leading-7 text-[#77736c]">{page.description}</p></div><nav className="mt-12 flex flex-wrap justify-center gap-x-7 gap-y-3 border-t border-[#d8d3ca] pt-5 text-[10px] uppercase tracking-[0.18em]"><Link href="/gallery" className={!destination?"font-medium":"hover:opacity-50"}>All</Link>{destinationList.map(d=><Link key={d.id} href={`/gallery?destination=${encodeURIComponent(d.slug)}`} className={destination===d.slug?"font-medium":"hover:opacity-50"}>{d.name}</Link>)}</nav></div></section><section className="px-6 pb-32 md:px-10 md:pb-48"><div className="mx-auto max-w-[1180px]"><div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{collections.map((collection)=>{const cover=collection.cover_path?mediaUrl(collection.cover_path):null;const focus=positions.get(collection.id)??{x:50,y:50};const objectPosition=getCropObjectPosition(focus.x,focus.y,collection.cover_width,collection.cover_height,4,5);return <Link key={collection.id} href={`/gallery/${collection.slug}`} className="group block"><div className="relative w-full overflow-hidden bg-[#ddd8cf]" style={{aspectRatio:"4 / 5"}}>{cover&&<img src={cover} alt={collection.title} className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-[1.025]" style={{objectPosition}}/>}<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"/><div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between p-5 text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><span className="text-[10px] uppercase tracking-[0.16em]">View collection</span><span>→</span></div></div><div className="mt-4 flex items-start justify-between gap-4"><div><h2 className="font-serif text-2xl tracking-[-0.02em]">{collection.title}</h2><p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#77736c]">{collection.destination_name??""}</p></div><span className="pt-1 text-[10px] text-[#77736c]">{collection.media_count}</span></div></Link>})}</div></div>{collections.length===0&&<div className="mx-auto max-w-[1180px] border-t border-[#d8d3ca] pt-10 text-sm text-[#77736c]">No collections published for this destination yet.</div>}</section><Footer/></main>;
}
