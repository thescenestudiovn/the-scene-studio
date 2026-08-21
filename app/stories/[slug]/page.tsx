import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StoryRenderer from "../../components/story/StoryRenderer";
import { destinations } from "../../../data/destinations";
import { stories as legacyStories } from "../../../data/stories";
import { getDB } from "../../../lib/db";
import { mediaUrl } from "../../../lib/media";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thescenestudio.asia";

type PageProps = { params: Promise<{ slug: string }> };

type DbMedia = {
  id: string;
  path: string;
  filename: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
};

type DbBlock = {
  id: string;
  type: string;
  sort_order: number;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  media_id: string | null;
  gallery_title: string | null;
  gallery_layout?: "grid" | "feature" | "portrait-pair" | null;
  media: DbMedia[];
};

async function getDbStory(slug: string) {
  const db = getDB();
  const story = await db
    .prepare(`
      SELECT s.*, d.name AS destination_name, d.country AS destination_country, d.slug AS destination_slug
      FROM stories s
      LEFT JOIN destinations d ON d.id = s.destination_id
      WHERE s.slug = ?
        AND s.published = 1
      LIMIT 1
    `)
    .bind(slug)
    .first<Record<string, unknown>>();

  if (!story) return null;

  const rows = await db
    .prepare(`SELECT * FROM story_blocks WHERE story_id = ? ORDER BY sort_order ASC`)
    .bind(story.id)
    .all<DbBlock>();

  const blocks = await Promise.all(
    (rows.results || []).map(async (block) => {
      const junctionMedia = await db
        .prepare(`
          SELECT m.id, m.path, m.filename, m.alt, m.width, m.height, sbm.sort_order
          FROM story_block_media sbm
          INNER JOIN media m ON m.id = sbm.media_id
          WHERE sbm.block_id = ?
          ORDER BY sbm.sort_order ASC
        `)
        .bind(block.id)
        .all<DbMedia>();

      let media = junctionMedia.results || [];

      if (media.length === 0 && block.type === "image" && block.media_id) {
        const directMedia = await db
          .prepare(`
            SELECT id, path, filename, alt, width, height, 0 AS sort_order
            FROM media
            WHERE id = ?
            LIMIT 1
          `)
          .bind(block.media_id)
          .first<DbMedia>();

        if (directMedia) media = [directMedia];
      }

      return { ...block, media };
    })
  );

  let cover = null as DbMedia | null;
  if (story.cover_media_id) {
    cover = await db
      .prepare(`SELECT id, path, filename, alt, width, height, 0 AS sort_order FROM media WHERE id = ? LIMIT 1`)
      .bind(story.cover_media_id)
      .first<DbMedia>();
  }

  return { story, blocks, cover };
}

function blockToSection(block: DbBlock) {
  switch (block.type) {
    case "text":
      return {
        type: "text" as const,
        eyebrow: block.eyebrow || undefined,
        title: block.title || "",
        body: block.body || "",
      };
    case "image": {
      const image = block.media[0];
      if (!image) return null;
      return {
        type: "image" as const,
        image: image.path,
        alt: image.alt || image.filename || "",
        size: "normal" as const,
      };
    }
    case "gallery":
      return {
        type: "gallery" as const,
        title: block.gallery_title || undefined,
        layout: block.gallery_layout || "grid",
        images: block.media.map((image) => ({
          src: image.path,
          alt: image.alt || image.filename || "",
        })),
      };
    case "quote":
      return { type: "quote" as const, text: block.body || block.title || "" };
    case "credits": {
      const items = (block.body || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const separator = line.indexOf("—") >= 0 ? "—" : ":";
          const index = line.indexOf(separator);
          if (index < 0) return { label: "", value: line };
          return {
            label: line.slice(0, index).trim(),
            value: line.slice(index + 1).trim(),
          };
        });
      return { type: "credits" as const, items };
    }
    default:
      return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dbStory = await getDbStory(slug);
  const legacy = legacyStories.find((item) => item.slug === slug);

  const title = String(dbStory?.story.seo_title || legacy?.seoTitle || dbStory?.story.title || legacy?.title || "The Scene Studio");
  const description = String(dbStory?.story.seo_description || legacy?.seoDescription || dbStory?.story.description || legacy?.description || "");
  const canonicalUrl = `${baseUrl}/stories/${slug}`;
  const cover = dbStory?.cover?.path || legacy?.coverImage;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: "The Scene Studio",
      locale: "en_US",
      images: cover ? [{ url: mediaUrl(cover) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [mediaUrl(cover)] : undefined,
    },
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const dbStory = await getDbStory(slug);
  const legacy = legacyStories.find((item) => item.slug === slug);

  if (!dbStory && !legacy) notFound();

  const story = dbStory?.story || legacy!;
  const sections = dbStory
    ? dbStory.blocks.map(blockToSection).filter(Boolean)
    : legacy!.sections;

  const destinationSlug = String(dbStory?.story.destination_slug || legacy?.destination || "");
  const destination = destinations.find((item) => item.slug === destinationSlug);
  const coverPath = dbStory?.cover?.path || legacy?.coverImage;
  const title = String(story.title);
  const location = String(story.location || "");
  const category = String(story.category || "");
  const description = String(story.description || "");
  const canonicalUrl = `${baseUrl}/stories/${slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Stories", item: `${baseUrl}/stories` },
      ...(destination
        ? [
            { "@type": "ListItem", position: 2, name: destination.name, item: `${baseUrl}/destinations/${destination.country}/${destination.slug}` },
            { "@type": "ListItem", position: 3, name: title, item: canonicalUrl },
          ]
        : [{ "@type": "ListItem", position: 2, name: title, item: canonicalUrl }]),
    ],
  };

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <Script id="story-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Header />

      <section className="relative flex min-h-screen items-end overflow-hidden px-6 pb-10 md:px-10 md:pb-14">
        <div className="absolute inset-0">
          {coverPath && <Image src={mediaUrl(coverPath)} alt={`${title} wedding in ${location}`} fill priority sizes="100vw" className="object-cover" />}
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 text-white">
          <p className="mb-5 font-sans text-xs tracking-[0.2em] uppercase">{location}</p>
          <h1 className="font-serif text-[clamp(4rem,11vw,10rem)] leading-[0.8] tracking-[-0.04em]">{title}</h1>
        </div>
      </section>

      <StoryRenderer sections={sections as Parameters<typeof StoryRenderer>[0]["sections"]} />

      <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-sans text-xs tracking-[0.2em] uppercase">{category}</p>
              <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] md:text-6xl">{location}</h2>
              <p className="mt-4 max-w-md font-sans text-sm leading-7 text-[#77736c]">{description}</p>
            </div>
            <div className="flex flex-col items-start gap-5">
              {destination && <Link href={`/destinations/${destination.country}/${destination.slug}`} className="font-sans text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-50">Explore {destination.name} →</Link>}
              <Link href="/stories" className="font-sans text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-50">← All Stories</Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
