"use client";

import type { ContentBlockSelection, ContentBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

const base = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";

const groups: Array<{
  id: string;
  label: string;
  items: Array<[ContentBlockVariant, string, string]>;
}> = [
  {
    id: "banners",
    label: "Banners",
    items: [
      ["banner-1", "Banner 1", "cta-banner-1.jpg"],
      ["banner-2", "Banner 2", "cta-banner-2.jpg"],
      ["banner-3", "Banner 3", "cta-banner-3.jpg"],
    ],
  },
  {
    id: "info",
    label: "Info Block",
    items: [
      ["info-1", "Info 1", "info-block-1.jpg"],
      ["info-2", "Info 2", "info-block-2.jpg"],
      ["info-3", "Info 3", "info-block-3.jpg"],
    ],
  },
  {
    id: "testimonial",
    label: "Testimonial",
    items: [
      ["testimonial-1", "Testimonial 1", "testimonial-1.jpg"],
      ["testimonial-2", "Testimonial 2", "testimonial-2.jpg"],
      ["testimonial-3", "Testimonial 3", "testimonial-3.jpg"],
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    items: [
      ["pricing-1", "Pricing 1", "pricing-1.jpg"],
      ["pricing-2", "Pricing 2", "pricing-2.jpg"],
      ["pricing-3", "Pricing 3", "pricing-3.jpg"],
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    items: [
      ["faq-1", "FAQ 1", "faq-1.jpg"],
      ["faq-2", "FAQ 2", "faq-2.jpg"],
      ["faq-3", "FAQ 3", "faq-3.jpg"],
    ],
  },
  {
    id: "quote",
    label: "Quote",
    items: [
      ["quote-1", "Quote 1", "quote-1.jpg"],
      ["quote-2", "Quote 2", "quote-2.jpg"],
      ["quote-3", "Quote 3", "quote-3.jpg"],
    ],
  },
];

function defaultData(variant: ContentBlockVariant): Record<string, unknown> {
  if (variant === "banner-video") return { youtube_url: "" };
  if (variant.startsWith("banner")) {
    return {
      title: "Enter a Heading",
      body: "Add a short description or call to action.",
      button_text: "Learn More",
      button_url: "#",
      media_ids: [],
    };
  }
  if (variant.startsWith("info")) {
    return {
      eyebrow: "Info",
      title: "Enter a Heading",
      body: "Add information about your studio, services, process or experience.",
      items: [
        { title: "Title", text: "Add supporting information here." },
        { title: "Title", text: "Add supporting information here." },
        { title: "Title", text: "Add supporting information here." },
      ],
      media_ids: [],
    };
  }
  if (variant.startsWith("testimonial")) {
    return {
      title: "Testimonial",
      quote: "Write a client quote here.",
      author: "Client Name",
      role: "Wedding",
      media_ids: [],
    };
  }
  if (variant.startsWith("pricing")) {
    return {
      eyebrow: "Pricing",
      title: "Packages",
      body: "Choose the collection that feels right for you.",
      items: [
        { title: "Collection One", price: "€0", text: "Add package details here.", features: ["Feature one", "Feature two"] },
        { title: "Collection Two", price: "€0", text: "Add package details here.", features: ["Feature one", "Feature two"] },
        { title: "Collection Three", price: "€0", text: "Add package details here.", features: ["Feature one", "Feature two"] },
      ],
    };
  }
  if (variant.startsWith("faq")) {
    return {
      eyebrow: "FAQ",
      title: "Frequently Asked Questions",
      items: [
        { question: "Question one", answer: "Add the answer here." },
        { question: "Question two", answer: "Add the answer here." },
        { question: "Question three", answer: "Add the answer here." },
      ],
    };
  }
  return {
    quote: "Write a meaningful quote here.",
    author: "Name",
    role: "Client",
  };
}

export default function ContentVariantsPicker({ onSelect }: Props) {
  return (
    <div className="space-y-9">
      {groups.map((group) => (
        <section key={group.id}>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a867e]">
              {group.label}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map(([variant, label, preview]) => (
              <button
                key={variant}
                type="button"
                onClick={() =>
                  onSelect({
                    category: "content",
                    variant,
                    data: { ...defaultData(variant), thumbnail_url: base + preview },
                  })
                }
                className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left hover:border-[#aaa49b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#e8e4dc]">
                  <img
                    src={base + preview}
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
