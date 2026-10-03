import type { Metadata } from "next";
import Footer from "../components/Footer";
import BlockPreview from "../../components/story/editor/BlockPreview";
import { getPage } from "../components/PageRenderer";
import type { StoryBlock } from "../../components/story/editor/types";

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
    const blocks = (page?.blocks ?? [])
        .filter(block => block.type !== "cover")
        .map(block => ({
            ...block,
            variant: typeof block.data === "object" && block.data && typeof block.data.variant === "string"
                ? block.data.variant
                : block.type,
        })) as StoryBlock[];

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <div className="w-full">
                {blocks.map(block => (
                    <BlockPreview key={block.id} block={block} />
                ))}
            </div>
            <Footer />
        </main>
    );
}
