import Header from "../components/Header";
import Footer from "../components/Footer";
import { films } from "../../data/films";

export const metadata = {
    title: "Films — The Scene Studio",
    description:
        "Wedding films and destination wedding stories by The Scene Studio, based in Vietnam and available worldwide.",
};

export default function FilmsPage() {
    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Header light />

            {/* Intro */}
            <section className="px-6 pb-32 pt-40 md:px-10 md:pb-48 md:pt-52">
                <div className="mx-auto max-w-7xl">
                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        Films
                    </p>

                    <h1 className="mt-10 max-w-5xl font-serif text-6xl leading-[0.9] tracking-[-0.04em] md:text-8xl lg:text-9xl">
                        Moving images
                        <br />
                        for stories that
                        <br />
                        deserve to be felt.
                    </h1>
                </div>
            </section>

            {/* Films */}
            <section className="px-6 md:px-10">
                <div className="mx-auto max-w-7xl">
                    {films.map((film, index) => (
                        <article
                            key={film.youtubeId}
                            className="border-t border-[#d8d3ca] py-16 md:py-24"
                        >
                            <div className="mb-8 flex items-end justify-between">
                                <div>
                                    <p className="font-sans text-xs tracking-[0.2em] uppercase text-[#77736c]">
                                        {String(index + 1).padStart(2, "0")}
                                    </p>

                                    <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] md:text-6xl">
                                        {film.title}
                                    </h2>

                                    <p className="mt-3 font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">
                                        {film.location}
                                    </p>
                                </div>
                            </div>

                            <div className="relative aspect-video overflow-hidden bg-black">
                                <iframe
                                    className="absolute inset-0 h-full w-full"
                                    src={`https://www.youtube.com/embed/${film.youtubeId}`}
                                    title={film.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}