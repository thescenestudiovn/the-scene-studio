import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { destinations } from "../../data/destinations";
import { stories } from "../../data/stories";

const baseUrl =
    "https://thescenestudio.asia";

export const metadata: Metadata = {
    title: "Destination Wedding Photography & Films in Vietnam",
    description:
        "Explore destination wedding photography and films in Da Nang, Hoi An, Phu Quoc, Nha Trang, Con Dao, and Ba Na Hills. The Scene Studio documents intimate celebrations across Vietnam.",
    alternates: {
        canonical: `${baseUrl}/destinations`,
    },
    openGraph: {
        title: "Destination Wedding Photography & Films in Vietnam",
        description:
            "Explore destination wedding photography and films across Vietnam with The Scene Studio.",
        url: `${baseUrl}/destinations`,
        type: "website",
        siteName: "The Scene Studio",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "Destination Wedding Photography & Films in Vietnam",
        description:
            "Explore destination wedding photography and films across Vietnam with The Scene Studio.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

const destinationImages: Record<string, string> = {
    "da-nang": "/images/destinations/da-nang.jpg",
    "hoi-an": "/images/destinations/hoi-an.jpg",
    "phu-quoc": "/images/destinations/phu-quoc.jpg",
    "nha-trang": "/images/destinations/nha-trang.jpg",
    "con-dao": "/images/destinations/con-dao.jpg",
    "ba-na-hills": "/images/destinations/ba-na-hills.jpg",
};

export default function DestinationsPage() {
    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Header light />

            {/* Intro */}
            <section className="px-6 pb-24 pt-40 md:px-10 md:pb-36 md:pt-52">
                <div className="mx-auto max-w-7xl">
                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        Destinations
                    </p>

                    <h1 className="mt-10 max-w-5xl font-serif text-6xl leading-[0.9] tracking-[-0.05em] md:text-9xl">
                        Places that
                        <br />
                        become part of the story.
                    </h1>

                    <p className="mt-12 max-w-xl font-sans text-sm leading-7 text-[#77736c] md:text-base">
                        We photograph and film intimate destination weddings
                        in beautiful places across Vietnam and beyond.
                    </p>
                </div>
            </section>

            {/* Destinations */}
            <section className="border-t border-[#d8d3ca] px-6 py-24 md:px-10 md:py-36">
                <div className="mx-auto max-w-7xl">

                    <div className="flex items-end justify-between">
                        <div>
                            <p className="font-sans text-xs tracking-[0.2em] uppercase">
                                Destinations
                            </p>

                            <h2 className="mt-5 font-serif text-5xl tracking-[-0.04em] md:text-7xl">
                                Explore our destinations
                            </h2>
                        </div>

                        <p className="hidden max-w-xs text-right font-sans text-xs leading-6 text-[#77736c] md:block">
                            Places with their own rhythm, landscape, and atmosphere.
                        </p>
                    </div>

                    <div className="mt-20 grid gap-x-8 gap-y-20 md:grid-cols-2 md:gap-y-32">

                        {destinations.map((destination, index) => {
                            const destinationStories = stories.filter(
                                (story) => story.destination === destination.slug
                            );
                            const image =
                                destinationImages[destination.slug];

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
                                                alt={`${destination.name} destination wedding photography`}
                                                fill
                                                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        )}

                                        <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/0" />

                                        <div className="absolute left-6 top-6 font-sans text-xs tracking-[0.15em] text-white">
                                            {String(index + 1).padStart(2, "0")}
                                        </div>

                                    </div>

                                    <div className="mt-7 flex items-start justify-between gap-6">

                                        <div>
                                            <p className="font-sans text-[10px] tracking-[0.18em] uppercase text-[#77736c]">
                                                {destination.countryName}
                                            </p>

                                            <h3 className="mt-2 font-serif text-4xl tracking-[-0.03em] md:text-5xl">
                                                {destination.name}
                                            </h3>
                                        </div>

                                        <span className="pt-1 font-sans text-xs transition-transform duration-300 group-hover:translate-x-1">
                                            →
                                        </span>

                                    </div>

                                    <div className="mt-4 flex items-end justify-between gap-6">

                                        <p className="max-w-md font-sans text-sm leading-6 text-[#77736c]">
                                            {destination.description}
                                        </p>

                                        {destinationStories.length > 0 && (
                                            <span className="shrink-0 font-sans text-[10px] tracking-[0.15em] uppercase text-[#77736c]">
                                                {destinationStories.length}{" "}
                                                {destinationStories.length === 1
                                                    ? "Story"
                                                    : "Stories"}
                                            </span>
                                        )}

                                    </div>

                                </Link>
                            );
                        })}

                    </div>
                </div>
            </section>

            {/* Closing */}
            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto max-w-5xl">

                    <p className="font-serif text-4xl leading-tight tracking-[-0.03em] md:text-7xl">
                        Wherever the celebration takes you,
                        <br />
                        we will meet you there.
                    </p>

                    <Link
                        href="/contact"
                        className="mt-12 inline-block font-sans text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-50"
                    >
                        Tell us about your destination →
                    </Link>

                </div>
            </section>

            <Footer />
        </main>
    );
}