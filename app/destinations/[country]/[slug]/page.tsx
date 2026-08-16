import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { destinations } from "../../../../data/destinations";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

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

export function generateStaticParams() {
    return destinations.map((destination) => ({
        country: destination.country,
        slug: destination.slug,
    }));
}

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
        title: destination.seoTitle,
        description: destination.seoDescription,

        alternates: {
            canonical: canonicalUrl,
        },

        openGraph: {
            title: destination.seoTitle,
            description: destination.seoDescription,
            type: "website",
            siteName: "The Scene Studio",
            locale: "en_US",
            url: canonicalUrl,
        },

        twitter: {
            card: "summary_large_image",
            title: destination.seoTitle,
            description: destination.seoDescription,
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

    const image = destinationImages[destination.slug];

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
     * Destination / Business JSON-LD
     */
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",

        name: "The Scene Studio",

        description: destination.seoDescription,

        url: canonicalUrl,

        image: image
            ? `${baseUrl}${image}`
            : undefined,

        areaServed: {
            "@type": "Place",
            name: `${destination.name}, ${destination.countryName}`,
        },

        serviceType: [
            "Wedding Photography",
            "Wedding Films",
            "Destination Wedding Photography",
            "Destination Wedding Videography",
            "Beach Wedding Photography",
            "Intimate Wedding Photography",
        ],
    };

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">

            {/* Breadcrumb JSON-LD */}
            <Script
                id="breadcrumb-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbJsonLd),
                }}
            />

            {/* Destination JSON-LD */}
            <Script
                id="destination-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd),
                }}
            />

            <Header light />

            {/* Hero */}
            <section className="px-6 pb-32 pt-40 md:px-10 md:pb-48 md:pt-52">
                <div className="mx-auto max-w-7xl">

                    {/* Breadcrumb */}
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-10 flex items-center gap-3 font-sans text-[10px] tracking-[0.15em] uppercase text-[#77736c]"
                    >
                        <Link
                            href="/destinations"
                            className="transition-opacity hover:opacity-50"
                        >
                            Destinations
                        </Link>

                        <span>/</span>

                        <span className="text-[#171717]">
                            {destination.name}
                        </span>
                    </nav>

                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        {destination.countryName} · {destination.region}
                    </p>

                    <h1 className="mt-10 max-w-6xl font-serif text-7xl leading-[0.85] tracking-[-0.05em] md:text-9xl">
                        {destination.name}
                    </h1>

                    <p className="mt-10 max-w-xl font-sans text-sm leading-7 text-[#77736c] md:text-base">
                        {destination.description}
                    </p>

                </div>
            </section>

            {/* Hero Image */}
            {image && (
                <section className="px-6 md:px-10">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative aspect-[16/9] overflow-hidden bg-[#ddd8cf]">
                            <Image
                                src={image}
                                alt={`${destination.name} destination wedding`}
                                fill
                                priority
                                className="object-cover"
                                sizes="100vw"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Introduction */}
            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-12">

                    <div className="md:col-span-4">
                        <p className="font-sans text-xs tracking-[0.2em] uppercase">
                            The Place
                        </p>
                    </div>

                    <div className="md:col-span-7 md:col-start-6">

                        <h2 className="font-serif text-3xl leading-tight tracking-[-0.02em] md:text-5xl">
                            {destination.introTitle}
                        </h2>

                        <p className="mt-10 font-sans text-sm leading-7 text-[#77736c]">
                            {destination.introText}
                        </p>

                    </div>
                </div>
            </section>

            {/* Wedding Style */}
            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto max-w-7xl">

                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        Wedding Experience
                    </p>

                    <div className="mt-16 grid gap-12 md:grid-cols-3">

                        {destination.weddingStyle.map((style) => (
                            <div key={style.title}>

                                <h2 className="font-serif text-4xl tracking-[-0.03em]">
                                    {style.title}
                                </h2>

                                <p className="mt-5 font-sans text-sm leading-7 text-[#77736c]">
                                    {style.description}
                                </p>

                            </div>
                        ))}

                    </div>
                </div>
            </section>

            {/* Approach */}
            <section className="bg-[#171717] px-6 py-32 text-[#f7f5f0] md:px-10 md:py-48">
                <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-12">

                    <div className="md:col-span-4">
                        <p className="font-sans text-xs tracking-[0.2em] uppercase text-[#9d9a93]">
                            Our Approach
                        </p>
                    </div>

                    <div className="md:col-span-7 md:col-start-6">

                        <h2 className="font-serif text-4xl leading-tight tracking-[-0.03em] md:text-6xl">
                            We document the way it felt to be there.
                        </h2>

                        <p className="mt-10 font-sans text-sm leading-7 text-[#9d9a93]">
                            Rather than creating a collection of perfectly
                            posed photographs, we look for the atmosphere,
                            gestures, relationships, and quiet moments that
                            make the day yours.
                        </p>

                    </div>
                </div>
            </section>

            {/* Other destinations */}
            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto max-w-7xl">

                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        More destinations in {destination.countryName}
                    </p>

                    <div className="mt-16 grid gap-8 md:grid-cols-2">

                        {destinations
                            .filter(
                                (item) =>
                                    item.country === destination.country &&
                                    item.slug !== destination.slug
                            )
                            .slice(0, 4)
                            .map((item) => (

                                <Link
                                    key={item.slug}
                                    href={`/destinations/${item.country}/${item.slug}`}
                                    className="group"
                                >

                                    <div className="relative aspect-[4/3] overflow-hidden bg-[#ddd8cf]">

                                        {destinationImages[item.slug] && (
                                            <Image
                                                src={destinationImages[item.slug]}
                                                alt={`${item.name} destination wedding`}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        )}

                                    </div>

                                    <h3 className="mt-5 font-serif text-3xl tracking-[-0.03em]">
                                        {item.name}
                                    </h3>

                                </Link>

                            ))}

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto max-w-5xl text-center">

                    <h2 className="font-serif text-5xl leading-[0.95] tracking-[-0.03em] md:text-8xl">
                        Getting married
                        <br />
                        in {destination.name}?
                    </h2>

                    <p className="mx-auto mt-8 max-w-md font-sans text-sm leading-7 text-[#77736c]">
                        Tell us about your destination wedding, beach wedding,
                        or intimate celebration.
                    </p>

                    <Link
                        href="/contact"
                        className="mt-12 inline-block font-sans text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-50"
                    >
                        Tell us about your day →
                    </Link>

                </div>
            </section>

            <Footer />

        </main>
    );
}