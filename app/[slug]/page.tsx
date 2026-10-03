import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageRenderer, { getPage } from "../components/PageRenderer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPage(slug);
    if (!page) return {};
    return {
        title: page.seo_title || page.title || "The Scene Studio",
        description: page.seo_description || undefined,
    };
}

export default async function DynamicPage({ params }: Props) {
    const { slug } = await params;
    const page = await getPage(slug);

    if (!page) notFound();

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Header light />
            <PageRenderer blocks={page.blocks} />
            <Footer />
        </main>
    );
}
