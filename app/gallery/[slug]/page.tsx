import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDB } from "../../../lib/db";
import { mediaUrl } from "../../../lib/media";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import GalleryLightbox from "./GalleryLightbox";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
type CollectionRow = { id: string; title: string; slug: string; client_name: string | null; event_date: string | null; description: string | null; seo_title: string | null; seo_description: string | null; destination_name: string | null; destination_slug: string | null; destination_country: string | null; cover_path: string | null; cover_position_x?: number | null; cover_position_y?: number | null };
type MediaRow = { id: string; path: string; type: string; filename: string | null; alt: string | null; width: number | null; height: number | null; sort_order: number };

async function getCollection(slug: string) {
  const db = getDB();
  const collection = await db.prepare(`SELECT c.id,c.title,c.slug,c.client_name,c.event_date,c.description,c.seo_title,c.seo_description,d.name AS destination_name,d.slug AS destination_slug,d.country AS destination_country,(SELECT m.path FROM media m WHERE m.id=c.cover_media_id AND m.type='image') AS cover_path FROM collections c LEFT JOIN destinations d ON d.id=c.destination_id WHERE c.slug=? AND c.published=1`).bind(slug).first<CollectionRow>();
  if (!collection) return null;

  let coverPosition = { x: 50, y: 50 };
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS collection_cover_positions (collection_id TEXT PRIMARY KEY, position_x REAL NOT NULL DEFAULT 50, position_y REAL NOT NULL DEFAULT 50, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
    const position = await db.prepare("SELECT position_x,position_y FROM collection_cover_positions WHERE collection_id=?").bind(collection.id).first<{ position_x: number; position_y: number }>();
    if (position) coverPosition = { x: Number(position.position_x ?? 50), y: Number(position.position_y ?? 50) };
  } catch (error) {
    console.error("Gallery cover position unavailable:", error);
  }

  const media = await db.prepare(`SELECT id,path,type,filename,alt,width,height,sort_order FROM media WHERE collection_id=? ORDER BY sort_order ASC,created_at ASC`).bind(collection.id).all<MediaRow>();
  return { collection: { ...collection, cover_position_x: coverPosition.x, cover_position_y: coverPosition.y }, media: media.results ?? [] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const data = await getCollection(slug); if (!data) return {};
  return { title: data.collection.seo_title || `${data.collection.title} — The Scene Studio`, description: data.collection.seo_description || data.collection.description || `Wedding photography collection by The Scene Studio.` };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params; const data = await getCollection(slug); if (!data) notFound();
  const { collection, media } = data;
  const images = media.filter(item => item.type === "image");
  const cover = collection.cover_path ? mediaUrl(collection.cover_path) : null;

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <Header light />

      <section className="pt-0">
        {cover && (
          <div className="w-full overflow-hidden bg-[#ddd8cf]" style={{ aspectRatio: "16 / 7" }}>
            <img
              src={cover}
              alt={collection.title}
              className="block h-full w-full object-cover"
              style={{ objectPosition: `${collection.cover_position_x ?? 50}% ${collection.cover_position_y ?? 50}%` }}
            />
          </div>
        )}

        <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-12 md:px-10 md:pb-24 md:pt-16">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#77736c]">
            {collection.destination_name ?? "Collection"}
          </p>
          <h1 className="mt-4 max-w-5xl font-serif text-4xl leading-[0.95] tracking-[-0.04em] md:text-5xl">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-6 max-w-2xl text-sm leading-6 text-[#77736c]">
              {collection.description}
            </p>
          )}
          {collection.client_name && (
            <p className="mt-4 text-[10px] uppercase tracking-[0.15em] text-[#77736c]">
              {collection.client_name}{collection.event_date ? ` · ${collection.event_date}` : ""}
            </p>
          )}
        </div>
      </section>

      <section className="w-full px-0 pb-24 md:px-10 md:pb-40">
        <GalleryLightbox
          images={images.map(item => ({
            id: item.id,
            src: mediaUrl(item.path),
            alt: item.alt ?? item.filename ?? collection.title,
          }))}
        />

        {images.length === 0 && (
          <p className="mx-auto max-w-[1180px] border-t border-[#d8d3ca] pt-8 text-sm text-[#77736c]">
            No photos have been added to this collection yet.
          </p>
        )}
      </section>

      <Footer />
    </main>
  );
}
