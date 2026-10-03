import type { Metadata } from "next";
import Footer from "../components/Footer";
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
            <PageRenderer blocks={page?.blocks ?? []} />
            <Footer />
        </main>
    );
}
