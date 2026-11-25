import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StoryRenderer from "../../components/story/StoryRenderer";
import PublicStoryBlocks from "../../../components/story/PublicStoryBlocks";

import { destinations } from "../../../data/destinations";
import { stories } from "../../../data/stories";
import { mediaUrl } from "../../../lib/media";
import { getStoryBySlug } from "../../../lib/story";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thescenestudio.asia";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const dbStory = await getStoryBySlug(slug);
    const staticStory = stories.find((item) => item.slug === slug);
    if (!dbStory && !staticStory) return {};

    const title = (dbStory?.title as string) || staticStory?.title || "";
    const location = (dbStory?.location as string) || staticStory?.location || "";
    const description = (dbStory?.description as string) || staticStory?.description || "";
    const seoTitle = (dbStory?.seo_title as string) || staticStory?.seoTitle || `${title} — ${location} Wedding — The Scene Studio`;
    const seoDescription = (dbStory?.seo_description as string) || staticStory?.seoDescription || description;
    const coverImage = (dbStory?.cover_image_path as string) || staticStory?.coverImage || "";
    const canonicalUrl = `${baseUrl}/stories/${slug}`;
    const images = coverImage ? [{ url: mediaUrl(coverImage), alt: `${title} — ${location}` }] : [];

    return {
        title: seoTitle,
        description: seoDescription,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: seoTitle,
            description: seoDescription,
            url: canonicalUrl,
            type: "article",
            siteName: "The Scene Studio",
            locale: "en_US",
            images,
        },
        twitter: {
            card: "summary_large_image",
            title: seoTitle,
            description: seoDescription,
            images: coverImage ? [mediaUrl(coverImage)] : [],
        },
        robots: { index: true, follow: true },
    };
}

export default async function StoryPage({ params }: PageProps) {
    const { slug } = await params;
    const dbStory = await getStoryBySlug(slug);
    const staticStory = stories.find((item) => item.slug === slug);
    if (!dbStory && !staticStory) notFound();

    const title = (dbStory?.title as string) || staticStory?.title || "";
    const location = (dbStory?.location as string) || staticStory?.location || "";
    const description = (dbStory?.description as string) || staticStory?.description || "";
    const category = (dbStory?.category as string) || staticStory?.category || "Wedding";
    const date = (dbStory?.date as string) || staticStory?.date || "";
    const coverImage = (dbStory?.cover_image_path as string) || staticStory?.coverImage || "";

    const destination = destinations.find(
        (item) => item.slug === ((dbStory?.destination_slug as string) || staticStory?.destination)
    );
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

    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        headline: title,
        description,
        image: coverImage ? [mediaUrl(coverImage)] : [],
        datePublished: date,
        author: { "@type": "Organization", name: "The Scene Studio", url: baseUrl },
        publisher: { "@type": "Organization", name: "The Scene Studio", url: baseUrl },
        mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
        about: { "@type": "Place", name: location },
        keywords: ["destination wedding", "wedding photography", "wedding films", location, category].filter(Boolean),
    };

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Script id="story-breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <Script id="story-article-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
            <Header />

            <section className="relative flex min-h-screen items-end overflow-hidden px-6 pb-10 md:px-10 md:pb-14">
                <div className="absolute inset-0">
                    {coverImage && (
                        <Image src={mediaUrl(coverImage)} alt={`${title} wedding in ${location}`} fill priority sizes="100vw" className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="relative z-10 text-white">
                    <p className="mb-5 font-sans text-xs tracking-[0.2em] uppercase">{location}</p>
                    <h1 className="font-serif text-[clamp(4rem,11vw,10rem)] leading-[0.8] tracking-[-0.04em]">{title}</h1>
                </div>
            </section>

            {dbStory?.blocks && (dbStory.blocks as Array<unknown>).length > 0 ? (
                <PublicStoryBlocks blocks={dbStory.blocks as never[]} />
            ) : staticStory?.sections ? (
                <StoryRenderer sections={staticStory.sections} />
            ) : null}

            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="font-sans text-xs tracking-[0.2em] uppercase">{category}</p>
                            <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] md:text-6xl">{location}</h2>
                            <p className="mt-4 max-w-md font-sans text-sm leading-7 text-[#77736c]">{description}</p>
                        </div>
                        <div className="flex flex-col items-start gap-5">
                            {destination && (
                                <Link href={`/destinations/${destination.country}/${destination.slug}`} className="font-sans text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-50">
                                    Explore {destination.name} →
                                </Link>
                            )}
                            <Link href="/stories" className="font-sans text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-50">
                                ← All Stories
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
