import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
    title: "About — The Scene Studio",
    description:
        "The Scene Studio is a Vietnam-based destination wedding photography and film studio creating intimate, intentional stories for couples around the world.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Header light />

            {/* Intro */}
            <section className="px-6 pb-32 pt-40 md:px-10 md:pb-48 md:pt-52">
                <div className="mx-auto max-w-7xl">
                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        About The Scene
                    </p>

                    <h1 className="mt-10 max-w-6xl font-serif text-6xl leading-[0.95] tracking-[-0.04em] md:text-8xl lg:text-9xl">
                        We create photographs and films for people who care about how
                        their story feels.
                    </h1>
                </div>
            </section>

            {/* Studio Image */}
            <section className="px-6 md:px-10">
                <div className="relative mx-auto aspect-[16/9] max-w-7xl overflow-hidden">
                    <Image
                        src="/images/studio/scene-studio.jpg"
                        alt="The Scene Studio"
                        fill
                        className="object-cover"
                        sizes="100vw"
                    />
                </div>
            </section>

            {/* Philosophy */}
            <section className="px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-12">
                    <div className="md:col-span-5">
                        <p className="font-sans text-xs tracking-[0.2em] uppercase">
                            Our Approach
                        </p>
                    </div>

                    <div className="md:col-span-6 md:col-start-7">
                        <p className="font-serif text-3xl leading-tight tracking-[-0.02em] md:text-5xl">
                            We believe the best photographs are rarely the ones you planned.
                        </p>

                        <p className="mt-10 font-sans text-sm leading-7 text-[#77736c]">
                            Our approach is quiet and intentional. We give you space to be
                            yourselves while paying close attention to the light, movement,
                            people, and small moments that make the day yours.
                        </p>

                        <p className="mt-6 font-sans text-sm leading-7 text-[#77736c]">
                            From intimate ceremonies in Vietnam to destination celebrations
                            around the world, we create imagery that feels honest, cinematic,
                            and timeless.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto max-w-7xl">
                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        What Matters
                    </p>

                    <div className="mt-16 grid gap-12 md:grid-cols-3">
                        <div>
                            <h2 className="font-serif text-4xl tracking-[-0.02em]">
                                Presence
                            </h2>

                            <p className="mt-5 font-sans text-sm leading-7 text-[#77736c]">
                                We observe rather than direct, allowing real moments to unfold
                                naturally.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-serif text-4xl tracking-[-0.02em]">
                                Intention
                            </h2>

                            <p className="mt-5 font-sans text-sm leading-7 text-[#77736c]">
                                Every frame has a reason. We care about composition, light,
                                emotion, and the story behind the image.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-serif text-4xl tracking-[-0.02em]">
                                Connection
                            </h2>

                            <p className="mt-5 font-sans text-sm leading-7 text-[#77736c]">
                                The experience matters as much as the photographs. We want you
                                to feel comfortable, present, and completely yourselves.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing */}
            <section className="px-6 py-32 md:px-10 md:py-48">
                <div className="mx-auto max-w-5xl text-center">
                    <p className="font-serif text-5xl leading-[1] tracking-[-0.03em] md:text-8xl">
                        Your day.
                        <br />
                        Your people.
                        <br />
                        Your story.
                    </p>

                    <a
                        href="/contact"
                        className="mt-12 inline-block font-sans text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-50"
                    >
                        Work with us →
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}