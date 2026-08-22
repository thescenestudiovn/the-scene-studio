import type { Metadata } from "next";
import Link from "next/link";
import { getDB } from "../../lib/db";
import { mediaUrl } from "../../lib/media";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Gallery — The Scene Studio",
  description: "Destination wedding photography collections by The Scene Studio.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const db = getDB();
  const result = await db.prepare(`
    SELECT c.id, c.title, c.slug, d.name AS destination_name,
      (SELECT m.path FROM media m WHERE m.collection_id = c.id AND m.type = 'image' ORDER BY m.sort_order ASC, m.created_at ASC LIMIT 1) AS cover_path
    FROM collections c
    LEFT JOIN destinations d ON d.id = c.destination_id
    ORDER BY c.created_at DESC
  `).all();

  const destinations = await db.prepare(`
    SELECT id, name, slug, country
    FROM destinations
    ORDER BY name ASC
  `).all();

  const collections = (result.results ?? []) as Array<Record<string, unknown>>;
  const destinationList = (destinations.results ?? []) as Array<Record<string, unknown>>;

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <Header light />
      <section className="px-6 pb-20 pt-40 md:px-10 md:pt-52">
        <div className="mx-auto max-w-7xl">
          <p className="font-sans text-xs tracking-[0.2em] uppercase">Gallery</p>
          <h1 className="mt-8 max-w-4xl font-serif text-6xl leading-[0.9] tracking-[-0.04em] md:text-8xl">
            Collections
          </h1>
          <p className="mt-8 max-w-xl font-sans text-sm leading-7 text-[#77736c]">
            A collection of celebrations photographed by The Scene Studio.
          </p>

          <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#d8d3ca] pt-6 font-sans text-xs tracking-[0.15em] uppercase">
            <Link href="/gallery" className="transition-opacity hover:opacity-50">All</Link>
            {destinationList.map((destination) => (
              <Link
                key={String(destination.id)}
                href={`/destinations/${String(destination.country)}/${String(destination.slug)}`}
                className="transition-opacity hover:opacity-50"
              >
                {String(destination.name)}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="px-6 pb-32 md:px-10 md:pb-48">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const cover = collection.cover_path ? mediaUrl(String(collection.cover_path)) : null;
            return (
              <Link key={String(collection.id)} href={`/gallery/${String(collection.slug)}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ddd8cf]">
                  {cover && (
                    <img src={cover} alt={String(collection.title)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                  )}
                </div>
                <div className="mt-5 flex items-start justify-between gap-6">
                  <div>
                    <h2 className="font-serif text-2xl tracking-[-0.02em]">{String(collection.title)}</h2>
                    {collection.destination_name && (
                      <p className="mt-2 font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">{String(collection.destination_name)}</p>
                    )}
                  </div>
                  <span className="font-sans text-xs uppercase">→</span>
                </div>
              </Link>
            );
          })}
        </div>
        {collections.length === 0 && (
          <div className="mx-auto max-w-7xl border-t border-[#d8d3ca] pt-10 font-sans text-sm text-[#77736c]">
            No collections published yet.
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
