import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StoryRenderer from "../../components/story/StoryRenderer";

import { destinations } from "../../../data/destinations";
import { stories } from "../../../data/stories";

const baseUrl =
    "https://the-scene-studio.thescenestudio.workers.dev";

type PageProps = {
    params: Promise<{
        slug: string;
    }>;
};

/*
 * Generate all story URLs at build time
 */
export function generateStaticParams() {
    return stories.map((story) => ({
        slug: story.slug,
    }));
}

/*
 * SEO Metadata
 */
export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;

    const story = stories.find(
        (item) => item.slug === slug
    );

    if (!story) {
        return {};
    }

    const canonicalUrl =
        `${baseUrl}/stories/${story.slug}`;

    return {
        title: story.seoTitle,

        description: story.seoDescription,

        alternates: {
            canonical: canonicalUrl,
        },

        openGraph: {
            title: story.seoTitle,
            description: story.seoDescription,
            url: canonicalUrl,
            type: "article",
            siteName: "The Scene Studio",
            locale: "en_US",

            images: [
                {
                    url: `${baseUrl}${story.coverImage}`,
                    alt: `${story.title} — ${story.location}`,
                },
            ],
        },

        twitter: {
            card: "summary_large_image",
            title: story.seoTitle,
            description: story.seoDescription,

            images: [
                `${baseUrl}${story.coverImage}`,
            ],
        },

        robots: {
            index: true,
            follow: true,
        },
    };
}

/*
 * Story Page
 */
export default async function StoryPage({
    params,
}: PageProps) {
    const { slug } = await params;

    const story = stories.find(
        (item) => item.slug === slug
    );

    if (!story) {
        notFound();
    }

    /*
     * Find related destination
     */
    const destination = destinations.find(
        (item) => item.slug === story.destination
    );

    const canonicalUrl =
        `${baseUrl}/stories/${story.slug}`;

    /*
     * Breadcrumb JSON-LD
     */
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",

        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Stories",
                item: `${baseUrl}/stories`,
            },

            ...(destination
                ? [
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: destination.name,
                        item: `${baseUrl}/destinations/${destination.country}/${destination.slug}`,
                    },
                    {
                        "@type": "ListItem",
                        position: 3,
                        name: story.title,
                        item: canonicalUrl,
                    },
                ]
                : [
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: story.title,
                        item: canonicalUrl,
                    },
                ]),
        ],
    };

    /*
     * Article JSON-LD
     */
    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",

        "@id": `${canonicalUrl}#article`,

        headline: story.title,

        description: story.description,

        image: [
            `${baseUrl}${story.coverImage}`,
        ],

        datePublished: story.date,

        author: {
            "@type": "Organization",
            name: "The Scene Studio",
            url: baseUrl,
        },

        publisher: {
            "@type": "Organization",
            name: "The Scene Studio",
            url: baseUrl,
        },

        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
        },

        about: {
            "@type": "Place",
            name: story.location,
        },

        keywords: [
            "destination wedding",
            "wedding photography",
            "wedding films",
            story.location,
            story.category,
        ],
    };

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">

            {/* Breadcrumb JSON-LD */}
            <Script
                id="story-breadcrumb-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        breadcrumbJsonLd
                    ),
                }}
            />

            {/* Article JSON-LD */}
            <Script
                id="story-article-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        articleJsonLd
                    ),
                }}
            />

            <Header />

            {/* Hero */}
            <section className="relative flex min-h-screen items-end overflow-hidden px-6 pb-10 md:px-10 md:pb-14">

                <div className="absolute inset-0">

                    <Image
                        src={story.coverImage}
                        alt={`${story.title} wedding in ${story.location}`}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                    />

                    <div className="absolute inset-0 bg-black/20" />

                </div>

                <div className="relative z-10 text-white">

                    <p className="mb-5 font-sans text-xs tracking-[0.2em] uppercase">
                        {story.location}
                    </p>

                    <h1 className="font-serif text-[clamp(4rem,11vw,10rem)] leading-[0.8] tracking-[-0.04em]">
                        {story.title}
                    </h1>

                </div>

            </section>

            {/* Story Content */}
            <StoryRenderer
                sections={story.sections}
            />

            {/* Wedding Film */}


            {/* Closing */}
            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">

                <div className="mx-auto max-w-7xl">

                    <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">

                        <div>

                            <p className="font-sans text-xs tracking-[0.2em] uppercase">
                                {story.category}
                            </p>

                            <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] md:text-6xl">
                                {story.location}
                            </h2>

                            <p className="mt-4 max-w-md font-sans text-sm leading-7 text-[#77736c]">
                                {story.description}
                            </p>

                        </div>

                        <div className="flex flex-col items-start gap-5">

                            {destination && (
                                <Link
                                    href={`/destinations/${destination.country}/${destination.slug}`}
                                    className="font-sans text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-50"
                                >
                                    Explore {destination.name} →
                                </Link>
                            )}

                            <Link
                                href="/stories"
                                className="font-sans text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-50"
                            >
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