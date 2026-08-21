import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { destinations } from "../../../data/destinations";

const baseUrl =
    "https://thescenestudio.asia";

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
    }>;
};

export function generateStaticParams() {
    const countries = [
        ...new Set(
            destinations.map((destination) => destination.country)
        ),
    ];

    return countries.map((country) => ({
        country,
    }));
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { country } = await params;

    const countryDestinations = destinations.filter(
        (destination) => destination.country === country
    );

    if (countryDestinations.length === 0) {
        return {};
    }

    const countryName = countryDestinations[0].countryName;

    const title =
        `${countryName} Destination Wedding Photographer & Films | The Scene Studio`;

    const description =
        `Destination wedding photography and cinematic wedding films in ${countryName}. The Scene Studio documents intimate weddings, beach weddings, and destination celebrations with a quiet, cinematic approach.`;

    const canonicalUrl = `${baseUrl}/destinations/${country}`;

    return {
        title,
        description,

        alternates: {
            canonical: canonicalUrl,
        },

        openGraph: {
            title,
            description,
            type: "website",
            siteName: "The Scene Studio",
            locale: "en_US",
            url: canonicalUrl,
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default async function CountryPage({
    params,
}: PageProps) {
    const { country } = await params;

    const countryDestinations = destinations.filter(
        (destination) => destination.country === country
    );

    if (countryDestinations.length === 0) {
        notFound();
    }

    const countryName = countryDestinations[0].countryName;

    const canonicalUrl = `${baseUrl}/destinations/${country}`;

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
                name: countryName,
                item: canonicalUrl,
            },
        ],
    };

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",

        name: "The Scene Studio",

        description:
            `Destination wedding photography and cinematic wedding films in ${countryName}.`,

        url: canonicalUrl,

        areaServed: {
            "@type": "Country",
            name: countryName,
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbJsonLd),
                }}
            />

            {/* Professional Service JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd),
                }}
            />

            <Header light />

            {/* Hero */}
            <section className="px-6 pb-24 pt-40 md:px-10 md:pb-36 md:pt-52">
                <div className="mx-auto max-w-7xl">

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
                            {countryName}
                        </span>
                    </nav>

                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        Destinations · {countryName}
                    </p>

                    <h1 className="mt-10 max-w-6xl font-serif text-6xl leading-[0.9] tracking-[-0.05em] md:text-9xl">
                        Destination weddings
                        <br />
                        in {countryName}.
                    </h1>

                    <p className="mt-12 max-w-xl font-sans text-sm leading-7 text-[#77736c] md:text-base">
                        Explore beautiful places across {countryName},
                        from intimate beach weddings to destination
                        celebrations surrounded by mountains, islands,
                        and historic landscapes.
                    </p>
                </div>
            </section>

            {/* Destinations */}
            <section className="border-t border-[#d8d3ca] px-6 py-24 md:px-10 md:py-36">
                <div className="mx-auto max-w-7xl">

                    <div className="flex items-end justify-between">
                        <div>
                            <p className="font-sans text-xs tracking-[0.2em] uppercase">
                                {countryName}
                            </p>

                            <h2 className="mt-5 font-serif text-5xl tracking-[-0.04em] md:text-7xl">
                                Places to celebrate
                            </h2>
                        </div>

                        <p className="hidden max-w-xs text-right font-sans text-xs leading-6 text-[#77736c] md:block">
                            {countryDestinations.length} destinations,
                            each with its own rhythm, landscape, and
                            atmosphere.
                        </p>
                    </div>

                    <div className="mt-20 grid gap-x-8 gap-y-20 md:grid-cols-2 md:gap-y-32">

                        {countryDestinations.map(
                            (destination, index) => {
                                const image =
                                    destinationImages[
                                    destination.slug
                                    ];

                                return (
                                    <Link
                                        key={destination.slug}
                                        href={`/destinations/${destination.country}/${destination.slug}`}
                                        className={`group ${index % 2 === 1
                                            ? "md:mt-32"
                                            : ""
                                            }`}
                                    >
                                        <div className="relative aspect-[4/5] overflow-hidden bg-[#ddd8cf]">

                                            {image && (
                                                <Image
                                                    src={image}
                                                    alt={`${destination.name} destination wedding`}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                />
                                            )}

                                            <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/0" />

                                            <div className="absolute left-6 top-6 font-sans text-xs tracking-[0.15em] text-white">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-7 flex items-start justify-between gap-6">

                                            <div>
                                                <p className="font-sans text-[10px] tracking-[0.18em] uppercase text-[#77736c]">
                                                    {destination.region}
                                                </p>

                                                <h3 className="mt-2 font-serif text-4xl tracking-[-0.03em] md:text-5xl">
                                                    {destination.name}
                                                </h3>
                                            </div>

                                            <span className="pt-1 font-sans text-xs transition-transform duration-300 group-hover:translate-x-1">
                                                →
                                            </span>
                                        </div>

                                        <p className="mt-4 max-w-md font-sans text-sm leading-6 text-[#77736c]">
                                            {destination.description}
                                        </p>
                                    </Link>
                                );
                            }
                        )}

                    </div>
                </div>
            </section>

            {/* SEO / Wedding Types */}
            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-12">

                    <div className="md:col-span-4">
                        <p className="font-sans text-xs tracking-[0.2em] uppercase">
                            Wedding Stories
                        </p>
                    </div>

                    <div className="md:col-span-7 md:col-start-6">

                        <h2 className="font-serif text-4xl leading-tight tracking-[-0.03em] md:text-6xl">
                            Destination weddings,
                            <br />
                            made personal.
                        </h2>

                        <p className="mt-10 font-sans text-sm leading-7 text-[#77736c]">
                            From intimate wedding celebrations and
                            beach weddings to destination weddings
                            surrounded by nature, we photograph and
                            film celebrations that feel connected to
                            the people and the place.
                        </p>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto max-w-5xl">

                    <h2 className="font-serif text-5xl leading-[0.95] tracking-[-0.03em] md:text-8xl">
                        Planning a wedding
                        <br />
                        in {countryName}?
                    </h2>

                    <p className="mt-8 max-w-md font-sans text-sm leading-7 text-[#77736c]">
                        Tell us about your destination wedding,
                        beach wedding, or intimate celebration.
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