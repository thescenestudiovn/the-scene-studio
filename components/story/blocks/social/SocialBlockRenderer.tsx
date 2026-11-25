"use client";

import Link from "next/link";
import { blockLayout } from "@/components/content/blockLayout";
import { mediaUrl } from "@/lib/media";

type SocialBlockProps = {
  data: Record<string, unknown>;
  variant?: string | null;
};

const DEFAULT_PHOTOS = [
  "https://media.thescenestudio.asia/Haley-David/002-NT-HL-01178.jpg",
  "https://media.thescenestudio.asia/Haley-David/003-NT-HL-01185.jpg",
  "https://media.thescenestudio.asia/Haley-David/004-NT-HL-01201.jpg",
  "https://media.thescenestudio.asia/Haley-David/005-NT-HL-01210.jpg",
];

export default function SocialBlockRenderer({ data, variant = "instagram-grid" }: SocialBlockProps) {
  const v = variant || "instagram-grid";
  const title = typeof data.title === "string" ? data.title : "FOLLOW ME ON INSTAGRAM";
  const handle = typeof data.handle === "string" ? data.handle : "@thescenestudiovn";
  const instagramUrl = typeof data.instagram_url === "string" ? data.instagram_url : "https://instagram.com/thescenestudiovn";
  const photos = Array.isArray(data.photos) && data.photos.length > 0 ? (data.photos as string[]) : DEFAULT_PHOTOS;

  const facebookUrl = typeof data.facebook === "string" ? data.facebook : "https://facebook.com";
  const twitterUrl = typeof data.twitter === "string" ? data.twitter : "https://x.com";
  const pinterestUrl = typeof data.pinterest === "string" ? data.pinterest : "https://pinterest.com";

  if (v === "instagram-grid") {
    return (
      <section className={blockLayout.section.compact}>
        <div className={`mx-auto ${blockLayout.container.wide} text-center`}>
          <Link href={instagramUrl} target="_blank" rel="noreferrer" className="inline-block group">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#77736c] transition-opacity group-hover:opacity-60">{title}</p>
          </Link>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-5">
            {photos.slice(0, 4).map((src, i) => (
              <Link key={i} href={instagramUrl} target="_blank" rel="noreferrer" className="group overflow-hidden bg-[#ebe8e2]">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={mediaUrl(src)}
                    alt={`Instagram photo ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs uppercase tracking-[0.2em] text-[#77736c] transition hover:text-[#171717]"
            >
              {handle}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (v === "instagram-card") {
    return (
      <section className={blockLayout.section.compact}>
        <div className={`mx-auto ${blockLayout.container.wide}`}>
          <div className="relative flex flex-col md:flex-row md:items-center">
            <div className="z-10 flex flex-col justify-center bg-[#f2ede4] p-8 md:w-[38%] md:p-12">
              <span className="text-xl">📷</span>
              <h3 className="mt-4 font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#171717]">{title}</h3>
              <p className="mt-2 text-xs text-[#77736c]">{handle}</p>
              <Link
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block text-xs uppercase tracking-[0.15em] text-[#171717] transition hover:opacity-60"
              >
                Follow on Instagram →
              </Link>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-2 md:-ml-6">
              {photos.slice(0, 3).map((src, i) => (
                <div key={i} className="aspect-[3/4] overflow-hidden bg-[#ebe8e2]">
                  <img src={mediaUrl(src)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (v === "instagram-split") {
    return (
      <section className={blockLayout.section.compact}>
        <div className={`mx-auto grid ${blockLayout.container.wide} items-center gap-8 md:grid-cols-2`}>
          <div className="grid grid-cols-2 gap-3">
            {photos.slice(0, 4).map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden bg-[#ebe8e2]">
                <img src={mediaUrl(src)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center border border-[#d8d3ca] bg-[#fbfaf7] p-10 text-center md:p-16">
            <span className="text-2xl">📷</span>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#77736c]">{handle}</p>
            <h3 className="mt-3 font-serif text-3xl md:text-4xl">{title}</h3>
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 border-b border-[#171717] pb-1 text-xs uppercase tracking-[0.2em] transition hover:opacity-60"
            >
              Follow me on Instagram →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Social Links Variants
  const socialItems = [
    { name: "Facebook", icon: "f", href: facebookUrl, bg: "#1877f2" },
    { name: "X", icon: "𝕏", href: twitterUrl, bg: "#000000" },
    { name: "Instagram", icon: "📷", href: instagramUrl, bg: "#e4405f" },
    { name: "Pinterest", icon: "P", href: pinterestUrl, bg: "#bd081c" },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto flex max-w-xl items-center justify-center gap-6">
        {socialItems.map(item => {
          if (v === "social-icons-solid") {
            return (
              <Link
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                style={{ backgroundColor: item.bg }}
                className="flex h-10 w-10 items-center justify-center text-sm font-bold text-white transition hover:opacity-85"
                title={item.name}
              >
                {item.icon}
              </Link>
            );
          }
          if (v === "social-icons-outline") {
            return (
              <Link
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#171717] text-sm font-medium text-[#171717] transition hover:bg-[#171717] hover:text-white"
                title={item.name}
              >
                {item.icon}
              </Link>
            );
          }
          if (v === "social-icons-dark") {
            return (
              <Link
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center border border-[#171717] bg-[#171717] text-sm font-medium text-white transition hover:bg-transparent hover:text-[#171717]"
                title={item.name}
              >
                {item.icon}
              </Link>
            );
          }
          // Default: minimal
          return (
            <Link
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="text-base text-[#171717] transition hover:opacity-50"
              title={item.name}
            >
              {item.icon}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
