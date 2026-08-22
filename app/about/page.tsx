import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageRenderer, { getPage } from "../components/PageRenderer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return { title: page?.seo_title || page?.title || "About — The Scene Studio", description: page?.seo_description || "The Scene Studio is a Vietnam-based destination wedding photography and film studio." };
}

export default async function AboutPage() {
  const page = await getPage("about");
  return <main className="min-h-screen bg-[#f7f5f0] text-[#171717]"><Header light />{page?.blocks.length ? <PageRenderer blocks={page.blocks} /> : <section className="px-6 py-40 md:px-10 md:py-52"><div className="mx-auto max-w-6xl"><p className="text-xs uppercase tracking-[0.2em]">About The Scene</p><h1 className="mt-8 font-serif text-6xl leading-[0.9] tracking-[-0.04em] md:text-8xl">We create photographs and films for people who care about how their story feels.</h1></div></section>}<Footer /></main>;
}
