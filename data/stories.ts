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

    // Basic information
    title: string;
    location: string;
    date: string;
    category: string;

    // SEO
    seoTitle: string;
    seoDescription: string;

    // Content
    description: string;
    coverImage: string;

    // Destination relation
    destination: DestinationSlug;

    // Optional wedding film
    film?: {
        youtubeId: string;
        poster?: string;
    };

    // Story content
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
            "Haley & David — Intimate Wedding in Da Nang",

        seoDescription:
            "An intimate destination wedding for Haley & David in Da Nang, Vietnam, photographed and filmed by The Scene Studio.",

        description:
            "An intimate destination wedding by the coast of Da Nang, Vietnam.",

        coverImage:
            "/images/stories/haley-david.jpg",

        destination: "da-nang",

        film: {
            youtubeId: "XST30jLkZbM",
        },

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
                    "/images/stories/haley-david.jpg",

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
                            "/images/stories/haley-david-01.jpg",

                        alt:
                            "Haley and David during their wedding in Da Nang",
                    },

                    {
                        src:
                            "/images/stories/haley-david-02.jpg",

                        alt:
                            "Intimate wedding moment in Da Nang, Vietnam",
                    },

                    {
                        src:
                            "/images/stories/haley-david-03.jpg",

                        alt:
                            "Wedding celebration in Da Nang, Vietnam",
                    },

                    {
                        src:
                            "/images/stories/haley-david-04.jpg",

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