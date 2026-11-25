import Header from "../components/Header";
import Footer from "../components/Footer";
import { films } from "../../data/films";
import { stories } from "../../data/stories";
import { getDBAsync } from "../../lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Wedding Films & Destination Wedding Videography | The Scene Studio",
    description:
        "Cinematic wedding films and destination wedding videography in Vietnam and worldwide. Explore wedding stories from Da Nang, Hoi An, and Con Dao by The Scene Studio.",
};

function getYouTubeId(url: string) {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname === "youtu.be") {
            return parsedUrl.pathname.slice(1);
        }

        if (
            parsedUrl.hostname === "www.youtube.com" ||
            parsedUrl.hostname === "youtube.com"
        ) {
            return parsedUrl.searchParams.get("v") || "";
        }

        return "";
    } catch {
        return "";
    }
}

type FilmItem = {
    title: string;
    location: string;
    description: string;
    youtubeUrl: string;
};

async function getFilmsList(): Promise<FilmItem[]> {
    try {
        const db = await getDBAsync();
        const result = await db.prepare(`
            SELECT
                f.id,
                f.title,
                f.location,
                f.youtube_url,
                f.story_id
            FROM films f
            WHERE f.published = 1
            ORDER BY f.sort_order ASC, f.created_at DESC
        `).all();

        const rows = (result.results ?? []) as Array<{
            id: string;
            title: string;
            location: string | null;
            youtube_url: string;
            story_id: string | null;
        }>;

        if (rows.length > 0) {
            return rows.map((r) => {
                const matchedStory = stories.find((s) => s.slug === r.story_id);
                return {
                    title: r.title,
                    location: r.location || "",
                    description: matchedStory?.description || "",
                    youtubeUrl: r.youtube_url,
                };
            });
        }
    } catch (e) {
        console.error("Failed to load films from D1", e);
    }

    return films;
}

export default async function FilmsPage() {
    const filmsList = await getFilmsList();

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Header light />

            <section className="px-6 pb-32 pt-40 md:px-10 md:pb-48 md:pt-52">
                <div className="mx-auto max-w-7xl">
                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        Films
                    </p>

                    <h1 className="mt-10 max-w-5xl font-serif text-5xl leading-[0.95] tracking-[-0.04em] md:text-7xl lg:text-8xl">
                        Moving images
                        <br />
                        for stories that
                        <br />
                        deserve to be felt.
                    </h1>
                </div>
            </section>

            <section className="px-6 md:px-10">
                <div className="mx-auto max-w-7xl">
                    {filmsList.map((film, index) => {
                        const youtubeId = getYouTubeId(film.youtubeUrl);

                        return (
                            <article
                                key={film.youtubeUrl}
                                className="border-t border-[#d8d3ca] py-16 md:py-24"
                            >
                                <div className="mb-8">
                                    <p className="font-sans text-xs tracking-[0.2em] uppercase text-[#77736c]">
                                        {String(index + 1).padStart(2, "0")}
                                    </p>

                                    <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] md:text-6xl">
                                        {film.title}
                                    </h2>

                                    <p className="mt-3 font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">
                                        {film.location}
                                    </p>

                                    <p className="mt-4 font-sans text-base leading-relaxed text-[#171717]">
                                        {film.description}
                                    </p>
                                </div>

                                {youtubeId ? (
                                    <div className="relative aspect-video overflow-hidden bg-black">
                                        <iframe
                                            className="absolute inset-0 h-full w-full"
                                            src={`https://www.youtube.com/embed/${youtubeId}`}
                                            title={film.title}
                                            loading="lazy"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="flex aspect-video items-center justify-center bg-[#e8e4dc]">
                                        <p className="font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">
                                            Video unavailable
                                        </p>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>

            <Footer />
        </main>
    );
}