"use client";

import { useEffect, useState } from "react";

type Settings = { logo:string; logo_white:string };

export default function Header({ light = false }: { light?: boolean }) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>({ logo:"", logo_white:"" });
    const [pages, setPages] = useState<Array<{ slug:string; title:string; menu_visibility?:string; page_status?:string; homepage?:number }>>([]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        fetch("/api/admin/site-settings", { cache:"no-store" })
            .then(r => r.ok ? r.json() : null)
            .then(d => { const data = d as { settings?: Partial<Settings> }; if (data.settings) setSettings({ logo:data.settings.logo || "", logo_white:data.settings.logo_white || "" }); })
            .catch(() => {});
        fetch("/api/admin/pages", { cache:"no-store" })
            .then(r => r.ok ? r.json() : null)
            .then(d => { const data = d as { pages?: Array<{ slug:string; title:string; menu_visibility?:string; page_status?:string; homepage?:number }> }; if (data.pages) setPages(data.pages.filter(page => page.menu_visibility === "visible" && page.page_status !== "offline")); })
            .catch(() => {});
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const closeMenu = () => setMenuOpen(false);
    const darkHeader = light || scrolled || menuOpen;
    const logo = darkHeader ? settings.logo : (settings.logo_white || settings.logo);

    return (
        <>
            <header className={`fixed left-0 top-0 z-50 w-full px-6 py-5 transition-all duration-500 md:px-10 md:py-6 ${darkHeader ? "bg-[#f7f5f0]/95 text-[#171717] backdrop-blur-md" : "bg-transparent text-white"}`}>
                <nav className="flex items-center justify-between">
                    <a href="/" onClick={closeMenu} className="flex items-center">
                        {logo ? <img src={logo} alt="The Scene Studio" className="h-auto max-h-10 w-auto max-w-[180px] object-contain" /> : <span className="font-sans text-xs tracking-[0.2em] uppercase">The Scene Studio</span>}
                    </a>
                    <div className="hidden items-center gap-8 font-sans text-xs tracking-[0.15em] uppercase md:flex">
                        <a href="/" className="transition-opacity hover:opacity-50">Home</a><a href="/about" className="transition-opacity hover:opacity-50">About</a><a href="/stories" className="transition-opacity hover:opacity-50">Stories</a><a href="/gallery" className="transition-opacity hover:opacity-50">Gallery</a><a href="/films" className="transition-opacity hover:opacity-50">Film</a><a href="/contact" className="transition-opacity hover:opacity-50">Contact</a>
                    </div>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="font-sans text-xs tracking-[0.2em] uppercase md:hidden">{menuOpen ? "Close" : "Menu"}</button>
                </nav>
            </header>
            <div className={`fixed right-0 top-[58px] z-40 w-[260px] rounded-b-sm bg-[#f7f5f0] p-8 text-[#171717] shadow-xl transition-all duration-300 md:hidden ${menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
                <nav className="flex flex-col gap-6">{pages.map(page => <a key={page.slug} href={Number(page.homepage) === 1 ? "/" : "/" + page.slug} onClick={closeMenu} className="font-serif text-3xl tracking-[-0.03em]">{page.title}</a>)}</nav>
            </div>
        </>
    );
}