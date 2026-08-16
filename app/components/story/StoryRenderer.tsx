import type { StorySection } from "../../../data/stories";

import StoryText from "./StoryText";
import StoryImage from "./StoryImage";
import StoryFilm from "./StoryFilm";
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

                    case "film":
                        return (
                            <StoryFilm
                                key={index}
                                videoUrl={section.videoUrl}
                                poster={section.poster}
                            />
                        );

                    default:
                        return null;
                }
            })}
        </>
    );
}