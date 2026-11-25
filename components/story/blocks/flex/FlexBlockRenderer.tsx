"use client";

import { useState } from "react";
import Link from "next/link";
import { blockLayout } from "@/components/content/blockLayout";
import { mediaUrl } from "@/lib/media";

type FlexBlockProps = {
  data: Record<string, unknown>;
  variant?: string | null;
};

export default function FlexBlockRenderer({ data, variant = "bio-editorial" }: FlexBlockProps) {
  const v = variant || "bio-editorial";
  const title = typeof data.title === "string" ? data.title : "";
  const subtitle = typeof data.subtitle === "string" ? data.subtitle : "";
  const eyebrow = typeof data.eyebrow === "string" ? data.eyebrow : "";
  const body = typeof data.body === "string" ? data.body : "";
  const imageUrl = typeof data.image_url === "string" ? data.image_url : "https://media.thescenestudio.asia/Haley-David/002-NT-HL-01178.jpg";

  // State for FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // 1. BIO VARIANTS
  if (v === "bio-editorial") {
    return (
      <section className={blockLayout.section.spacious}>
        <div className={`mx-auto ${blockLayout.container.wide}`}>
          <div className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-4">
              {eyebrow && <p className={blockLayout.typography.eyebrow}>{eyebrow}</p>}
              <h2 className="mt-4 font-serif text-3xl leading-snug md:text-5xl">{title || "Hi, my name is Andy"}</h2>
            </div>
            <div className="aspect-[3/4] overflow-hidden bg-[#ebe8e2] md:col-span-4">
              <img src={mediaUrl(imageUrl)} alt={title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-4 text-sm leading-7 text-[#77736c] md:col-span-4">
              {subtitle && <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#171717]">{subtitle}</p>}
              <p className="whitespace-pre-line">{body || "Capturing light, feeling & memories and all the things in between people and life."}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (v === "bio-lifestyle") {
    return (
      <section className={blockLayout.section.spacious}>
        <div className={`mx-auto ${blockLayout.container.wide}`}>
          <div className="grid items-center gap-8 md:grid-cols-12">
            <div className="aspect-[3/4] overflow-hidden bg-[#ebe8e2] md:col-span-5">
              <img src={mediaUrl(imageUrl)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <div className="md:col-span-5 md:col-start-7">
              {eyebrow && <p className={blockLayout.typography.eyebrow}>{eyebrow}</p>}
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-5xl">{title || "Capturing love, feelings & moments"}</h2>
              <p className="mt-6 text-sm leading-7 text-[#77736c]">{body || "We are an intimate duo dedicated to destination weddings across Vietnam and Southeast Asia."}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (v === "bio-moody") {
    return (
      <section className="relative overflow-hidden bg-[#1c1b1a] py-28 text-white md:py-40">
        <div className="absolute inset-0 opacity-40">
          <img src={mediaUrl(imageUrl)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center md:px-10">
          {eyebrow && <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">{eyebrow}</p>}
          <h2 className="mt-4 font-serif text-4xl italic md:text-6xl">{title || "Welcome, My name is Andy"}</h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/80">{body || "A dedicated fine art wedding and portrait studio based in Vietnam, traveling worldwide."}</p>
        </div>
      </section>
    );
  }

  // 2. TEAM VARIANTS
  if (v.startsWith("team-")) {
    const rawMembers = Array.isArray(data.members) ? data.members : [];
    const members = rawMembers.length > 0 ? (rawMembers as Array<{ name: string; role?: string; bio?: string }>) : [
      { name: "Andy Nguyen", role: "Lead Photographer", bio: "Observing candid subtleties and natural light." },
      { name: "Linh Tran", role: "Cinematographer", bio: "Framing rhythm and atmosphere in motion." },
      { name: "Sarah Vo", role: "Creative Producer", bio: "Crafting a seamless visual experience." },
    ];

    return (
      <section className={blockLayout.section.spacious}>
        <div className={`mx-auto ${blockLayout.container.wide}`}>
          {title && (
            <div className="mb-12 text-center">
              {eyebrow && <p className={blockLayout.typography.eyebrow}>{eyebrow}</p>}
              <h2 className="mt-3 font-serif text-3xl md:text-5xl">{title}</h2>
            </div>
          )}
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {members.map((m, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className={`aspect-[3/4] w-full overflow-hidden bg-[#ebe8e2] ${v === "team-arch" ? "rounded-t-full" : ""}`}>
                  <img
                    src={mediaUrl(imageUrl)}
                    alt={m.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-5 font-serif text-2xl">{m.name}</h3>
                {m.role && <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#77736c]">{m.role}</p>}
                {m.bio && <p className="mt-3 text-xs leading-6 text-[#77736c]">{m.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 3. SLIDER BANNER VARIANTS
  if (v.startsWith("slider-banner-")) {
    return (
      <section className="relative overflow-hidden bg-[#171717] py-28 text-white md:py-44">
        <div className="absolute inset-0 opacity-50">
          <img src={mediaUrl(imageUrl)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 text-center md:px-10">
          {subtitle && <p className="text-[10px] uppercase tracking-[0.25em] text-white/80">{subtitle}</p>}
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-7xl">{title || "Discover the World Through Our Lens"}</h2>
          {body && <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/80">{body}</p>}
        </div>
      </section>
    );
  }

  // 4. SERVICES VARIANTS
  if (v === "services-packages") {
    const rawPackages = Array.isArray(data.packages) ? data.packages : [];
    const packages = rawPackages.length > 0 ? (rawPackages as Array<{ name: string; price: string; features: string[] }>) : [
      { name: "The Intimate", price: "Contact for pricing", features: ["Up to 6 hours coverage", "1 Photographer", "Curated high-res gallery"] },
      { name: "The Celebration", price: "Featured Collection", features: ["Full day coverage", "Photo & Cinema team", "Artisan fine art album"] },
      { name: "The Destination", price: "Custom Quote", features: ["Multi-day celebration", "Pre-wedding editorial", "Drone & film coverage"] },
    ];

    return (
      <section className={blockLayout.section.spacious}>
        <div className={`mx-auto ${blockLayout.container.wide}`}>
          {title && (
            <div className="mb-14 text-center">
              {eyebrow && <p className={blockLayout.typography.eyebrow}>{eyebrow}</p>}
              <h2 className="mt-3 font-serif text-3xl md:text-5xl">{title}</h2>
            </div>
          )}
          <div className="grid gap-8 md:grid-cols-3">
            {packages.map((pkg, idx) => (
              <div key={idx} className="flex flex-col justify-between border border-[#d8d3ca] bg-white p-8 md:p-10">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#77736c]">Collection 0{idx + 1}</p>
                  <h3 className="mt-3 font-serif text-3xl">{pkg.name}</h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.15em] text-[#77736c]">{pkg.price}</p>
                  <div className="my-6 h-px w-full bg-[#eeeae3]" />
                  <ul className="space-y-3 text-xs leading-6 text-[#77736c]">
                    {(pkg.features || []).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <span className="text-[#171717]">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 pt-6">
                  <Link href="/contact" className="block w-full border border-[#171717] py-3 text-center text-xs uppercase tracking-[0.18em] transition hover:bg-[#171717] hover:text-white">
                    Inquire →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 5. TESTIMONIALS VARIANTS
  if (v.startsWith("testimonials-")) {
    const quote = typeof data.quote === "string" ? data.quote : "We are instantly drawn to their gentle warmth. Looking back at our photographs feels like reliving our wedding with all the tenderness.";
    const author = typeof data.author === "string" ? data.author : "Haley & David";
    const location = typeof data.location === "string" ? data.location : "Da Nang · Vietnam";

    if (v === "testimonials-portrait") {
      return (
        <section className={blockLayout.section.spacious}>
          <div className={`mx-auto ${blockLayout.container.wide}`}>
            <div className="grid items-center gap-10 md:grid-cols-12">
              <div className="aspect-[4/5] overflow-hidden bg-[#ebe8e2] md:col-span-5">
                <img src={mediaUrl(imageUrl)} alt={author} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <p className="font-serif text-2xl italic leading-relaxed text-[#171717] md:text-4xl">
                  “{quote}”
                </p>
                <div className="mt-8 border-t border-[#d8d3ca] pt-4">
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#171717]">{author}</p>
                  <p className="mt-1 text-xs text-[#77736c]">{location}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className={blockLayout.section.spacious}>
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <p className="font-serif text-2xl italic leading-relaxed text-[#171717] md:text-4xl">
            “{quote}”
          </p>
          <div className="mt-8">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#171717]">{author}</p>
            <p className="mt-1 text-xs text-[#77736c]">{location}</p>
          </div>
        </div>
      </section>
    );
  }

  // 6. EVENTS / TRAVEL DATES VARIANTS
  if (v.startsWith("events-")) {
    const rawEvents = Array.isArray(data.events) ? data.events : [];
    const events = rawEvents.length > 0 ? (rawEvents as Array<{ date: string; location: string }>) : [
      { date: "MARCH 2026", location: "Da Nang & Hoi An, Vietnam" },
      { date: "MAY 2026", location: "Phu Quoc & Con Dao, Vietnam" },
      { date: "SEPTEMBER 2026", location: "Kyoto & Tokyo, Japan" },
      { date: "NOVEMBER 2026", location: "Lake Como & Tuscany, Italy" },
    ];

    return (
      <section className={blockLayout.section.spacious}>
        <div className={`mx-auto ${blockLayout.container.wide}`}>
          <div className="grid items-center gap-10 md:grid-cols-12">
            <div className="aspect-[3/4] overflow-hidden bg-[#ebe8e2] md:col-span-5">
              <img src={mediaUrl(imageUrl)} alt="Travel Dates" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <div className="md:col-span-6 md:col-start-7">
              {eyebrow && <p className={blockLayout.typography.eyebrow}>{eyebrow}</p>}
              <h2 className="mt-3 font-serif text-3xl md:text-5xl">{title || "Upcoming Travel Dates"}</h2>
              <div className="mt-8 divide-y divide-[#d8d3ca]">
                {events.map((evt, i) => (
                  <div key={i} className="flex items-center justify-between py-4 text-xs">
                    <span className="font-mono uppercase tracking-wider text-[#77736c]">{evt.date}</span>
                    <span className="font-medium text-[#171717]">{evt.location}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 7. PARTNERS VARIANTS
  if (v.startsWith("partners-")) {
    const rawPartners = Array.isArray(data.partners) ? data.partners : [];
    const partners = rawPartners.length > 0 ? (rawPartners as string[]) : ["VOGUE", "BRIDES", "HARPER'S BAZAAR", "ELLE", "THE LANE"];

    return (
      <section className="border-y border-[#d8d3ca] py-16 md:py-20">
        <div className={`mx-auto ${blockLayout.container.wide} text-center`}>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#77736c]">{title || "FEATURED IN & PARTNERS"}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {partners.map((partner, idx) => (
              <span key={idx} className="font-serif text-lg tracking-widest text-[#5c574f] md:text-xl">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 8. FAQ VARIANTS
  if (v.startsWith("faq-")) {
    const rawItems = Array.isArray(data.items) ? data.items : [];
    const items = rawItems.length > 0 ? (rawItems as Array<{ q: string; a: string }>) : [
      { q: "How far in advance should we book?", a: "We typically book 6 to 12 months in advance to ensure our presence for your wedding date." },
      { q: "Do you travel for destination weddings?", a: "Yes, we photograph celebrations across Vietnam, throughout Southeast Asia, and worldwide." },
      { q: "When will our photographs and films be delivered?", a: "A sneak peek is delivered within 7 days. Your complete heirloom gallery is finished within 6 to 8 weeks." },
    ];

    return (
      <section className={blockLayout.section.spacious}>
        <div className="mx-auto max-w-4xl px-6 md:px-10">
          <div className="mb-12 text-center">
            {eyebrow && <p className={blockLayout.typography.eyebrow}>{eyebrow}</p>}
            <h2 className="mt-3 font-serif text-3xl md:text-5xl">{title || "Frequently Asked Questions"}</h2>
          </div>
          <div className="divide-y divide-[#d8d3ca] border-y border-[#d8d3ca]">
            {items.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-6">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left transition hover:opacity-70"
                  >
                    <span className="font-serif text-xl md:text-2xl">{item.q}</span>
                    <span className="text-xl font-light">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="mt-4 text-sm leading-7 text-[#77736c]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // 9. BLANK / CUSTOM FLEX BLOCK
  return (
    <section className={blockLayout.section.compact}>
      <div className={`mx-auto ${blockLayout.container.wide}`}>
        {title && <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>}
        {body && <div className="mt-4 whitespace-pre-line text-sm leading-7 text-[#77736c]">{body}</div>}
      </div>
    </section>
  );
}
