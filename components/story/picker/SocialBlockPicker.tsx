"use client";

import type { ContentBlockSelection, SocialBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

type SocialItem = {
  variant: SocialBlockVariant;
  label: string;
  preview: React.ReactNode;
  defaults?: Record<string, unknown>;
};

type Group = {
  id: string;
  label: string;
  items: SocialItem[];
};

export default function SocialBlockPicker({ onSelect }: Props) {
  const groups: Group[] = [
    {
      id: "instagram",
      label: "Instagram",
      items: [
        {
          variant: "instagram-grid",
          label: "Instagram · 4 Photos Strip",
          defaults: {
            title: "FOLLOW ME ON INSTAGRAM",
            handle: "@thescenestudiovn",
            instagram_url: "https://instagram.com/thescenestudiovn",
            photos: [
              "https://media.thescenestudio.asia/Haley-David/002-NT-HL-01178.jpg",
              "https://media.thescenestudio.asia/Haley-David/003-NT-HL-01185.jpg",
              "https://media.thescenestudio.asia/Haley-David/004-NT-HL-01201.jpg",
              "https://media.thescenestudio.asia/Haley-David/005-NT-HL-01210.jpg",
            ],
          },
          preview: (
            <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
              <span className="text-[7px] uppercase tracking-[0.2em] text-[#77736c]">Follow me on Instagram</span>
              <div className="mt-2 grid w-full grid-cols-4 gap-1">
                <div className="aspect-[4/5] bg-[#d9d3ca]" />
                <div className="aspect-[4/5] bg-[#cecad0]" />
                <div className="aspect-[4/5] bg-[#b8b3ab]" />
                <div className="aspect-[4/5] bg-[#c3b6a9]" />
              </div>
              <span className="mt-2 text-[6px] tracking-wider text-[#77736c]">@INSTAGRAM</span>
            </div>
          ),
        },
        {
          variant: "instagram-card",
          label: "Instagram · Asymmetric Banner",
          defaults: {
            title: "FOLLOW ME ON INSTAGRAM",
            handle: "@thescenestudiovn",
            instagram_url: "https://instagram.com/thescenestudiovn",
            photos: [
              "https://media.thescenestudio.asia/Haley-David/002-NT-HL-01178.jpg",
              "https://media.thescenestudio.asia/Haley-David/003-NT-HL-01185.jpg",
              "https://media.thescenestudio.asia/Haley-David/004-NT-HL-01201.jpg",
            ],
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center p-2">
              <div className="relative flex h-[70%] w-full items-center">
                <div className="z-10 flex h-full w-[45%] flex-col justify-center bg-[#ede9e1] p-2 text-left">
                  <span className="text-[8px]">📷</span>
                  <span className="mt-0.5 text-[6px] font-medium tracking-wide">FOLLOW ME ON INSTAGRAM</span>
                  <span className="text-[5px] text-[#77736c]">#instagram</span>
                </div>
                <div className="-ml-3 grid h-full flex-1 grid-cols-3 gap-1">
                  <div className="h-full bg-[#cecad0]" />
                  <div className="h-full bg-[#b8b3ab]" />
                  <div className="h-full bg-[#c3b6a9]" />
                </div>
              </div>
            </div>
          ),
        },
        {
          variant: "instagram-split",
          label: "Instagram · Collage & Card",
          defaults: {
            title: "Follow me on Instagram",
            handle: "@thescenestudiovn",
            instagram_url: "https://instagram.com/thescenestudiovn",
            photos: [
              "https://media.thescenestudio.asia/Haley-David/002-NT-HL-01178.jpg",
              "https://media.thescenestudio.asia/Haley-David/003-NT-HL-01185.jpg",
              "https://media.thescenestudio.asia/Haley-David/004-NT-HL-01201.jpg",
              "https://media.thescenestudio.asia/Haley-David/005-NT-HL-01210.jpg",
            ],
          },
          preview: (
            <div className="grid h-full w-full grid-cols-2 gap-2 p-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="aspect-square bg-[#d9d3ca]" />
                <div className="aspect-square bg-[#cecad0]" />
                <div className="aspect-square bg-[#b8b3ab]" />
                <div className="aspect-square bg-[#c3b6a9]" />
              </div>
              <div className="flex flex-col items-center justify-center bg-[#f4f2ec] p-2 text-center">
                <span className="text-[10px]">📷</span>
                <span className="mt-1 text-[6px] tracking-wider text-[#77736c]">@INSTAGRAM</span>
                <span className="mt-1 text-[7px] text-[#171717]">Follow me on Instagram →</span>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "social-links",
      label: "Social Links",
      items: [
        {
          variant: "social-icons-minimal",
          label: "Social Links · Minimal",
          defaults: {
            facebook: "https://facebook.com",
            twitter: "https://x.com",
            instagram: "https://instagram.com/thescenestudiovn",
            pinterest: "https://pinterest.com",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center gap-4 text-sm text-[#171717]">
              <span className="font-bold">f</span>
              <span className="font-bold">𝕏</span>
              <span className="text-base font-medium">📷</span>
              <span className="font-bold text-[#c8232c]">P</span>
            </div>
          ),
        },
        {
          variant: "social-icons-solid",
          label: "Social Links · Solid Buttons",
          defaults: {
            facebook: "https://facebook.com",
            twitter: "https://x.com",
            instagram: "https://instagram.com/thescenestudiovn",
            pinterest: "https://pinterest.com",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center bg-[#1877f2] text-[11px] font-bold text-white">f</div>
              <div className="flex h-6 w-6 items-center justify-center bg-black text-[11px] font-bold text-white">𝕏</div>
              <div className="flex h-6 w-6 items-center justify-center bg-[#e4405f] text-[10px] text-white">📷</div>
              <div className="flex h-6 w-6 items-center justify-center bg-[#bd081c] text-[11px] font-bold text-white">P</div>
            </div>
          ),
        },
        {
          variant: "social-icons-outline",
          label: "Social Links · Outline",
          defaults: {
            facebook: "https://facebook.com",
            twitter: "https://x.com",
            instagram: "https://instagram.com/thescenestudiovn",
            pinterest: "https://pinterest.com",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#171717] text-[10px] font-bold">f</div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#171717] text-[10px] font-bold">𝕏</div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#171717] text-[9px]">📷</div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#171717] text-[10px] font-bold">P</div>
            </div>
          ),
        },
        {
          variant: "social-icons-dark",
          label: "Social Links · Square Dark",
          defaults: {
            facebook: "https://facebook.com",
            twitter: "https://x.com",
            instagram: "https://instagram.com/thescenestudiovn",
            pinterest: "https://pinterest.com",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center border border-[#171717] bg-[#171717] text-[10px] font-bold text-white">f</div>
              <div className="flex h-6 w-6 items-center justify-center border border-[#171717] bg-[#171717] text-[10px] font-bold text-white">𝕏</div>
              <div className="flex h-6 w-6 items-center justify-center border border-[#171717] bg-[#171717] text-[9px] text-white">📷</div>
              <div className="flex h-6 w-6 items-center justify-center border border-[#171717] bg-[#171717] text-[10px] font-bold text-white">P</div>
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <div className="space-y-9">
      {groups.map(group => (
        <section key={group.id}>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a867e]">{group.label}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map(item => (
              <button
                key={item.variant}
                type="button"
                onClick={() =>
                  onSelect({
                    category: "social",
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
      ))}
    </div>
  );
}
