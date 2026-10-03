"use client";

import { useEffect, useState } from "react";

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

    const instagram = settings.instagram;
    const facebook = settings.facebook;
    const tiktok = settings.tiktok;
    const email = settings.email || "thescenestudiovn@gmail.com";
    const phone = settings.phone;
    const whatsapp = settings.whatsapp;

    return (
        <footer className="bg-[#f7f5f0] px-6 py-16 text-[#171717] md:px-10 md:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-16 md:grid-cols-12">
                    <div className="md:col-span-6">
                        {settings.logo || settings.logo_white ? <img src={settings.logo_white || settings.logo} alt="The Scene Studio" className="max-h-10 max-w-[220px] object-contain object-left" /> : <p className="font-sans text-xs tracking-[0.2em] uppercase">The Scene Studio</p>}
                        <p className="mt-8 max-w-md font-serif text-4xl leading-[0.95] tracking-[-0.03em] md:text-6xl">{settings.footer_text || "Stories worth remembering."}</p>
                        <p className="mt-8 font-sans text-xs tracking-[0.15em] uppercase text-[#77736b]">{settings.address || "Da Nang · Vietnam"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-10 md:col-span-4 md:col-start-9">
                        <div><p className="font-sans text-xs tracking-[0.15em] uppercase text-[#9d9a93]">Explore</p><nav className="mt-6 flex flex-col gap-4 font-sans text-sm"><a href="/stories">Stories</a><a href="/films">Films</a><a href="/destinations">Destinations</a><a href="/about">About</a><a href="/contact">Contact</a></nav></div>
                        <div><p className="font-sans text-xs tracking-[0.15em] uppercase text-[#9d9a93]">Connect</p><nav className="mt-6 flex flex-col gap-4 font-sans text-sm">
                            {instagram && <a href={instagram} target="_blank" rel="noreferrer">Instagram</a>}
                            {facebook && <a href={facebook} target="_blank" rel="noreferrer">Facebook</a>}
                            {tiktok && <a href={tiktok} target="_blank" rel="noreferrer">TikTok</a>}
                            {whatsapp && <a href={whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>}
                            {phone && <a href={`tel:${phone.replace(/\s+/g, "")}`}>Phone</a>}
                            <a href={`mailto:${email}`}>Email</a>
                        </nav></div>
                    </div>
                </div>
                <div className="mt-20 flex flex-col justify-between gap-4 border-t border-black/10 pt-6 font-sans text-[10px] tracking-[0.15em] uppercase text-[#9d9a93] md:flex-row"><p>© {new Date().getFullYear()} The Scene Studio</p><p>{settings.address || "Da Nang · Vietnam"}</p></div>
            </div>
        </footer>
    );
}
