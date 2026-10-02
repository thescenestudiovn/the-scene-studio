import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageRenderer, { getPage } from "../components/PageRenderer";
import ContactForm from "./ContactForm";

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

function DefaultIntro() {
    return (
        <section className="px-6 pb-24 pt-40 md:px-10 md:pb-32 md:pt-52">
            <div className="mx-auto max-w-7xl">
                <p className="font-sans text-xs tracking-[0.2em] uppercase">
                    Inquire
                </p>
                <h1 className="mt-10 max-w-5xl font-serif text-6xl leading-[0.9] tracking-[-0.04em] md:text-8xl lg:text-9xl">
                    Let&apos;s make
                    <br />
                    something
                    <br />
                    meaningful.
                </h1>
                <p className="mt-10 max-w-xl font-sans text-sm leading-7 text-[#77736c]">
                    Tell us a little about yourselves, your plans, and the kind
                    of story you want to remember.
                </p>
            </div>
        </section>
    );
}

export default async function ContactPage() {
    const page = await getPage("contact");
    const blocks = page?.blocks.filter(block => block.type !== "cover") ?? [];
    const hasContactFormBlock = blocks.some(block => block.type === "contact");

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Header light />
            {blocks.length ? (
                <div className="scene-contact-page__blocks">
                    <PageRenderer blocks={blocks} />
                </div>
            ) : (
                <DefaultIntro />
            )}
            {!hasContactFormBlock && <ContactForm />}
            <Footer />
        </main>
    );
}
