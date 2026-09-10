import Link from "next/link";

const groups = [
  {
    label: "Content",
    description: "Everything that becomes a page on the public website.",
    items: [
      { number: "01", title: "Stories", description: "Wedding stories, journal entries and visual narratives.", href: "/admin/stories" },
      { number: "02", title: "Pages", description: "Home, About, Services, Destinations and other site pages.", href: "/admin/pages" },
    ],
  },
  {
    label: "Library",
    description: "The assets and taxonomy shared by your content.",
    items: [
      { number: "03", title: "Media", description: "Upload, organise and reuse photographs across the site.", href: "/admin/gallery" },
      { number: "04", title: "Destinations", description: "Places used by Stories, Pages and SEO content.", href: "/admin/destinations" },
    ],
  },
  {
    label: "System",
    description: "Global information used throughout the website.",
    items: [
      { number: "05", title: "Site Settings", description: "Contact details, social links and global website settings.", href: "/admin/settings" },
    ],
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-8 text-[#171717] md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[#d8d3ca] pb-10">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#77736c]">The Scene Studio / CMS</p>
          <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="font-serif text-5xl leading-none tracking-[-0.03em] md:text-7xl">Admin</h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#77736c]">
                One place to manage the content that powers The Scene Studio website.
              </p>
            </div>
            <Link href="/" target="_blank" className="inline-flex w-fit border border-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.18em]">
              View website ↗
            </Link>
          </div>
        </header>

        <div className="mt-12 space-y-14">
          {groups.map((group) => (
            <section key={group.label}>
              <div className="mb-5 flex flex-col gap-2 border-b border-[#d8d3ca] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">{group.label}</p>
                  <p className="mt-1 text-sm text-[#8a857d]">{group.description}</p>
                </div>
              </div>
              <div className="grid gap-px border border-[#d8d3ca] bg-[#d8d3ca] sm:grid-cols-2">
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} className="group bg-white p-6 transition-colors hover:bg-[#fbfaf7] md:p-8">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#99958e]">{item.number}</span>
                      <span className="text-[#99958e] transition-transform group-hover:translate-x-1">↗</span>
                    </div>
                    <h2 className="mt-12 font-serif text-3xl tracking-[-0.02em]">{item.title}</h2>
                    <p className="mt-3 max-w-md text-sm leading-6 text-[#77736c]">{item.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-14 border-t border-[#d8d3ca] pt-5 text-[9px] uppercase tracking-[0.16em] text-[#99958e]">
          The Scene Studio · Content Management
        </footer>
      </div>
    </main>
  );
}
