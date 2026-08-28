"use client";

import type { BannerBlockVariant, ContentBlockSelection } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };
type Banner = { variant: BannerBlockVariant; label: string; preview: string };

const base = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const banners: Banner[] = [
  { variant: "banner-1", label: "Banner 1", preview: "cta-banner-1.jpg" },
  { variant: "banner-2", label: "Banner 2", preview: "cta-banner-2.jpg" },
  { variant: "banner-3", label: "Banner 3", preview: "cta-banner-3.jpg" },
  { variant: "banner-headline", label: "Banner with Headline", preview: "cta-banner-headline.jpg" },
  { variant: "banner-media", label: "Banner Media Only", preview: "cta-banner-media.jpg" },
  { variant: "banner-slider", label: "Banner Slider", preview: "cta-slider-banner-1.jpg" },
];

export default function BannerBlockPicker({ onSelect }: Props) {
  return <div className="space-y-5">
    <div className="mb-7"><p className="text-[10px] uppercase tracking-[0.18em] text-[#8a867e]">Banners</p><p className="mt-2 max-w-2xl text-sm leading-6 text-[#77736c]">Call-to-action banners for introducing a service, destination, story or other featured content.</p></div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {banners.map(({ variant, label, preview }) => <button key={variant} type="button" onClick={() => onSelect({ category: "content", variant, data: { demo_preview: `${base}${preview}` } })} className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]">
        <div className="aspect-[16/9] overflow-hidden bg-[#e8e4dc]"><img src={`${base}${preview}`} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" /></div>
        <div className="px-5 py-4 text-sm font-medium">{label}</div>
      </button>)}
    </div>
  </div>;
}
