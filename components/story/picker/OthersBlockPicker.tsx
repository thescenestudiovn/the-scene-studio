"use client";

import type { ContentBlockSelection, OthersBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

type OthersItem = {
  variant: OthersBlockVariant;
  label: string;
  badge?: string;
  preview: React.ReactNode;
  defaults?: Record<string, unknown>;
};

type Group = {
  id: string;
  label: string;
  items: OthersItem[];
};

export default function OthersBlockPicker({ onSelect }: Props) {
  const groups: Group[] = [
    {
      id: "basic",
      label: "Basic",
      items: [
        {
          variant: "spacer",
          label: "Spacer",
          defaults: {
            height: "medium", // small: 40px, medium: 80px, large: 140px
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center font-serif text-xl tracking-wide text-[#8a857d]">
              Spacer
            </div>
          ),
        },
        {
          variant: "divider-large",
          label: "Large Divider",
          defaults: {
            size: "large",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center px-6">
              <div className="h-px w-full bg-[#aaa59b]" />
            </div>
          ),
        },
        {
          variant: "divider-medium",
          label: "Medium Divider",
          defaults: {
            size: "medium",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center px-12">
              <div className="h-px w-[60%] bg-[#aaa59b]" />
            </div>
          ),
        },
        {
          variant: "divider-small",
          label: "Small Divider",
          defaults: {
            size: "small",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center px-16">
              <div className="h-px w-[25%] bg-[#aaa59b]" />
            </div>
          ),
        },
        {
          variant: "button",
          label: "Button",
          defaults: {
            label: "Explore Collection",
            url: "/stories",
            style: "solid", // solid, outline, underline
            align: "center",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center p-3">
              <div className="bg-[#2c2b29] px-6 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-white">
                BUTTON
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "advanced",
      label: "Advanced",
      items: [
        {
          variant: "embed-code",
          label: "Custom Embed Code",
          badge: "🚀",
          defaults: {
            title: "Custom Embed",
            html: "",
          },
          preview: (
            <div className="relative flex h-full w-full flex-col items-center justify-center p-3 text-center">
              <span className="font-mono text-2xl font-light text-[#8a857d]">&lt; / &gt;</span>
              <span className="mt-2 text-[9px] uppercase tracking-wider text-[#77736c]">Custom Embed Code</span>
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
                    category: "others",
                    variant: item.variant,
                    data: {
                      ...(item.defaults ?? {}),
                      variant: item.variant,
                    },
                  })
                }
                className="group relative overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]"
              >
                {item.badge && (
                  <span className="absolute left-3 top-3 z-10 text-sm">{item.badge}</span>
                )}
                <div className="aspect-[16/10] overflow-hidden bg-white">
                  {item.preview}
                </div>
                <div className="border-t border-[#eeeae3] px-5 py-4 text-center text-xs uppercase tracking-[0.15em] text-[#77736c]">
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
