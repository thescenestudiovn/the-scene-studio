"use client";

import Link from "next/link";

export default function AdminSiteMenu({ activeSlug }: { activeSlug: string }) {
    const pages = [
        { slug: "home", label: "Home", icon: "⌂", href: "/admin/pages/home" },
        { slug: "about", label: "About", icon: "▯", href: "/admin/pages/about" },
        { slug: "contact", label: "Contact", icon: "✉", href: "/admin/pages/contact" },
        { slug: "gallery", label: "Gallery", icon: "▧", href: "/admin/gallery" },
        { slug: "stories", label: "Stories (Blog)", icon: "▤", href: "/admin/stories" },
    ];

    return <aside className="flex w-full shrink-0 flex-col border-b border-[#d8d3ca] bg-[#fbfaf7] lg:sticky lg:top-16 lg:h-[calc(100dvh-64px)] lg:w-[272px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="border-b border-[#e5e0d8] px-5 py-5"><p className="text-[9px] uppercase tracking-[0.18em] text-[#8a857d]">Website</p><h2 className="mt-1 font-serif text-2xl">Pages</h2></div>
        <nav aria-label="Site pages" className="border-b border-[#e5e0d8] px-3 py-4">
            <p className="px-2 pb-2 text-[9px] uppercase tracking-[0.16em] text-[#aaa49a]">Site menu</p>
            {pages.map(item => <Link key={item.slug} href={item.href} aria-current={activeSlug === item.slug ? "page" : undefined} className={`flex items-center gap-3 px-3 py-2.5 text-xs transition-colors ${activeSlug === item.slug ? "bg-[#eeece6] text-[#171717]" : "text-[#6f6a61] hover:bg-[#f2f0eb]"}`}><span className="w-4 text-center text-[#8a857d]">{item.icon}</span>{item.label}</Link>)}
            <span title="Testimonials management is not configured yet" aria-disabled="true" className="flex items-center gap-3 px-3 py-2.5 text-xs text-[#aaa49a]"><span className="w-4 text-center">☆</span>Testimonials</span>
        </nav>
        <nav aria-label="System settings" className="px-3 py-4">
            <p className="px-2 pb-2 text-[9px] uppercase tracking-[0.16em] text-[#aaa49a]">System</p>
            <Link href="/admin/settings" aria-current={activeSlug === "settings" ? "page" : undefined} className={`flex items-center gap-3 px-3 py-2.5 text-xs transition-colors ${activeSlug === "settings" ? "bg-[#eeece6] text-[#171717]" : "text-[#6f6a61] hover:bg-[#f2f0eb]"}`}>
                <span className="w-4 text-center text-[#8a857d]">⚙</span>Settings
            </Link>
        </nav>
    </aside>;
}
