import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StoryRenderer from "../../components/story/StoryRenderer";
import { stories } from "../../../data/stories";
export const metadata = {
    title: "Haley & David — Intimate Wedding in Da Nang",
    description:
        "An intimate destination wedding for Haley & David in Da Nang, Vietnam, photographed by The Scene Studio.",
};

export default function HaleyDavidStory() {
    const story = stories.find(
        (item) => item.slug === "haley-david"
    );

    if (!story) {
        return null;
    }
    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Header />

            {/* Hero */}
            <section className="relative flex min-h-screen items-end overflow-hidden px-6 pb-10 md:px-10 md:pb-14">
                <div className="absolute inset-0">
                    <img
                        src="/images/stories/haley-david.jpg"
                        alt="Haley & David intimate wedding in Da Nang"
                        className="h-full w-full object-cover"
                        fetchPriority="high"
                    />

                    <div className="absolute inset-0 bg-black/20" />
                </div>

                <div className="relative z-10 text-white">
                    <p className="mb-5 font-sans text-xs tracking-[0.2em] uppercase">
                        Da Nang · Vietnam
                    </p>

                    <h1 className="font-serif text-[clamp(4rem,11vw,10rem)] leading-[0.8] tracking-[-0.04em]">
                        Haley & David
                    </h1>
                </div>
            </section>

            <StoryRenderer sections={story.sections} />

            {/* Closing */}
            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="font-sans text-xs tracking-[0.2em] uppercase">
                                Haley & David
                            </p>

                            <h2 className="mt-4 font-serif text-4xl md:text-6xl">
                                Da Nang, Vietnam
                            </h2>
                        </div>

                        <a
                            href="/stories"
                            className="font-sans text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-50"
                        >
                            ← All Stories
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}