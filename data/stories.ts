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
        type: "film";
        videoUrl: string;
        poster?: string;
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
    description: string;
    coverImage: string;
    destination: string;
    sections: StorySection[];
};

export const stories: Story[] = [
    {
        slug: "haley-david",
        title: "Haley & David",
        location: "Da Nang · Vietnam",
        date: "April 2027",
        category: "Intimate Wedding",
        description:
            "An intimate destination wedding by the coast of Da Nang, Vietnam.",
        coverImage: "/images/stories/haley-david.jpg",
        destination: "da-nang",
        sections: [
            {
                type: "text",
                eyebrow: "The Story",
                title: "A quiet celebration by the coast.",
                body:
                    "Haley and David gathered their closest people in Da Nang for an intimate celebration filled with warm light, quiet moments, and effortless joy.",
            },

            {
                type: "image",
                image: "/images/stories/haley-david.jpg",
                alt: "Haley & David wedding in Da Nang",
                size: "large",
            },

            {
                type: "gallery",
                layout: "grid",
                images: [
                    {
                        src: "/images/stories/haley-david-01.jpg",
                        alt: "Haley and David during their wedding in Da Nang",
                    },
                    {
                        src: "/images/stories/haley-david-02.jpg",
                        alt: "Intimate wedding moment in Da Nang",
                    },
                    {
                        src: "/images/stories/haley-david-03.jpg",
                        alt: "Wedding celebration in Vietnam",
                    },
                    {
                        src: "/images/stories/haley-david-04.jpg",
                        alt: "Haley and David portrait",
                    },
                ],
            },

            {
                type: "film",
                videoUrl: "https://youtu.be/XST30jLkZbM?si=xEgfvQkVVnAKDflv",
            },

            {
                type: "quote",
                text:
                    "For the moments we never planned, and the memories we will always keep.",
            },
        ],
    },
];