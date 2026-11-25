"use client";

import type { ContentBlockSelection, FlexBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };

type FlexItem = {
  variant: FlexBlockVariant;
  label: string;
  preview: React.ReactNode;
  defaults?: Record<string, unknown>;
};

type Group = {
  id: string;
  label: string;
  items: FlexItem[];
};

export default function FlexBlockPicker({ onSelect }: Props) {
  const groups: Group[] = [
    {
      id: "bio",
      label: "Bio",
      items: [
        {
          variant: "bio-editorial",
          label: "Bio · Editorial 3-Column",
          defaults: {
            eyebrow: "ABOUT THE ARTIST",
            title: "Hi, my name is Jane Riley",
            subtitle: "Lifestyle storyteller",
            body: "Capturing light, feeling & memories and all the things in between people and life. A thoughtful approach to documenting destination weddings.",
            image_url: "https://media.thescenestudiovn.asia/Haley-David/002-NT-HL-01178.jpg",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-between gap-2 p-3 text-left">
              <div className="w-[30%]">
                <span className="font-serif text-[8px] text-[#171717]">Hi, my name is Jane Riley</span>
              </div>
              <div className="aspect-[3/4] w-[35%] bg-gradient-to-b from-[#d5cfc4] to-[#a39c90]" />
              <div className="w-[30%] text-[6px] text-[#77736c]">
                <span>Lifestyle storyteller</span>
                <p className="mt-1 line-clamp-3">Capturing light, feelings & moments.</p>
              </div>
            </div>
          ),
        },
        {
          variant: "bio-lifestyle",
          label: "Bio · Story & Details",
          defaults: {
            title: "Capturing love, feelings & moments",
            body: "We are an intimate duo dedicated to destination weddings across Vietnam and Southeast Asia. We believe genuine moments carry eternal weight.",
            image_url: "https://media.thescenestudiovn.asia/Haley-David/003-NT-HL-01185.jpg",
          },
          preview: (
            <div className="flex h-full w-full items-center gap-2 p-3">
              <div className="aspect-[3/4] w-[30%] bg-[#b8b3ab]" />
              <div className="flex-1 text-left">
                <span className="block font-serif text-[7px] text-[#171717]">Capturing love & moments</span>
                <span className="mt-1 block text-[5px] text-[#77736c]">An intimate approach to documenting destination celebrations.</span>
              </div>
              <div className="aspect-square w-[20%] bg-[#cecad0]" />
            </div>
          ),
        },
        {
          variant: "bio-moody",
          label: "Bio · Full Bleed Moody",
          defaults: {
            title: "Welcome, My name is Jesse Riley",
            body: "A dedicated fine art wedding and portrait studio based in Vietnam, traveling worldwide.",
            image_url: "https://media.thescenestudiovn.asia/Haley-David/004-NT-HL-01201.jpg",
          },
          preview: (
            <div className="relative flex h-full w-full items-center justify-center bg-[#252321] p-3 text-center text-white">
              <div className="max-w-[70%]">
                <span className="font-serif text-[9px] italic text-[#f4efe6]">Welcome, My name is Jesse</span>
                <p className="mt-1 line-clamp-2 text-[5px] text-white/70">A fine art destination wedding studio in Vietnam.</p>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "team",
      label: "Team",
      items: [
        {
          variant: "team-grid",
          label: "Team · 3 Members",
          defaults: {
            title: "Meet the Team",
            members: [
              { name: "Andy Nguyen", role: "Lead Photographer", bio: "Observing candid subtleties and natural light." },
              { name: "Linh Tran", role: "Cinematographer", bio: "Framing rhythm and atmosphere in motion." },
              { name: "Sarah Vo", role: "Creative Producer", bio: "Crafting a seamless visual experience." },
            ],
          },
          preview: (
            <div className="grid h-full w-full grid-cols-3 gap-2 p-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="aspect-[3/4] w-full bg-[#d5cfc4]" />
                  <span className="mt-1 text-[6px] font-medium text-[#171717]">Artist 0{i}</span>
                  <span className="text-[5px] text-[#8a857d]">Photographer</span>
                </div>
              ))}
            </div>
          ),
        },
        {
          variant: "team-arch",
          label: "Team · Arch Portraits",
          defaults: {
            title: "The Artists",
            members: [
              { name: "Andy Nguyen", role: "Lead Photographer" },
              { name: "Linh Tran", role: "Cinematographer" },
              { name: "Sarah Vo", role: "Creative Producer" },
            ],
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center gap-3 p-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-14 w-10 rounded-t-full bg-[#bbb5aa]" />
                  <span className="mt-1 text-[6px] text-[#171717]">Artist 0{i}</span>
                </div>
              ))}
            </div>
          ),
        },
        {
          variant: "team-duo",
          label: "Team · Duo Feature",
          defaults: {
            title: "The Founders",
            members: [
              { name: "Andy & Linh", role: "Creative Directors", bio: "Partners in life and art." },
            ],
          },
          preview: (
            <div className="grid h-full w-full grid-cols-2 gap-1 p-2">
              <div className="aspect-[4/5] bg-[#c3b6a9]" />
              <div className="aspect-[4/5] bg-[#9e9589]" />
            </div>
          ),
        },
      ],
    },
    {
      id: "slider-banner",
      label: "Slider Banner",
      items: [
        {
          variant: "slider-banner-full",
          label: "Slider Banner · Full Caption",
          defaults: {
            title: "Discover the World Through Our Lens",
            subtitle: "DESTINATION WEDDINGS",
          },
          preview: (
            <div className="relative flex h-full w-full items-end bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
              <div className="absolute inset-0 -z-10 bg-[#3b3a4a]" />
              <div>
                <span className="text-[6px] uppercase tracking-widest text-white/70">DESTINATION WEDDINGS</span>
                <span className="block font-serif text-[9px]">Discover the World Through Our Lens</span>
              </div>
            </div>
          ),
        },
        {
          variant: "slider-banner-center",
          label: "Slider Banner · Centered",
          defaults: {
            title: "Authenticity Unveiled",
            subtitle: "CAPTURING LIFE",
          },
          preview: (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#2d3748] p-3 text-center text-white">
              <span className="font-serif text-[10px] tracking-wide">Authenticity Unveiled</span>
              <span className="mt-1 text-[6px] tracking-widest text-white/70">THE TRUE MOMENTS OF YOUR LIFE</span>
            </div>
          ),
        },
        {
          variant: "slider-banner-dots",
          label: "Slider Banner · Carousel Dots",
          defaults: {
            title: "Timeless Stories",
            subtitle: "FINE ART DOCUMENTARY",
          },
          preview: (
            <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#4a413d] p-3 text-center text-white">
              <span className="font-serif text-[10px]">Timeless Stories</span>
              <div className="absolute bottom-2 flex gap-1">
                <div className="h-1 w-1 rounded-full bg-white" />
                <div className="h-1 w-1 rounded-full bg-white/40" />
                <div className="h-1 w-1 rounded-full bg-white/40" />
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "services",
      label: "Services",
      items: [
        {
          variant: "services-packages",
          label: "Services · 3 Packages",
          defaults: {
            title: "Investment & Packages",
            packages: [
              { name: "The Intimate", price: "Contact for pricing", features: ["Up to 6 hours coverage", "1 Photographer", "Curated high-res gallery"] },
              { name: "The Celebration", price: "Featured Collection", features: ["Full day coverage", "Photo & Cinema team", "Artisan fine art album"] },
              { name: "The Destination", price: "Custom Quote", features: ["Multi-day celebration", "Pre-wedding editorial", "Drone & film coverage"] },
            ],
          },
          preview: (
            <div className="grid h-full w-full grid-cols-3 gap-1.5 p-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col justify-between border border-[#e5e1d8] bg-[#f8f6f0] p-1.5 text-center">
                  <span className="text-[6px] uppercase tracking-wider text-[#77736c]">Package 0{i}</span>
                  <div className="my-1 h-px w-full bg-[#d8d3ca]" />
                  <span className="text-[5px] text-[#8a857d]">Features list</span>
                </div>
              ))}
            </div>
          ),
        },
        {
          variant: "services-feature",
          label: "Services · Photo & Details",
          defaults: {
            title: "Wedding Photography",
            body: "Our editorial photography documents the emotion, fashion, and unspoken nuance of your celebration.",
          },
          preview: (
            <div className="flex h-full w-full items-center gap-2 p-2">
              <div className="flex-1 text-left">
                <span className="font-serif text-[8px] text-[#171717]">Wedding Photography</span>
                <span className="mt-1 block text-[5px] text-[#77736c]">Full day destination coverage.</span>
              </div>
              <div className="aspect-[3/4] w-[40%] bg-[#bfb7aa]" />
            </div>
          ),
        },
        {
          variant: "services-duo",
          label: "Services · Side by Side",
          defaults: {
            title: "Photography & Cinematography",
            body: "Two disciplines united by a shared minimalist vision.",
          },
          preview: (
            <div className="grid h-full w-full grid-cols-2 gap-2 p-2">
              <div className="aspect-[4/3] bg-[#c3b6a9]" />
              <div className="aspect-[4/3] bg-[#a89e90]" />
            </div>
          ),
        },
      ],
    },
    {
      id: "testimonials",
      label: "Testimonials",
      items: [
        {
          variant: "testimonials-portrait",
          label: "Testimonials · Portrait & Quote",
          defaults: {
            quote: "We are instantly drawn to their gentle warmth. Looking back at our photographs feels like reliving our wedding with all the tenderness.",
            author: "Haley & David",
            location: "Da Nang · Vietnam",
          },
          preview: (
            <div className="flex h-full w-full items-center gap-2 p-3">
              <div className="aspect-square w-[35%] bg-[#cec7bd]" />
              <div className="flex-1 text-left">
                <span className="font-serif text-[7px] italic text-[#171717]">“We were instantly drawn to their warmth…”</span>
                <span className="mt-1 block text-[5px] uppercase tracking-wider text-[#8a857d]">Haley & David</span>
              </div>
            </div>
          ),
        },
        {
          variant: "testimonials-card",
          label: "Testimonials · Centered Card",
          defaults: {
            quote: "Every frame they captured is pure poetry. They gave us memories that will remain timeless for generations.",
            author: "Emma & Julian",
            location: "Hoi An · Vietnam",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center p-3 text-center">
              <div className="border border-[#e0dad0] bg-[#fbfaf7] p-3">
                <span className="font-serif text-[7px] italic text-[#171717]">“Every frame they captured is pure poetry.”</span>
                <span className="mt-1 block text-[5px] uppercase tracking-wider text-[#8a857d]">Emma & Julian</span>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "events",
      label: "Events · Travel Dates",
      items: [
        {
          variant: "events-list",
          label: "Travel Dates · List with Photo",
          defaults: {
            title: "Upcoming Travel Dates",
            events: [
              { date: "MARCH 2026", location: "Da Nang & Hoi An, Vietnam" },
              { date: "MAY 2026", location: "Phu Quoc & Con Dao, Vietnam" },
              { date: "SEPTEMBER 2026", location: "Kyoto & Tokyo, Japan" },
              { date: "NOVEMBER 2026", location: "Lake Como & Tuscany, Italy" },
            ],
          },
          preview: (
            <div className="flex h-full w-full items-center gap-2 p-2">
              <div className="aspect-[3/4] w-[35%] bg-[#b8b0a5]" />
              <div className="flex-1 space-y-1 text-left text-[6px]">
                <span className="font-medium text-[#171717]">Travel Dates</span>
                <div className="h-px bg-[#ddd8cf]" />
                <span className="block text-[#77736c]">March · Da Nang</span>
                <span className="block text-[#77736c]">May · Phu Quoc</span>
                <span className="block text-[#77736c]">Sept · Japan</span>
              </div>
            </div>
          ),
        },
        {
          variant: "events-grid",
          label: "Travel Dates · Card Grid",
          defaults: {
            title: "Tour Schedule",
            events: [
              { date: "SPRING", location: "Vietnam Coastal" },
              { date: "SUMMER", location: "Southern Europe" },
              { date: "AUTUMN", location: "East Asia" },
            ],
          },
          preview: (
            <div className="grid h-full w-full grid-cols-2 gap-2 bg-[#eae6de] p-3">
              <div className="text-[6px] font-medium">Schedule</div>
              <div className="space-y-1 text-[5px] text-[#77736c]">
                <div>• Da Nang, Vietnam</div>
                <div>• Tuscany, Italy</div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "partners",
      label: "Partners · Vendors",
      items: [
        {
          variant: "partners-row",
          label: "Partners · Clean Logo Row",
          defaults: {
            title: "FEATURED IN & PARTNERS",
            partners: ["VOGUE", "BRIDES", "HARPER'S BAZAAR", "ELLE", "THE LANE"],
          },
          preview: (
            <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
              <span className="text-[6px] tracking-widest text-[#8a857d]">FEATURED IN</span>
              <div className="mt-2 flex items-center justify-center gap-3 font-serif text-[8px] text-[#403c36]">
                <span>VOGUE</span>
                <span>BRIDES</span>
                <span>BAZAAR</span>
              </div>
            </div>
          ),
        },
        {
          variant: "partners-grid",
          label: "Partners · Grid Showcase",
          defaults: {
            title: "Curated Partners",
            partners: ["Four Seasons Nam Hai", "InterContinental Da Nang", "Amanoi", "Six Senses"],
          },
          preview: (
            <div className="grid h-full w-full grid-cols-3 items-center gap-2 p-3 text-center font-serif text-[7px] text-[#77736c]">
              <div className="border border-[#e0dad0] p-1">RESORT 1</div>
              <div className="border border-[#e0dad0] p-1">RESORT 2</div>
              <div className="border border-[#e0dad0] p-1">RESORT 3</div>
            </div>
          ),
        },
      ],
    },
    {
      id: "faq",
      label: "FAQ",
      items: [
        {
          variant: "faq-accordion",
          label: "FAQ · Clean Accordion",
          defaults: {
            title: "Frequently Asked Questions",
            items: [
              { q: "How far in advance should we book?", a: "We typically book 6 to 12 months in advance to ensure our presence for your wedding date." },
              { q: "Do you travel for destination weddings?", a: "Yes, we photograph celebrations across Vietnam, throughout Southeast Asia, and worldwide." },
              { q: "When will our photographs and films be delivered?", a: "A sneak peek is delivered within 7 days. Your complete heirloom gallery is finished within 6 to 8 weeks." },
            ],
          },
          preview: (
            <div className="flex h-full w-full flex-col justify-center space-y-1.5 p-3 text-left">
              <div className="flex items-center justify-between border-b border-[#ddd8cf] pb-1 text-[6px]">
                <span>How do we book a session?</span>
                <span>+</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#ddd8cf] pb-1 text-[6px]">
                <span>Do you travel worldwide?</span>
                <span>+</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#ddd8cf] pb-1 text-[6px]">
                <span>When will photos be delivered?</span>
                <span>+</span>
              </div>
            </div>
          ),
        },
        {
          variant: "faq-2col",
          label: "FAQ · 2-Column Grid",
          defaults: {
            title: "Questions & Details",
            items: [
              { q: "What is your photography style?", a: "Editorial, heartfelt, and timelessly filmic." },
              { q: "Can we meet before booking?", a: "Absolutely, we always recommend a video call to connect." },
            ],
          },
          preview: (
            <div className="grid h-full w-full grid-cols-2 gap-2 p-3 text-left">
              <div className="space-y-1">
                <span className="block text-[6px] font-medium">Style</span>
                <span className="block text-[5px] text-[#77736c]">Editorial & documentary.</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[6px] font-medium">Booking</span>
                <span className="block text-[5px] text-[#77736c]">6-12 months ahead.</span>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "flex-block",
      label: "Flex Block",
      items: [
        {
          variant: "flex-blank",
          label: "Blank Block",
          defaults: {
            title: "Custom Section",
            body: "Design your freeform content here.",
          },
          preview: (
            <div className="flex h-full w-full items-center justify-center font-serif text-sm italic text-[#8a857d]">
              Blank Block
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
                    category: "flex",
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
