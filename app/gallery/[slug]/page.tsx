import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "../../../lib/db";
import { mediaUrl } from "../../../lib/media";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
type CollectionRow = { id: string; title: string; slug: string; client_name: string | null; event_date: string | null; description: string | null; seo_title: string | null; seo_description: string | null; destination_name: string | null; destination_slug: string | null; destination_country: string | null; cover_path: string | null; cover_position_x: number; cover_position_y: number };
type MediaRow = { id: string; path: string; type: string; filename: string | null; alt: string | null; width: number | null; height: number | null; sort_order: number };

async function getCollection(slug: string) {
  const db = getDB();
  const collection = await db.prepare(`SELECT c.id,c.title,c.slug,c.client_name,c.event_date,c.description,c.seo_title,c.seo_description,d.name AS destination_name,d.slug AS destination_slug,d.country AS destination_country,COALESCE((SELECT m.path FROM media m WHERE m.id=c.cover_media_id AND m.type='image'),(SELECT m.path FROM media m WHERE m.collection_id=c.id AND m.type='image' ORDER BY m.sort_order ASC,m.created_at ASC LIMIT 1)) AS cover_path,COALESCE((SELECT p.position_x FROM collection_cover_positions p WHERE p.collection_id=c.id),50) AS cover_position_x,COALESCE((SELECT p.position_y FROM collection_cover_positions p WHERE p.collection_id=c.id),50) AS cover_position_y FROM collections c LEFT JOIN destinations d ON d.id=c.destination_id WHERE c.slug=? AND c.published=1`).bind(slug).first<CollectionRow>();
  if (!collection) return null;
  const media = await db.prepare(`SELECT id,path,type,filename,alt,width,height,sort_order FROM media WHERE collection_id=? ORDER BY sort_order ASC,created_at ASC`).bind(collection.id).all<MediaRow>();
  return { collection, media: media.results ?? [] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const data = await getCollection(slug); if (!data) return {};
  return { title: data.collection.seo_title || `${data.collection.title} — The Scene Studio`, description: data.collection.seo_description || data.collection.description || `Wedding photography collection by The Scene Studio.` };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params; const data = await getCollection(slug); if (!data) notFound();
  const { collection, media } = data; const images = media.filter(item=>item.type === "image");
  const cover = collection.cover_path ? mediaUrl(collection.cover_path) : null;

  return <main className="min-h-screen bg-[#f7f5f0] text-[#171717]"><Header light />
    <section className="px-6 pb-16 pt-36 md:px-10 md:pt-44">
      <div className="mx-auto max-w-[1180px]">
        <Link href="/gallery" className="text-[10px] uppercase tracking-[0.18em] text-[#77736c] hover:opacity-50">← Gallery</Link>
        <div className="mt-10 overflow-hidden bg-[#ddd8cf]" style={{ aspectRatio: "16 / 7" }}>
          {cover && <img src={cover} alt={collection.title} className="h-full w-full object-cover" style={{ objectPosition: `${collection.cover_position_x}% ${collection.cover_position_y}%` }} />}
        </div>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
          <div><p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">{collection.destination_name ?? "Collection"}</p><h1 className="mt-4 max-w-5xl font-serif text-6xl leading-[0.9] tracking-[-0.05em] md:text-8xl">{collection.title}</h1></div>
          <div className="max-w-sm text-sm leading-6 text-[#77736c]">{collection.description && <p>{collection.description}</p>}{collection.client_name && <p className="mt-4 text-[10px] uppercase tracking-[0.15em]">{collection.client_name}{collection.event_date ? ` · ${collection.event_date}` : ""}</p>}</div>
        </div>
      </div>
    </section>
    <section className="px-6 pb-32 md:px-10 md:pb-48"><div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{images.map(item => <figure key={item.id}><img src={mediaUrl(item.path)} alt={item.alt ?? item.filename ?? collection.title} className="block h-auto w-full object-cover" /></figure>)}</div>{images.length === 0 && <p className="mx-auto max-w-[1180px] border-t border-[#d8d3ca] pt-8 text-sm text-[#77736c]">No photos have been added to this collection yet.</p>}</section>
    <Footer />
  </main>;
}
