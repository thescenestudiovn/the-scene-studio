"use client";

import { useEffect, useState } from "react";
import { stories } from "../../data/stories";



function locationSlug(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

type FooterPage = { slug: string; title: string; homepage?: number; menu_visibility?: string; page_status?: string };

type FooterSettings = {
    phone: string;
    email: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    address: string;
    logo: string;
    logo_white: string;
    footer_text: string;
};

const EMPTY: FooterSettings = {
    phone: "",
    email: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    address: "",
    logo: "",
    logo_white: "",
    footer_text: "",
};

export default function Footer() {
    const [settings, setSettings] = useState<FooterSettings>(EMPTY);
    const [pages, setPages] = useState<FooterPage[]>([]);
    const locations = Array.from(new Map(stories.map((story) => [locationSlug(story.location), story.location])).entries());

    useEffect(() => {
        fetch("/api/admin/pages", { cache: "no-store" })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                const loadedPages = data as { pages?: FooterPage[] } | null;
                if (loadedPages?.pages) {
                    setPages(loadedPages.pages.filter((page) => page.menu_visibility === "visible" && page.page_status !== "offline"));
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        fetch("/api/admin/site-settings", { cache: "no-store" })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                const typedData = data as { settings?: Partial<FooterSettings> } | null;
                if (typedData?.settings) {
                    setSettings((current) => ({ ...current, ...typedData.settings }));
                }
            })
            .catch(() => {});
    }, []);

    const phone = settings.phone;
    const email = settings.email;

    return (
        <footer className="bg-[#e9e4da] px-6 py-16 text-[#171717] md:px-10 md:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-16 md:grid-cols-12">
                    <div className="md:col-span-6">
                        {settings.logo || settings.logo_white ? <img src={settings.logo_white || settings.logo} alt="The Scene Studio" className="max-h-10 max-w-[220px] object-contain object-left" /> : <p className="font-sans text-xs tracking-[0.2em] uppercase">The Scene Studio</p>}
                        <p className="mt-8 max-w-md font-serif text-4xl leading-[0.95] tracking-[-0.03em] md:text-6xl">{settings.footer_text || "Stories worth remembering."}</p>
                        <p className="mt-8 font-sans text-xs tracking-[0.15em] uppercase text-[#77736b]">{settings.address || "Da Nang · Vietnam"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-10 md:col-span-6 md:col-start-7 lg:grid-cols-3">
                        <div><p className="font-sans text-xs tracking-[0.15em] uppercase text-[#625e57]">Explore</p><nav className="mt-6 flex flex-col gap-4 font-sans text-sm">{pages.map((page) => (
                            <a key={page.slug} href={Number(page.homepage) === 1 ? "/" : `/${page.slug}`}>{page.title}</a>
                        ))}</nav></div>
                        <div><p className="font-sans text-xs tracking-[0.15em] uppercase text-[#625e57]">Locations</p><nav className="mt-6 flex flex-col gap-4 font-sans text-sm">{locations.map(([slug, name]) => (
                            <a key={slug} href={`/stories?location=${encodeURIComponent(slug)}`}>{name}</a>
                        ))}</nav></div>
                        <div><p className="font-sans text-xs tracking-[0.15em] uppercase text-[#625e57]">Connect</p><nav className="mt-6 flex flex-col gap-4 font-sans text-sm">
                            <a href="https://www.instagram.com/thescenestudiovn/" target="_blank" rel="noreferrer">Instagram</a>
                            <a href="https://www.facebook.com/profile.php?id=61593566064412" target="_blank" rel="noreferrer">Facebook</a>
                            <a href="https://wa.me/84905942274" target="_blank" rel="noreferrer">WhatsApp</a>
                            {phone && <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>}
                            {email && <a href={`mailto:${email}`}>{email}</a>}
                        </nav></div>
                    </div>
                </div>
                <div className="mt-20 flex flex-col justify-between gap-4 border-t border-black/10 pt-6 font-sans text-[10px] tracking-[0.15em] uppercase text-[#625e57] md:flex-row"><p>© {new Date().getFullYear()} The Scene Studio</p><p>{settings.address || "Da Nang · Vietnam"}</p></div>
            </div>
        </footer>
    );
}
