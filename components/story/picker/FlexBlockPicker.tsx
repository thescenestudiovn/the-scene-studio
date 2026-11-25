"use client";

import type { ContentBlockSelection, FlexBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };
type Group = { id: string; label: string; items: Array<[FlexBlockVariant, string, string]> };

const groups: Group[] = [
  {
    id: "bio",
    label: "Bio",
    items: [
      ["bio-1", "Bio 1", "/blocks/bio-1.jpg"],
      ["bio-2", "Bio 2", "/blocks/bio-2.jpg"],
      ["bio-3", "Bio 3", "/blocks/bio-3.jpg"],
    ],
  },
  {
    id: "team",
    label: "Team",
    items: [
      ["team-1", "Team 1", "/blocks/team-1.jpg"],
      ["team-2", "Team 2", "/blocks/team-2.jpg"],
      ["team-3", "Team 3", "/blocks/team-3.jpg"],
      ["team-4", "Team 4", "/blocks/team-4.jpg"],
      ["team-5", "Team 5", "/blocks/team-5.jpg"],
      ["team-6", "Team 6", "/blocks/team-6.jpg"],
    ],
  },
  {
    id: "info",
    label: "Info",
    items: [
      ["info-1", "Info 1", "/blocks/info-1.jpg"],
      ["info-2", "Info 2", "/blocks/info-2.jpg"],
      ["info-3", "Info 3", "/blocks/info-3.jpg"],
    ],
  },
  {
    id: "slider",
    label: "Slider Banner",
    items: [
      ["slider-1", "Banner Slider 1", "/blocks/slider-1.jpg"],
      ["slider-2", "Banner Slider 2", "/blocks/slider-2.jpg"],
      ["slider-3", "Banner Slider 3", "/blocks/slider-3.jpg"],
      ["slider-4", "Banner Slider 4", "/blocks/slider-4.jpg"],
      ["slider-5", "Banner Slider 5", "/blocks/slider-5.jpg"],
      ["slider-6", "Banner Slider 6", "/blocks/slider-6.jpg"],
    ],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    items: [
      ["portfolio-1", "Portfolio 1", "/blocks/portfolio-1.jpg"],
      ["portfolio-2", "Portfolio 2", "/blocks/portfolio-2.jpg"],
      ["portfolio-3", "Portfolio 3", "/blocks/portfolio-3.jpg"],
      ["portfolio-4", "Portfolio 4", "/blocks/portfolio-4.jpg"],
      ["portfolio-5", "Portfolio 5", "/blocks/portfolio-5.jpg"],
      ["portfolio-6", "Portfolio 6", "/blocks/portfolio-6.jpg"],
    ],
  },
  {
    id: "services",
    label: "Services",
    items: [
      ["services-1", "Services 1", "/blocks/services-1.jpg"],
      ["services-2", "Services 2", "/blocks/services-2.jpg"],
      ["services-3", "Services 3", "/blocks/services-3.jpg"],
      ["services-4", "Services 4", "/blocks/services-4.jpg"],
      ["services-5", "Services 5", "/blocks/services-5.jpg"],
      ["services-6", "Services 6", "/blocks/services-6.jpg"],
    ],
  },
  {
    id: "testimonials",
    label: "Testimonials",
    items: [
      ["testimonials-1", "Testimonials 1", "/blocks/testimonials-1.jpg"],
      ["testimonials-2", "Testimonials 2", "/blocks/testimonials-2.jpg"],
      ["testimonials-3", "Testimonials 3", "/blocks/testimonials-3.jpg"],
      ["testimonials-4", "Testimonials 4", "/blocks/testimonials-4.jpg"],
      ["testimonials-5", "Testimonials 5", "/blocks/testimonials-5.jpg"],
      ["testimonials-6", "Testimonials 6", "/blocks/testimonials-6.jpg"],
    ],
  },
  {
    id: "events",
    label: "Events & Travel Dates",
    items: [
      ["events-1", "Travel Dates 1", "/blocks/events-1.jpg"],
      ["events-2", "Travel Dates 2", "/blocks/events-2.jpg"],
      ["events-3", "Travel Dates 3", "/blocks/events-3.jpg"],
      ["events-4", "Travel Dates 4", "/blocks/events-4.jpg"],
      ["events-5", "Travel Dates 5", "/blocks/events-5.jpg"],
      ["events-6", "Travel Dates 6", "/blocks/events-6.jpg"],
    ],
  },
  {
    id: "partners",
    label: "Partners",
    items: [
      ["partners-1", "Partners 1", "/blocks/partners-1.jpg"],
      ["partners-2", "Partners 2", "/blocks/partners-2.jpg"],
      ["partners-3", "Partners 3", "/blocks/partners-3.jpg"],
      ["partners-4", "Partners 4", "/blocks/partners-4.jpg"],
      ["partners-5", "Partners 5", "/blocks/partners-5.jpg"],
      ["partners-6", "Partners 6", "/blocks/partners-6.jpg"],
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    items: [
      ["faq-1", "FAQ 1", "/blocks/faq-3.jpg"],
      ["faq-2", "FAQ 2", "/blocks/faq-4.jpg"],
      ["faq-3", "FAQ 3", "/blocks/faq-5.jpg"],
    ],
  },
  {
    id: "blank",
    label: "Blank Block",
    items: [
      ["blank", "Blank Canvas", "/blocks/blank.jpg"],
    ],
  },
];

export default function FlexBlockPicker({ onSelect }: Props) {
  return (
    <div className="space-y-9">
      {groups.map(group => (
        <section key={group.id}>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a867e]">{group.label}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map(([variant, label, preview]) => (
              <button
                key={variant}
                type="button"
                onClick={() => onSelect({ category: "flex", variant, data: {} })}
                className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#e8e4dc]">
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="px-5 py-4 text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
