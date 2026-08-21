import type { DestinationSlug } from "./destinations";

export type StorySection =
    | {
        type: "text";
        eyebrow?: string;
        title: string;
        body: string;
    }
    | {
        type: "image";
        image: string;
        alt: string;
        size?: "normal" | "large" | "full";
    }
    | {
        type: "gallery";
        title?: string;
        images: {
            src: string;
            alt: string;
        }[];
        layout?: "grid" | "feature" | "portrait-pair";
    }
    | {
        type: "quote";
        text: string;
    }
    | {
        type: "credits";
        items: {
            label: string;
            value: string;
        }[];
    };

export type Story = {
    slug: string;

    title: string;
    location: string;
    date: string;
    category: string;

    seoTitle: string;
    seoDescription: string;

    description: string;
    coverImage: string;

    destination: DestinationSlug;

    sections: StorySection[];
};

export const stories: Story[] = [
    {
        slug: "haley-david",

        title: "Haley & David",

        location: "Da Nang · Vietnam",

        date: "April 2027",

        category: "Intimate Wedding",

        seoTitle:
            "Haley & David — Intimate Wedding Photography in Da Nang | The Scene Studio",

        seoDescription:
            "An intimate destination wedding for Haley & David in Da Nang, Vietnam, photographed and filmed by The Scene Studio.",

        description:
            "An intimate destination wedding by the coast of Da Nang, Vietnam.",

        coverImage:
            "Haley-David/002-NT-HL-01178.jpg",

        destination: "da-nang",

        sections: [
            {
                type: "text",

                eyebrow: "The Story",

                title:
                    "A quiet celebration by the coast.",

                body:
                    "Haley and David gathered their closest people in Da Nang for an intimate celebration filled with warm light, quiet moments, and effortless joy.",
            },

            {
                type: "image",

                image:
                    "Haley-David/002-NT-HL-01178.jpg",

                alt:
                    "Haley & David intimate wedding in Da Nang, Vietnam",

                size: "large",
            },

            {
                type: "gallery",

                layout: "grid",

                images: [
                    {
                        src:
                            "Haley-David/002-NT-HL-01178.jpg",

                        alt:
                            "Haley and David during their wedding in Da Nang",
                    },

                    {
                        src:
                            "Haley-David/0aae205c-3b87-47f3-b9a5-f53b3194b0c3.jpeg",

                        alt:
                            "Intimate wedding moment in Da Nang, Vietnam",
                    },

                    {
                        src:
                            "Haley-David/Gemini_Generated_Image_ube5c6ube5c6ube5.png",

                        alt:
                            "Wedding celebration in Da Nang, Vietnam",
                    },

                    {
                        src:
                            "Haley-David/SIN09828.jpg",

                        alt:
                            "Haley and David wedding portrait in Da Nang",
                    },
                ],
            },

            {
                type: "quote",

                text:
                    "For the moments we never planned, and the memories we will always keep.",
            },
        ],
    },
];
