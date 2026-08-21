import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { stories as legacyStories } from "../../data/stories";
import { destinations } from "../../data/destinations";
import { mediaUrl } from "../../lib/media";

const baseUrl = "https://thescenestudio.asia";

export const metadata: Metadata = {
    title: "Wedding Stories — The Scene Studio",
    description: "Explore intimate destination wedding stories photographed and filmed by The Scene Studio across Da Nang, Hoi An, and Vietnam.",
    alternates: { canonical: `${baseUrl}/stories` },
    openGraph: { title: "Wedding Stories — The Scene Studio", description: "Explore intimate destination wedding stories photographed and filmed by The Scene Studio across Vietnam.", url: `${baseUrl}/stories`, type: "website", siteName: "The Scene Studio", locale: "en_US" },
    twitter: { card: "summary_large_image", title: "Wedding Stories — The Scene Studio", description: "Explore intimate destination wedding stories photographed and filmed by The Scene Studio across Vietnam." },
    robots: { index: true, follow: true },
};

type DbStory = {
    slug: string;
    title: string;
    location: string | null;
    description: string | null;
    category: string | null;
    cover_path: string | null;
    destination_slug: string | null;
    destination_country: string | null;
    destination_name: string | null;
};

type DbStorySlug = { slug: string };

async function getDB(): Promise<D1Database> {
    const { env } = await getCloudflareContext({ async: true });
    return env.the_scene_studio_db;
}

async function getPublishedStories(): Promise<DbStory[]> {
    const db = await getDB();
    const result = await db.prepare(`
        SELECT s.slug, s.title, s.location, s.description, s.category,
               m.path AS cover_path,
               d.slug AS destination_slug,
               d.country AS destination_country,
               d.name AS destination_name
        FROM stories s
        LEFT JOIN media m ON m.id = s.cover_media_id
        LEFT JOIN destinations d ON d.id = s.destination_id
        WHERE s.published = 1
        ORDER BY COALESCE(s.date, s.created_at) DESC, s.created_at DESC
    `).all<DbStory>();
    return result.results || [];
}

async function getDbStorySlugs(): Promise<Set<string>> {
    const db = await getDB();
    const result = await db.prepare(`SELECT slug FROM stories`).all<DbStorySlug>();
    return new Set((result.results || []).map((story) => story.slug));
}

export default async function StoriesPage() {
    const [dbStories, dbStorySlugs] = await Promise.all([getPublishedStories(), getDbStorySlugs()]);

    const publishedItems = dbStories.filter((story) => story.cover_path).map((story) => ({
        slug: story.slug,
        title: story.title,
        location: story.location || "",
        description: story.description || "",
        category: story.category || "",
        coverImage: story.cover_path as string,
        destination: story.destination_slug,
        destinationName: story.destination_name,
        destinationCountry: story.destination_country,
    }));

    const legacyItems = legacyStories.filter((story) => !dbStorySlugs.has(story.slug)).map((story) => ({
        slug: story.slug,
        title: story.title,
        location: story.location,
        description: story.description,
        category: story.category,
        coverImage: story.coverImage,
        destination: story.destination,
        destinationName: null,
        destinationCountry: null,
    }));

    const storyItems = [...publishedItems, ...legacyItems];
    const collectionJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${baseUrl}/stories#collection`,
        name: "Wedding Stories — The Scene Studio",
        description: "A collection of intimate destination wedding stories photographed and filmed by The Scene Studio.",
        url: `${baseUrl}/stories`,
        isPartOf: { "@type": "WebSite", name: "The Scene Studio", url: baseUrl },
        mainEntity: { "@type": "ItemList", itemListElement: storyItems.map((story, index) => ({ "@type": "ListItem", position: index + 1, name: story.title, url: `${baseUrl}/stories/${story.slug}` })) },
    };

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
            <Header light />
            <section className="px-6 pb-32 pt-40 md:px-10 md:pb-48 md:pt-52">
                <div className="mx-auto max-w-7xl">
                    <p className="font-sans text-xs tracking-[0.2em] uppercase">Stories</p>
                    <h1 className="mt-10 max-w-5xl font-serif text-6xl leading-[0.9] tracking-[-0.04em] md:text-8xl lg:text-9xl">Celebrations,<br />remembered.</h1>
                    <p className="mt-10 max-w-xl font-sans text-sm leading-7 text-[#77736c]">A collection of intimate weddings, destination celebrations, and the people who made them unforgettable.</p>
                </div>
            </section>
            <section className="px-6 md:px-10">
                <div className="mx-auto max-w-7xl">
                    {storyItems.map((story, index) => {
                        const destination = story.destinationName && story.destinationCountry
                            ? { name: story.destinationName, country: story.destinationCountry, slug: story.destination }
                            : destinations.find((item) => item.slug === story.destination);
                        return (
                            <article key={story.slug} className="border-t border-[#d8d3ca] py-16 md:py-24">
                                <div className="mb-8 flex items-start justify-between">
                                    <div>
                                        <p className="font-sans text-xs tracking-[0.2em] uppercase text-[#77736c]">{String(index + 1).padStart(2, "0")}</p>
                                        <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] md:text-6xl"><Link href={`/stories/${story.slug}`} className="transition-opacity hover:opacity-60">{story.title}</Link></h2>
                                        <p className="mt-3 font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">{story.location}</p>
                                        {destination && <Link href={`/destinations/${destination.country}/${destination.slug}`} className="mt-2 inline-block font-sans text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-50">{destination.name} →</Link>}
                                    </div>
                                    <Link href={`/stories/${story.slug}`} className="hidden font-sans text-xs tracking-[0.15em] uppercase text-[#77736c] transition-opacity hover:opacity-50 md:block">View Story →</Link>
                                </div>
                                <Link href={`/stories/${story.slug}`} className="group block">
                                    <div className="relative aspect-[16/9] overflow-hidden"><Image src={mediaUrl(story.coverImage)} alt={`${story.title} — ${story.location}`} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" sizes="100vw" /></div>
                                    <div className="mt-6 max-w-2xl"><p className="font-sans text-sm leading-7 text-[#77736c]">{story.description}</p></div>
                                    <div className="mt-6 font-sans text-xs tracking-[0.15em] uppercase md:hidden">View Story →</div>
                                </Link>
                            </article>
                        );
                    })}
                </div>
            </section>
            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48"><div className="mx-auto max-w-5xl"><p className="font-serif text-4xl leading-tight tracking-[-0.03em] md:text-7xl">Every celebration<br />has its own story.</p><Link href="/contact" className="mt-12 inline-block font-sans text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-50">Tell us about yours →</Link></div></section>
            <Footer />
        </main>
    );
}
