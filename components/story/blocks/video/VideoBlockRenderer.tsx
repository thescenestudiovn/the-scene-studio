"use client";

import { blockLayout } from "@/components/content/blockLayout";

type Media = { id: string; path: string; filename?: string | null; alt?: string | null };
type VideoBlockProps = {
  data: Record<string, unknown>;
  variant?: string | null;
  media?: Media[];
};

function youtubeId(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || null;
      if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || null;
    }
  } catch {}
  return null;
}

export default function VideoBlockRenderer({ data, variant = "video-large" }: VideoBlockProps) {
  const url = typeof data.youtube_url === "string" ? data.youtube_url : "";
  const id = youtubeId(url);
  const title = typeof data.title === "string" ? data.title : "";
  const body = typeof data.body === "string" ? data.body : "";
  const eyebrow = typeof data.eyebrow === "string" ? data.eyebrow : "";
  const v = variant || "video-large";

  const player = (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      {id ? (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${id}`}
          title={title || "Wedding Film"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-[#222129] via-[#433c4a] to-[#7a6b61] text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-black/40 text-xl backdrop-blur-sm">
            ▶
          </div>
        </div>
      )}
    </div>
  );

  // 1. Direct Video Variants (Large, Medium, Full)
  if (v === "video-medium") {
    return (
      <section className={blockLayout.section.compact}>
        <div className={`mx-auto ${blockLayout.container.narrow}`}>
          {player}
        </div>
      </section>
    );
  }

  if (v === "video-full") {
    return (
      <section className="py-12 md:py-16">
        <div className="w-full">
          {player}
        </div>
      </section>
    );
  }

  if (v === "video-large" || v === "banner-video") {
    return (
      <section className={blockLayout.section.compact}>
        <div className={`mx-auto ${blockLayout.container.wide}`}>
          {player}
        </div>
      </section>
    );
  }

  // 2. Video Banners (Center, Bottom, Split)
  if (v === "video-banner-center" || v === "video-banner-bottom") {
    const isBottom = v === "video-banner-bottom";
    return (
      <section className="py-10 md:py-16">
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <div className="relative overflow-hidden bg-black">
            {player}
            {(title || body) && (
              <div
                className={`pointer-events-none absolute inset-0 flex flex-col ${
                  isBottom ? "justify-end pb-8 md:pb-12" : "justify-center"
                } items-center bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 text-center text-white`}
              >
                {eyebrow && (
                  <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/80">{eyebrow}</p>
                )}
                {title && (
                  <h2 className="font-serif text-3xl tracking-tight md:text-5xl">{title}</h2>
                )}
                {body && (
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/80">{body}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (v === "video-banner-split") {
    return (
      <section className={blockLayout.section.compact}>
        <div className={`mx-auto grid ${blockLayout.container.wide} overflow-hidden border border-[#d8d3ca] bg-white md:grid-cols-2`}>
          <div>{player}</div>
          <div className="flex flex-col items-center justify-center p-8 text-center md:p-14">
            {eyebrow && (
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#77736c]">{eyebrow}</p>
            )}
            {title && <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>}
            {body && <p className="mt-3 max-w-sm text-sm leading-7 text-[#77736c]">{body}</p>}
            <div className="mt-6 h-px w-12 bg-[#d8d3ca]" />
          </div>
        </div>
      </section>
    );
  }

  // 3. Video with Text Variants
  if (v === "video-text-large" || v === "video-text-medium" || v === "video-text-small") {
    const widthClass =
      v === "video-text-small"
        ? blockLayout.container.narrow
        : v === "video-text-medium"
        ? blockLayout.container.medium
        : blockLayout.container.wide;

    return (
      <section className={blockLayout.section.compact}>
        <div className={`mx-auto ${widthClass}`}>
          {player}
          <div className="mt-8 text-center">
            {eyebrow && (
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">{eyebrow}</p>
            )}
            {title && (
              <h2 className="mt-2 font-serif text-3xl md:text-4xl">{title}</h2>
            )}
            {body && (
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#77736c]">{body}</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (v === "video-text-split" || v === "video-text-split-large" || v === "video-text-split-right") {
    const isTextLeft = v === "video-text-split" || v === "video-text-split-large";
    const isLarge = v === "video-text-split-large" || v === "video-text-split-right";

    return (
      <section className={blockLayout.section.compact}>
        <div className={`mx-auto grid ${blockLayout.container.wide} items-center gap-10 md:grid-cols-12`}>
          <div
            className={`${
              isLarge ? (isTextLeft ? "md:col-span-4" : "md:col-span-4 md:order-2") : "md:col-span-6"
            } ${!isTextLeft && !isLarge ? "md:order-2" : ""}`}
          >
            {eyebrow && (
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#77736c]">{eyebrow}</p>
            )}
            {title && <h2 className="font-serif text-3xl leading-tight md:text-5xl">{title}</h2>}
            {body && <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#77736c]">{body}</p>}
          </div>
          <div
            className={`${
              isLarge ? (isTextLeft ? "md:col-span-8" : "md:col-span-8 md:order-1") : "md:col-span-6"
            } ${!isTextLeft && !isLarge ? "md:order-1" : ""}`}
          >
            {player}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={blockLayout.section.compact}>
      <div className={`mx-auto ${blockLayout.container.wide}`}>
        {player}
      </div>
    </section>
  );
}
