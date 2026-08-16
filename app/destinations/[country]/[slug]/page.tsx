
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

import { destinations } from "../../../../data/destinations";
import { stories } from "../../../../data/stories";

const baseUrl =
    "https://the-scene-studio.thescenestudio.workers.dev";

const destinationImages: Record<string, string> = {
    "da-nang": "/images/destinations/da-nang.jpg",
    "hoi-an": "/images/destinations/hoi-an.jpg",
    "phu-quoc": "/images/destinations/phu-quoc.jpg",
    "nha-trang": "/images/destinations/nha-trang.jpg",
    "con-dao": "/images/destinations/con-dao.jpg",
    "ba-na-hills": "/images/destinations/ba-na-hills.jpg",
};

type PageProps = {
    params: Promise<{
        country: string;
        slug: string;
    }>;
};

/*
 * Generate all destination URLs
 */
export function generateStaticParams() {
    return destinations.map((destination) => ({
        country: destination.country,
        slug: destination.slug,
    }));
}

/*
 * SEO Metadata
 */
export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { country, slug } = await params;

    const destination = destinations.find(
        (item) =>
            item.country === country &&
            item.slug === slug
    );

    if (!destination) {
        return {};
    }

    const canonicalUrl =
        `${baseUrl}/destinations/${destination.country}/${destination.slug}`;

    return {
        title: `${destination.name} Wedding Photography & Films`,

        description:
            `${destination.description} The Scene Studio photographs and films intimate destination weddings in ${destination.name}, Vietnam.`,

        alternates: {
            canonical: canonicalUrl,
        },

        openGraph: {
            title: `${destination.name} Wedding Photography & Films`,
            description:
                `${destination.description} The Scene Studio photographs and films intimate destination weddings in ${destination.name}, Vietnam.`,
            url: canonicalUrl,
            type: "website",
            siteName: "The Scene Studio",
            locale: "en_US",

            images: [
                {
                    url: `${baseUrl}${destinationImages[destination.slug]}`,
                    alt: `${destination.name} destination wedding`,
                },
            ],
        },

        twitter: {
            card: "summary_large_image",
            title: `${destination.name} Wedding Photography & Films`,
            description:
                `${destination.description} The Scene Studio photographs and films intimate destination weddings in ${destination.name}, Vietnam.`,
            images: [
                `${baseUrl}${destinationImages[destination.slug]}`,
            ],
        },

        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function DestinationPage({
    params,
}: PageProps) {
    const { country, slug } = await params;

    const destination = destinations.find(
        (item) =>
            item.country === country &&
            item.slug === slug
    );

    if (!destination) {
        notFound();
    }

    /*
     * Automatically find all stories
     * belonging to this destination.
     */
    const destinationStories = stories.filter(
        (story) =>
            story.destination === destination.slug
    );

    const canonicalUrl =
        `${baseUrl}/destinations/${destination.country}/${destination.slug}`;

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
                name: "Destinations",
                item: `${baseUrl}/destinations`,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: destination.name,
                item: canonicalUrl,
            },
        ],
    };

    /*
     * LocalBusiness JSON-LD
     */
    const localBusinessJsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",

        "@id": `${canonicalUrl}#business`,

        name: "The Scene Studio",

        url: baseUrl,

        description:
            `Destination wedding photography and films in ${destination.name}, Vietnam.`,

        areaServed: {
            "@type": "Place",
            name: destination.name,
        },
    };

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">

            {/* JSON-LD */}

            <Script
                id="destination-breadcrumb-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html:
                        JSON.stringify(
                            breadcrumbJsonLd
                        ),
                }}
            />

            <Script
                id="destination-business-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html:
                        JSON.stringify(
                            localBusinessJsonLd
                        ),
                }}
            />

            <Header light />

            {/* Hero */}

            <section className="relative min-h-[75vh] overflow-hidden">

                <Image
                    src={destinationImages[destination.slug]}
                    alt={`${destination.name} destination wedding`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />

                <div className="absolute inset-0 bg-black/25" />

                <div className="absolute inset-x-0 bottom-0 px-6 pb-10 md:px-10 md:pb-14">

                    <div className="mx-auto max-w-7xl text-white">

                        <p className="font-sans text-xs tracking-[0.2em] uppercase">
                            Destination · Vietnam
                        </p>

                        <h1 className="mt-5 font-serif text-[clamp(4rem,10vw,9rem)] leading-[0.85] tracking-[-0.05em]">
                            {destination.name}
                        </h1>

                    </div>

                </div>

            </section>

            {/* Introduction */}

            <section className="px-6 py-32 md:px-10 md:py-48">

                <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2">

                    <div>

                        <p className="font-sans text-xs tracking-[0.2em] uppercase">
                            {destination.name}
                        </p>

                        <h2 className="mt-8 max-w-3xl font-serif text-5xl leading-[0.95] tracking-[-0.04em] md:text-7xl">
                            A place that becomes
                            part of the story.
                        </h2>

                    </div>

                    <div className="flex items-end">

                        <p className="max-w-xl font-sans text-sm leading-7 text-[#77736c] md:text-base">
                            {destination.description}
                        </p>

                    </div>

                </div>

            </section>

            {/* Stories */}

            <section className="border-t border-[#d8d3ca] px-6 py-24 md:px-10 md:py-36">

                <div className="mx-auto max-w-7xl">

                    <div className="flex items-end justify-between">

                        <div>

                            <p className="font-sans text-xs tracking-[0.2em] uppercase">
                                Stories from {destination.name}
                            </p>

                            <h2 className="mt-5 font-serif text-5xl tracking-[-0.04em] md:text-7xl">
                                Weddings we have documented
                            </h2>

                        </div>

                        <Link
                            href="/stories"
                            className="hidden font-sans text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-50 md:block"
                        >
                            View all stories →
                        </Link>

                    </div>

                    {destinationStories.length > 0 ? (

                        <div className="mt-20 grid gap-x-8 gap-y-20 md:grid-cols-2 md:gap-y-32">

                            {destinationStories.map(
                                (story, index) => (

                                    <Link
                                        key={story.slug}
                                        href={`/stories/${story.slug}`}
                                        className={`group ${index % 2 === 1
                                            ? "md:mt-32"
                                            : ""
                                            }`}
                                    >

                                        <div className="relative aspect-[4/5] overflow-hidden bg-[#ddd8cf]">

                                            <Image
                                                src={story.coverImage}
                                                alt={`${story.title} wedding in ${destination.name}`}
                                                fill
                                                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />

                                            <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/0" />

                                            <div className="absolute left-6 top-6 font-sans text-xs tracking-[0.15em] text-white">
                                                {String(index + 1).padStart(2, "0")}
                                            </div>

                                        </div>

                                        <div className="mt-7 flex items-start justify-between gap-6">

                                            <div>

                                                <p className="font-sans text-[10px] tracking-[0.18em] uppercase text-[#77736c]">
                                                    {story.category}
                                                </p>

                                                <h3 className="mt-2 font-serif text-4xl tracking-[-0.03em] md:text-5xl">
                                                    {story.title}
                                                </h3>

                                            </div>

                                            <span className="pt-1 font-sans text-xs transition-transform duration-300 group-hover:translate-x-1">
                                                →
                                            </span>

                                        </div>

                                        <p className="mt-4 max-w-md font-sans text-sm leading-6 text-[#77736c]">
                                            {story.description}
                                        </p>

                                    </Link>

                                )
                            )}

                        </div>

                    ) : (

                        <div className="mt-20 border-t border-[#d8d3ca] pt-12">

                            <p className="max-w-xl font-sans text-sm leading-7 text-[#77736c]">
                                We are currently documenting stories
                                in {destination.name}. New celebrations
                                will appear here soon.
                            </p>

                        </div>

                    )}

                </div>

            </section>

            {/* CTA */}

            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">

                <div className="mx-auto max-w-5xl">

                    <p className="font-serif text-4xl leading-tight tracking-[-0.03em] md:text-7xl">
                        Planning a celebration
                        in {destination.name}?
                    </p>

                    <Link
                        href="/contact"
                        className="mt-12 inline-block font-sans text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-50"
                    >
                        Tell us about your wedding →
                    </Link>

                </div>

            </section>

            <Footer />

        </main>
    );
}
