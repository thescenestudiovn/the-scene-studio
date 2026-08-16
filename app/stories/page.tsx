import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { stories } from "../../data/stories";

export const metadata = {
    title: "Stories — The Scene Studio",
    description:
        "Selected destination wedding stories by The Scene Studio in Vietnam and beyond.",
};

export default function StoriesPage() {
    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Header light />

            {/* Intro */}
            <section className="px-6 pb-32 pt-40 md:px-10 md:pb-48 md:pt-52">
                <div className="mx-auto max-w-7xl">
                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        Stories
                    </p>

                    <h1 className="mt-10 max-w-5xl font-serif text-6xl leading-[0.9] tracking-[-0.04em] md:text-8xl lg:text-9xl">
                        Celebrations,
                        <br />
                        remembered.
                    </h1>

                    <p className="mt-10 max-w-xl font-sans text-sm leading-7 text-[#77736c]">
                        A collection of intimate weddings, destination celebrations, and
                        the people who made them unforgettable.
                    </p>
                </div>
            </section>

            {/* Stories */}
            <section className="px-6 md:px-10">
                <div className="mx-auto max-w-7xl">
                    {stories.map((story, index) => (
                        <article
                            key={story.slug}
                            className="border-t border-[#d8d3ca] py-16 md:py-24"
                        >
                            <Link href={`/stories/${story.slug}`} className="group block">
                                <div className="mb-8 flex items-start justify-between">
                                    <div>
                                        <p className="font-sans text-xs tracking-[0.2em] uppercase text-[#77736c]">
                                            {String(index + 1).padStart(2, "0")}
                                        </p>

                                        <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] md:text-6xl">
                                            {story.title}
                                        </h2>

                                        <p className="mt-3 font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">
                                            {story.location}
                                        </p>
                                    </div>

                                    <span className="hidden font-sans text-xs tracking-[0.15em] uppercase text-[#77736c] transition-opacity group-hover:opacity-50 md:block">
                                        View Story →
                                    </span>
                                </div>

                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <Image
                                        src={story.coverImage}
                                        alt={story.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                                        sizes="100vw"
                                    />
                                </div>

                                <div className="mt-6 font-sans text-xs tracking-[0.15em] uppercase md:hidden">
                                    View Story →
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}