import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDB } from "../../../lib/db";
import { mediaUrl } from "../../../lib/media";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getCollection(slug: string) {
  const db = getDB();
  const collection = await db.prepare(`
    SELECT c.*, d.name AS destination_name, d.slug AS destination_slug, d.country AS destination_country
    FROM collections c
    LEFT JOIN destinations d ON d.id = c.destination_id
    WHERE c.slug = ?
  `).bind(slug).first();
  if (!collection) return null;
  const media = await db.prepare(`
    SELECT id, path, type, filename, alt, width, height, sort_order
    FROM media
    WHERE collection_id = ?
    ORDER BY sort_order ASC, created_at ASC
  `).bind(collection.id).all();
  return { collection: collection as Record<string, unknown>, media: (media.results ?? []) as Array<Record<string, unknown>> };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCollection(slug);
  if (!data) return {};
  return {
    title: `${String(data.collection.title)} — The Scene Studio`,
    description: String(data.collection.description ?? `Wedding photography collection by The Scene Studio.`),
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCollection(slug);
  if (!data) notFound();
  const { collection, media } = data;

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <Header light />
      <section className="px-6 pb-20 pt-40 md:px-10 md:pt-52">
        <div className="mx-auto max-w-7xl">
          <Link href="/gallery" className="font-sans text-xs tracking-[0.15em] uppercase text-[#77736c] hover:opacity-50">← Gallery</Link>
          <p className="mt-12 font-sans text-xs tracking-[0.2em] uppercase">{String(collection.destination_name ?? "Collection")}</p>
          <h1 className="mt-5 max-w-5xl font-serif text-6xl leading-[0.9] tracking-[-0.04em] md:text-8xl">{String(collection.title)}</h1>
          {collection.description && <p className="mt-8 max-w-2xl font-sans text-sm leading-7 text-[#77736c]">{String(collection.description)}</p>}
        </div>
      </section>
      <section className="px-6 pb-32 md:px-10 md:pb-48">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 md:grid-cols-2">
          {media.filter((item) => item.type === "image").map((item) => (
            <div key={String(item.id)} className="relative overflow-hidden bg-[#ddd8cf]">
              <img src={mediaUrl(String(item.path))} alt={String(item.alt ?? item.filename ?? collection.title)} className="block h-auto w-full" />
            </div>
          ))}
        </div>
        {media.length === 0 && <p className="mx-auto max-w-7xl border-t border-[#d8d3ca] pt-8 font-sans text-sm text-[#77736c]">No media has been added to this collection yet.</p>}
      </section>
      <Footer />
    </main>
  );
}
