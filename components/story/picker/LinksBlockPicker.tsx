"use client";

import type { ContentBlockSelection, LinksBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

type LinkItem = {
  variant: LinksBlockVariant;
  label: string;
  preview: React.ReactNode;
  defaults?: Record<string, unknown>;
};

export default function LinksBlockPicker({ onSelect }: Props) {
  const items: LinkItem[] = [
    {
      variant: "links-list",
      label: "Links · Editorial Row",
      defaults: {
        title: "Explore More",
        links: [
          { label: "Portfolio", url: "/gallery" },
          { label: "Films", url: "/films" },
          { label: "Stories", url: "/stories" },
          { label: "Inquire", url: "/contact" },
        ],
      },
      preview: (
        <div className="flex h-full w-full flex-col items-center justify-center space-y-2 p-3 text-center">
          <span className="font-serif text-[9px] text-[#171717]">Explore More</span>
          <div className="flex gap-2 text-[7px] uppercase tracking-wider text-[#77736c]">
            <span>Portfolio →</span>
            <span>Films →</span>
            <span>Stories →</span>
          </div>
        </div>
      ),
    },
    {
      variant: "links-buttons",
      label: "Links · Action Buttons",
      defaults: {
        title: "Quick Navigation",
        links: [
          { label: "View Wedding Films", url: "/films" },
          { label: "Schedule A Call", url: "/contact" },
        ],
      },
      preview: (
        <div className="flex h-full w-full items-center justify-center gap-2 p-3">
          <div className="border border-[#171717] bg-[#171717] px-3 py-1.5 text-[7px] uppercase tracking-wider text-white">
            Button 1
          </div>
          <div className="border border-[#171717] px-3 py-1.5 text-[7px] uppercase tracking-wider text-[#171717]">
            Button 2
          </div>
        </div>
      ),
    },
    {
      variant: "links-cards",
      label: "Links · Visual Cards",
      defaults: {
        title: "Featured Destinations",
        links: [
          { label: "Da Nang", url: "/destinations/vietnam/da-nang" },
          { label: "Hoi An", url: "/destinations/vietnam/hoi-an" },
          { label: "Phu Quoc", url: "/destinations/vietnam/phu-quoc" },
        ],
      },
      preview: (
        <div className="grid h-full w-full grid-cols-3 gap-1.5 p-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex aspect-[4/3] items-center justify-center border border-[#ddd8cf] bg-[#f8f6f0] text-[7px]">
              Card 0{i}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-9">
      <section>
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a867e]">Links</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <button
              key={item.variant}
              type="button"
              onClick={() =>
                onSelect({
                  category: "links",
                  variant: item.variant,
                  data: {
                    ...(item.defaults ?? {}),
                    variant: item.variant,
                  },
                })
              }
              className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#f0eee9]">
                {item.preview}
              </div>
              <div className="px-5 py-4 text-sm font-medium text-[#27251f]">
                {item.label}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
