import type { StorySection } from "../../../data/stories";

import StoryText from "./StoryText";
import StoryImage from "./StoryImage";
import StoryQuote from "./StoryQuote";
import StoryGallery from "./StoryGallery";

type StoryRendererProps = {
    sections: StorySection[];
};

export default function StoryRenderer({
    sections,
}: StoryRendererProps) {
    return (
        <>
            {sections.map((section, index) => {
                switch (section.type) {
                    case "text":
                        return (
                            <StoryText
                                key={index}
                                eyebrow={section.eyebrow}
                                title={section.title}
                                body={section.body}
                            />
                        );

                    case "image":
                        return (
                            <StoryImage
                                key={index}
                                image={section.image}
                                alt={section.alt}
                                size={section.size}
                            />
                        );

                    case "gallery":
                        return (
                            <StoryGallery
                                key={index}
                                title={section.title}
                                images={section.images}
                                layout={section.layout}
                            />
                        );

                    case "quote":
                        return (
                            <StoryQuote
                                key={index}
                                text={section.text}
                            />
                        );

                    case "credits":
                        return (
                            <section
                                key={index}
                                className="border-t border-[#d8d3ca] px-6 py-20 md:px-10 md:py-28"
                            >
                                <div className="mx-auto max-w-5xl">
                                    <p className="mb-8 font-sans text-xs tracking-[0.2em] uppercase text-[#77736c]">
                                        Credits
                                    </p>
                                    <div className="divide-y divide-[#d8d3ca]">
                                        {section.items.map((item, itemIndex) => (
                                            <div
                                                key={`${item.label}-${itemIndex}`}
                                                className="grid gap-2 py-4 md:grid-cols-[180px_1fr]"
                                            >
                                                <span className="font-sans text-xs tracking-[0.12em] uppercase text-[#77736c]">
                                                    {item.label}
                                                </span>
                                                <span className="font-sans text-sm text-[#171717]">
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );

                    default:
                        return null;
                }
            })}
        </>
    );
}
