"use client";

import { useEffect, useState } from "react";

const leftNav = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Portfolio", href: "/gallery" },
];

const rightNav = [
    { label: "Blog", href: "/stories" },
    { label: "Film", href: "/films" },
    { label: "Contact", href: "/contact" },
];

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
    const mobileNav = [...leftNav, ...rightNav];

    return (
        <>
            <header
                className={`fixed left-0 top-0 z-50 w-full px-6 py-5 transition-all duration-500 md:px-10 md:py-6 ${light || scrolled || menuOpen ? "bg-[#f7f5f0]/95 text-[#171717] backdrop-blur-md" : "bg-transparent text-white"}`}
            >
                <nav className="grid grid-cols-[1fr_auto_1fr] items-center">
                    <div className="hidden items-center justify-start gap-8 font-sans text-xs uppercase tracking-[0.15em] md:flex">
                        {leftNav.map((item) => (
                            <a key={item.href} href={item.href} className="transition-opacity hover:opacity-50">
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <a
                        href="/"
                        onClick={closeMenu}
                        className="justify-self-start font-sans text-xs uppercase tracking-[0.2em] md:justify-self-center"
                    >
                        The Scene Studio
                    </a>

                    <div className="hidden items-center justify-end gap-8 font-sans text-xs uppercase tracking-[0.15em] md:flex">
                        {rightNav.map((item) => (
                            <a key={item.href} href={item.href} className="transition-opacity hover:opacity-50">
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="col-start-3 justify-self-end font-sans text-xs uppercase tracking-[0.2em] md:hidden"
                    >
                        {menuOpen ? "Close" : "Menu"}
                    </button>
                </nav>
            </header>

            <div
                className={`fixed right-0 top-[58px] z-40 w-[260px] rounded-b-sm bg-[#f7f5f0] p-8 text-[#171717] shadow-xl transition-all duration-300 md:hidden ${menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}
            >
                <nav className="flex flex-col gap-6">
                    {mobileNav.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={closeMenu}
                            className="font-serif text-3xl tracking-[-0.03em]"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
            </div>
        </>
    );
}
