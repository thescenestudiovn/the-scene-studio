import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageRenderer, { getPage } from "../components/PageRenderer";

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPage(slug);
    if (!page) return {};
    return {
        title: page.seo_title || `${page.title} — The Scene Studio`,
        description: page.seo_description || "The Scene Studio — Destination Wedding Photography and Cinematography in Vietnam and worldwide.",
    };
}

export default async function DynamicCustomPage({ params }: PageProps) {
    const { slug } = await params;
    const page = await getPage(slug);
    if (!page) notFound();

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Header light />
            {page.blocks.length ? (
                <PageRenderer blocks={page.blocks} />
            ) : (
                <section className="px-6 py-40 md:px-10 md:py-52">
                    <div className="mx-auto max-w-6xl">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#8a857d]">{page.title}</p>
                        <h1 className="mt-8 font-serif text-5xl leading-[1] tracking-[-0.03em] md:text-7xl">
                            {page.title}
                        </h1>
                        <p className="mt-6 max-w-lg text-sm leading-7 text-[#77736c]">
                            This page has been created in the CMS. Use the Page Builder in the admin dashboard to add content blocks.
                        </p>
                    </div>
                </section>
            )}
            <Footer />
        </main>
    );
}
