import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageRenderer, { getPage } from "./components/PageRenderer";
import StructuredData from "./components/StructuredData";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return { title: page?.seo_title || "The Scene Studio — Destination Wedding Photography", description: page?.seo_description || "Destination wedding photography and films in Vietnam and worldwide." };
}

export default async function Home() {
  const page = await getPage("home");
  return <main className="min-h-screen bg-[#f7f5f0] text-[#171717]"><StructuredData/><Header/>{page?.blocks.length ? <PageRenderer blocks={page.blocks} /> : <section className="relative flex min-h-screen items-end overflow-hidden px-6 pb-10 md:px-10 md:pb-14"><div className="absolute inset-0 bg-[#ddd8cf]" /><div className="relative z-10 w-full"><p className="text-xs uppercase tracking-[0.2em]">Vietnam · Worldwide</p><h1 className="mt-5 font-serif text-[clamp(4rem,11vw,10rem)] leading-[0.8] tracking-[-0.04em]">The Scene Studio</h1><p className="mt-6 max-w-md text-sm leading-6">Destination wedding photography & films in Vietnam and worldwide.</p></div></section>}<Footer/></main>;
}
