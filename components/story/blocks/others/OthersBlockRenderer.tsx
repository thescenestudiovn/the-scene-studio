"use client";

import Link from "next/link";
import { blockLayout } from "@/components/content/blockLayout";

type OthersBlockProps = {
  data: Record<string, unknown>;
  variant?: string | null;
};

export default function OthersBlockRenderer({ data, variant = "spacer" }: OthersBlockProps) {
  const v = variant || "spacer";

  if (v === "spacer") {
    const height = typeof data.height === "string" ? data.height : "medium";
    const heightClass =
      height === "small" ? "h-10 md:h-16" : height === "large" ? "h-32 md:h-48" : "h-20 md:h-28";
    return <div className={`w-full ${heightClass}`} aria-hidden="true" />;
  }

  if (v === "divider-large") {
    return (
      <div className="mx-auto w-full px-6 md:px-10">
        <hr className="border-t border-[#d8d3ca]" />
      </div>
    );
  }

  if (v === "divider-medium") {
    return (
      <div className="mx-auto max-w-4xl px-6 md:px-10">
        <hr className="border-t border-[#d8d3ca]" />
      </div>
    );
  }

  if (v === "divider-small") {
    return (
      <div className="mx-auto flex justify-center py-6">
        <hr className="w-16 border-t border-[#d8d3ca]" />
      </div>
    );
  }

  if (v === "button") {
    const label = typeof data.label === "string" ? data.label : "Explore Collection";
    const url = typeof data.url === "string" ? data.url : "/stories";
    const style = typeof data.style === "string" ? data.style : "solid";
    const align = typeof data.align === "string" ? data.align : "center";

    const alignClass =
      align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

    return (
      <div className={`mx-auto flex ${blockLayout.container.wide} px-6 py-8 ${alignClass} md:px-10`}>
        <Link
          href={url}
          className={`inline-block px-8 py-3.5 text-xs uppercase tracking-[0.2em] transition ${
            style === "outline"
              ? "border border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-white"
              : "border border-[#171717] bg-[#171717] text-white hover:bg-white hover:text-[#171717]"
          }`}
        >
          {label}
        </Link>
      </div>
    );
  }

  if (v === "embed-code") {
    const html = typeof data.html === "string" ? data.html : "";
    if (!html) return null;
    return (
      <section className={blockLayout.section.compact}>
        <div
          className={`mx-auto ${blockLayout.container.wide}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
    );
  }

  return null;
}
