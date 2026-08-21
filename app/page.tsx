import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StoryCard from "./components/StoryCard";
import StructuredData from "./components/StructuredData";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      <StructuredData />
      {/* Navigation */}
      <Header />

      {/* Hero */}
      <section className="relative flex min-h-screen items-end overflow-hidden px-6 pb-10 md:px-10 md:pb-14">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero/scene-hero.jpg"
            alt="Intimate destination wedding in Vietnam"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />

          {/* Image overlay */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full text-white">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
            <div>
              <p className="mb-5 font-sans text-xs tracking-[0.2em] uppercase">
                Vietnam · Worldwide
              </p>

              <h1 className="font-serif text-[clamp(4rem,11vw,10rem)] leading-[0.8] tracking-[-0.04em]">
                The Scene Studio
              </h1>

              <p className="mt-6 max-w-md font-sans text-sm leading-6 md:text-base">
                Destination wedding photography & films in Vietnam and worldwide.
              </p>
            </div>

            <div className="max-w-sm">
              <p className="font-sans text-sm leading-6 md:text-base">
                Intimate weddings and destination stories, photographed and filmed
                with a quiet, cinematic approach.
              </p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex items-center gap-4 font-sans text-[10px] tracking-[0.2em] uppercase">
            <span className="h-px w-10 bg-white/70" />
            <span>Scroll to explore</span>
          </div>
        </div>
      </section>

      {/* The Studio */}
      <section className="px-6 py-32 md:px-10 md:py-48">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 md:grid-cols-12 md:items-end">
            {/* Statement */}
            <div className="md:col-span-7">
              <p className="font-sans text-xs tracking-[0.2em] uppercase">
                The Studio
              </p>

              <h2 className="mt-10 max-w-4xl font-serif text-5xl leading-[1.05] tracking-[-0.03em] md:text-7xl lg:text-8xl">
                We document the moments that feel like you.
              </h2>
            </div>

            {/* Description */}
            <div className="md:col-span-4 md:col-start-9">
              <p className="font-sans text-sm leading-7 text-[#77736c]">
                The Scene Studio is a destination wedding photography and film studio
                based in Vietnam, documenting intimate celebrations in Da Nang, Hoi An,
                and beautiful destinations around the world.
              </p>

              <p className="mt-6 font-sans text-sm leading-7 text-[#77736c]">
                From quiet ceremonies to unforgettable celebrations, our approach is
                unobtrusive, cinematic, and deeply personal.
              </p>

              <p className="mt-6 font-sans text-xs tracking-[0.15em] uppercase">
                Based in Vietnam · Available worldwide
              </p>
            </div>
          </div>

          {/* Studio Image */}
          <div className="mt-24 grid md:grid-cols-12">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#ddd8cf] md:col-span-7 md:col-start-3 md:aspect-[4/3]">
              <Image
                src="/images/studio/scene-studio.jpg"
                alt="The Scene Studio wedding photography"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Story */}
      {/* Selected Stories */}
      <section className="px-6 pb-32 md:px-10 md:pb-48">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex items-end justify-between md:mb-24">
            <div>
              <p className="font-sans text-xs tracking-[0.2em] uppercase">
                Selected Stories
              </p>

              <h2 className="mt-4 font-serif text-4xl tracking-[-0.02em] md:text-6xl">
                Recent celebrations
              </h2>
            </div>

            <a
              href="/stories"
              className="hidden font-sans text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-50 md:block"
            >
              View all stories →
            </a>
          </div>

          <div className="space-y-24 md:space-y-40">
            <StoryCard
              number="01"
              couple="Haley & David"
              location="Da Nang · Vietnam"
              image="/images/stories/haley-david.jpg"
              href="/stories/haley-david"
            />
          </div>

          <a
            href="/stories"
            className="mt-16 block font-sans text-xs tracking-[0.15em] uppercase md:hidden"
          >
            View all stories →
          </a>
        </div>
      </section>

      {/* Closing statement */}
      <section className="border-t border-[#d8d3ca] px-6 py-32 md:px-10 md:py-48">
        <div className="mx-auto max-w-5xl">
          <p className="font-serif text-4xl leading-tight tracking-[-0.02em] md:text-7xl">
            For the quiet moments,
            <br />
            the wild celebrations,
            <br />
            and everything between.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}