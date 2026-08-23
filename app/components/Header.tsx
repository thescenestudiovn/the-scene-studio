"use client";

import { useEffect, useState } from "react";

export default function Header({ light = false }: { light?: boolean }) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            <header className={`fixed left-0 top-0 z-50 w-full px-6 py-5 transition-all duration-500 md:px-10 md:py-6 ${light || scrolled || menuOpen ? "bg-[#f7f5f0]/95 text-[#171717] backdrop-blur-md" : "bg-transparent text-white"}`}>
                <nav className="flex items-center justify-between">
                    <a href="/" onClick={closeMenu} className="font-sans text-xs tracking-[0.2em] uppercase">The Scene Studio</a>
                    <div className="hidden items-center gap-8 font-sans text-xs tracking-[0.15em] uppercase md:flex">
                        <a href="/stories" className="transition-opacity hover:opacity-50">Stories</a>
                        <a href="/gallery" className="transition-opacity hover:opacity-50">Gallery</a>
                        <a href="/films" className="transition-opacity hover:opacity-50">Films</a>
                        <a href="/destinations" className="transition-opacity hover:opacity-50">Destinations</a>
                        <a href="/about" className="transition-opacity hover:opacity-50">About</a>
                        <a href="/contact" className="transition-opacity hover:opacity-50">Contact</a>
                    </div>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="font-sans text-xs tracking-[0.2em] uppercase md:hidden">{menuOpen ? "Close" : "Menu"}</button>
                </nav>
            </header>

            <div className={`fixed right-0 top-[58px] z-40 w-[260px] rounded-b-sm bg-[#f7f5f0] p-8 text-[#171717] shadow-xl transition-all duration-300 md:hidden ${menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
                <nav className="flex flex-col gap-6">
                    <a href="/stories" onClick={closeMenu} className="font-serif text-3xl tracking-[-0.03em]">Stories</a>
                    <a href="/gallery" onClick={closeMenu} className="font-serif text-3xl tracking-[-0.03em]">Gallery</a>
                    <a href="/films" onClick={closeMenu} className="font-serif text-3xl tracking-[-0.03em]">Films</a>
                    <a href="/destinations" onClick={closeMenu} className="font-serif text-3xl tracking-[-0.03em]">Destinations</a>
                    <a href="/about" onClick={closeMenu} className="font-serif text-3xl tracking-[-0.03em]">About</a>
                    <a href="/contact" onClick={closeMenu} className="font-serif text-3xl tracking-[-0.03em]">Contact</a>
                </nav>
            </div>
        </>
    );
}