import type { Metadata } from "next";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PageRenderer, { getPage } from "../components/PageRenderer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const page = await getPage("contact");
    return {
        title: page?.seo_title || page?.title || "Contact — The Scene Studio",
        description:
            page?.seo_description ||
            "Contact The Scene Studio for destination wedding photography and films in Vietnam and beyond.",
    };
}

export default async function ContactPage() {
    const page = await getPage("contact");

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Header light />
            <div className="pt-[80px] md:pt-[88px]">
                <PageRenderer blocks={page?.blocks ?? []} />
            </div>
            <Footer />
        </main>
    );
}
