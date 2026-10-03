"use client";

import Link from "next/link";
import { useAdminEditor } from "./AdminEditorContext";
import { BlockEditor } from "../../../components/story/editor/StoryContent";

function labelForBlock(block: { type: string; variant?: string | null; data?: Record<string, unknown> }) {
    const variant = typeof block.variant === "string" && block.variant ? block.variant : typeof block.data?.variant === "string" ? block.data.variant : "";
    const labels: Record<string, string> = {
        "banner-1": "Banner 1", "banner-2": "Banner 2", "banner-3": "Banner 3", "banner-video": "YouTube Video",
        "info-1": "Info 1", "info-2": "Info 2", "info-3": "Info 3",
        "testimonial-1": "Testimonial 1", "testimonial-2": "Testimonial 2", "testimonial-3": "Testimonial 3",
        "pricing-1": "Pricing 1", "pricing-2": "Pricing 2", "pricing-3": "Pricing 3",
        "faq-1": "FAQ 1", "faq-2": "FAQ 2", "faq-3": "FAQ 3",
        "quote-1": "Quote 1", "quote-2": "Quote 2", "quote-3": "Quote 3",
        "heading-1": "Heading 1", "heading-2": "Heading 2", "heading-3": "Heading 3",
    };
    return labels[variant] ?? (variant ? variant.replace(/-/g, " ") : block.type);
}

export default function AdminSiteMenu({ activeSlug }: { activeSlug: string }) {
    const { editor } = useAdminEditor();
    const pages = [
        { slug: "home", label: "Home", icon: "⌂", href: "/admin/pages/home" },
        { slug: "about", label: "About", icon: "▯", href: "/admin/pages/about" },
        { slug: "contact", label: "Contact", icon: "✉", href: "/admin/pages/contact" },
        { slug: "gallery", label: "Gallery", icon: "▧", href: "/admin/gallery" },
        { slug: "stories", label: "Stories (Blog)", icon: "▤", href: "/admin/stories" },
    ];

    if (editor) {
        return <aside className="relative z-40 flex w-full shrink-0 flex-col border-b border-[#d8d3ca] bg-[#fbfaf7] lg:sticky lg:top-16 lg:h-[calc(100dvh-64px)] lg:w-[340px] lg:overflow-hidden lg:border-b-0 lg:border-r">
            <div className="shrink-0 border-b border-[#e5e0d8] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={editor.onClose} className="text-[9px] uppercase tracking-[0.16em] text-[#77736c] hover:text-[#171717]">← Pages</button>
                </div>
                <p className="mt-5 text-[9px] uppercase tracking-[0.18em] text-[#aaa49a]">Edit block</p>
                <h2 className="mt-1 font-serif text-2xl leading-tight">{labelForBlock(editor.block)}</h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                {(() => {
                    const variant = typeof editor.block.variant === "string" ? editor.block.variant : typeof editor.block.data?.variant === "string" ? editor.block.data.variant : "";
                    const bannerVariants = [
                        ["banner-1", "Banner 1"],
                        ["banner-2", "Banner 2"],
                        ["banner-3", "Banner 3"],
                    ] as const;
                    const isBanner = editor.block.type === "content" && bannerVariants.some(([id]) => id === variant);
                    return <div className="grid gap-4">
                        {isBanner && <section className="border border-[#d8d3ca] bg-white p-3">
                            <p className="mb-3 text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">Banner style</p>
                            <div className="grid grid-cols-2 gap-2">
                                {bannerVariants.map(([id, label]) => <button key={id} type="button" onClick={() => editor.onUpdate(editor.block, { variant: id })} className={`min-h-10 border px-2 py-2 text-left text-[9px] uppercase tracking-[0.1em] transition ${variant === id ? "border-[#171717] bg-[#171717] text-white" : "border-[#d8d3ca] bg-[#fbfaf7] text-[#625e57] hover:border-[#99938b] hover:bg-white"}`}>{label}</button>)}
                            </div>
                        </section>}
                        <div className="overflow-hidden border border-[#d8d3ca] bg-white">
                            <BlockEditor
                                storyId={editor.storyId}
                                block={editor.block}
                                blocks={editor.blocks}
                                onBlocksChange={editor.onBlocksChange}
                                onUpdate={editor.onUpdate}
                            />
                        </div>
                    </div>;
                })()}
            </div>
        </aside>;
    }

    return <aside className="relative z-40 flex w-full shrink-0 flex-col border-b border-[#d8d3ca] bg-[#fbfaf7] lg:sticky lg:top-16 lg:h-[calc(100dvh-64px)] lg:w-[272px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
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
