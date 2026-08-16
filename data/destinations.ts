export type DestinationSlug =
    | "da-nang"
    | "hoi-an"
    | "phu-quoc"
    | "nha-trang"
    | "con-dao"
    | "ba-na-hills";
export type Destination = {
    country: string;
    countryName: string;
    slug: string;
    name: string;
    region: string;
    seoTitle: string;
    seoDescription: string;
    description: string;
    introTitle: string;
    introText: string;
    weddingStyle: {
        title: string;
        description: string;
    }[];
};

export const destinations: Destination[] = [
    {
        country: "vietnam",
        countryName: "Vietnam",
        slug: "da-nang",
        name: "Da Nang",
        region: "Central Vietnam",

        seoTitle:
            "Da Nang Wedding Photographer & Wedding Films | The Scene Studio",

        seoDescription:
            "The Scene Studio is a Da Nang wedding photographer and wedding film studio documenting intimate destination weddings, beach weddings, and celebrations across Central Vietnam.",

        description:
            "A coastal city where beaches, mountains, modern resorts, and intimate celebrations come together.",

        introTitle:
            "A coastal city made for destination weddings with a sense of place.",

        introText:
            "Da Nang offers an effortless balance between the coast and the mountains. From beachfront resorts overlooking the East Sea to intimate celebrations surrounded by the landscapes of Central Vietnam, the city gives couples space to create a wedding that feels relaxed, personal, and entirely their own. As a Da Nang wedding photographer and wedding film studio, we document the atmosphere, people, and moments that make the destination part of the story.",

        weddingStyle: [
            {
                title: "Beachside",
                description:
                    "Ocean views, warm afternoon light, and celebrations that naturally move from the ceremony into sunset.",
            },
            {
                title: "Intimate",
                description:
                    "Smaller destination weddings where family, friends, and genuine moments take priority over production.",
            },
            {
                title: "Modern",
                description:
                    "Contemporary beachfront resorts and refined venues combined with the relaxed character of Central Vietnam.",
            },
        ],
    },

    {
        country: "vietnam",
        countryName: "Vietnam",
        slug: "hoi-an",
        name: "Hoi An",
        region: "Central Vietnam",

        seoTitle:
            "Hoi An Wedding Photographer & Wedding Films | The Scene Studio",

        seoDescription:
            "The Scene Studio documents intimate destination weddings in Hoi An with cinematic wedding photography and films inspired by the town's timeless atmosphere and Central Vietnam landscapes.",

        description:
            "A timeless riverside town where old-world architecture, lantern-lit evenings, and intimate celebrations create an atmosphere unlike anywhere else.",

        introTitle:
            "A timeless setting for an intimate destination wedding.",

        introText:
            "Hoi An brings together historic architecture, quiet riverside streets, tropical landscapes, and some of Central Vietnam's most beautiful resorts. It is a destination that naturally lends itself to intimate celebrations, where the atmosphere of the place becomes part of the wedding story. We photograph and film Hoi An weddings with a documentary approach, focusing on honest moments, natural movement, and the feeling of being there.",

        weddingStyle: [
            {
                title: "Timeless",
                description:
                    "Historic streets, warm lantern light, and architecture that gives every celebration a sense of place.",
            },
            {
                title: "Intimate",
                description:
                    "Perfect for smaller destination weddings where the focus stays on the couple, their families, and closest friends.",
            },
            {
                title: "Romantic",
                description:
                    "Riverside evenings, tropical gardens, and soft Central Vietnamese light create a naturally romantic atmosphere.",
            },
        ],
    },

    {
        country: "vietnam",
        countryName: "Vietnam",
        slug: "phu-quoc",
        name: "Phu Quoc",
        region: "Southern Vietnam",

        seoTitle:
            "Phu Quoc Wedding Photographer & Wedding Films | The Scene Studio",

        seoDescription:
            "The Scene Studio documents intimate destination weddings in Phu Quoc with cinematic wedding photography and films across tropical beaches, private resorts, and island celebrations.",

        description:
            "A tropical island of quiet beaches, warm light, and intimate resort celebrations surrounded by the sea.",

        introTitle:
            "An island setting where the sea becomes part of the celebration.",

        introText:
            "Phu Quoc offers a slower rhythm for destination weddings, with tropical beaches, private resorts, and long sunsets over the Gulf of Thailand. From intimate ceremonies by the water to relaxed celebrations surrounded by family and friends, the island creates space for weddings that feel personal rather than overly produced. We document Phu Quoc weddings with a cinematic and documentary approach, allowing the landscape and atmosphere to naturally shape the story.",

        weddingStyle: [
            {
                title: "Tropical",
                description:
                    "Palm-lined beaches, clear water, and lush landscapes create a naturally beautiful backdrop for an island celebration.",
            },
            {
                title: "Relaxed",
                description:
                    "A slower island rhythm that allows couples and their guests to enjoy the celebration without feeling rushed.",
            },
            {
                title: "Sunset",
                description:
                    "Warm evening light and ocean horizons create an atmospheric setting for ceremonies, portraits, and celebrations.",
            },
        ],
    },

    {
        country: "vietnam",
        countryName: "Vietnam",
        slug: "nha-trang",
        name: "Nha Trang",
        region: "Central Vietnam",

        seoTitle:
            "Nha Trang Wedding Photographer & Wedding Films | The Scene Studio",

        seoDescription:
            "The Scene Studio photographs and films intimate destination weddings in Nha Trang, combining beachfront resorts, tropical landscapes, and cinematic wedding storytelling.",

        description:
            "A coastal destination known for its turquoise water, beachfront resorts, and relaxed celebrations by the sea.",

        introTitle:
            "A coastal destination shaped by the sea.",

        introText:
            "Nha Trang combines a long coastline, tropical landscapes, and a wide selection of beachfront resorts, making it a natural setting for destination weddings. The city offers couples the freedom to create anything from an intimate ceremony by the water to a relaxed celebration surrounded by their closest people. Our approach is documentary and cinematic, focusing on the atmosphere, connections, and fleeting moments that make a Nha Trang wedding feel uniquely yours.",

        weddingStyle: [
            {
                title: "By the Sea",
                description:
                    "Beachfront ceremonies and ocean views create a simple, open setting for destination celebrations.",
            },
            {
                title: "Resort",
                description:
                    "Elegant coastal resorts provide a refined setting while keeping the relaxed atmosphere of a seaside destination.",
            },
            {
                title: "Intimate",
                description:
                    "Smaller celebrations allow couples to spend more time with the people who matter most.",
            },
        ],
    },

    {
        country: "vietnam",
        countryName: "Vietnam",
        slug: "con-dao",
        name: "Con Dao",
        region: "Southern Vietnam",

        seoTitle:
            "Con Dao Wedding Photographer & Wedding Films | The Scene Studio",

        seoDescription:
            "The Scene Studio documents intimate destination weddings in Con Dao with cinematic photography and films inspired by its untouched beaches, tropical landscapes, and quiet island atmosphere.",

        description:
            "A remote island destination with untouched beaches, dramatic landscapes, and an atmosphere of quiet escape.",

        introTitle:
            "A quieter island for celebrations that feel deeply personal.",

        introText:
            "Con Dao feels different from Vietnam's more familiar coastal destinations. Its secluded beaches, forested landscapes, and slower rhythm create an intimate environment for couples looking for something more private. A wedding here can feel less like an event and more like an escape shared with the people closest to you. We photograph and film Con Dao weddings with a restrained documentary approach, preserving the natural atmosphere of the island rather than forcing moments into a formula.",

        weddingStyle: [
            {
                title: "Secluded",
                description:
                    "Quiet beaches and remote landscapes create a sense of privacy that is difficult to find elsewhere.",
            },
            {
                title: "Natural",
                description:
                    "The island's forests, coastline, and changing light provide an authentic backdrop without needing excessive decoration.",
            },
            {
                title: "Meaningful",
                description:
                    "An intimate destination where the focus can remain on the people, relationships, and experience itself.",
            },
        ],
    },

    {
        country: "vietnam",
        countryName: "Vietnam",
        slug: "ba-na-hills",
        name: "Ba Na Hills",
        region: "Central Vietnam",

        seoTitle:
            "Ba Na Hills Wedding Photographer & Wedding Films | The Scene Studio",

        seoDescription:
            "The Scene Studio photographs and films destination weddings at Ba Na Hills near Da Nang, combining mountain landscapes, dramatic architecture, and cinematic wedding storytelling.",

        description:
            "A mountain destination above Da Nang, known for dramatic landscapes, changing weather, and distinctive architecture.",

        introTitle:
            "A mountain setting above the clouds.",

        introText:
            "Rising above the coast of Central Vietnam, Ba Na Hills offers a destination wedding setting unlike the beaches and resorts below. Mountain landscapes, shifting clouds, cool air, and distinctive architecture create an atmosphere that can feel almost cinematic. For couples looking for something visually distinctive near Da Nang, it offers an experience shaped by elevation, weather, and the surrounding landscape. We document celebrations here with an emphasis on atmosphere and movement, allowing the environment to become part of the film and photographs.",

        weddingStyle: [
            {
                title: "Mountain",
                description:
                    "Cloud-covered peaks, forests, and changing weather create an atmospheric setting for a destination celebration.",
            },
            {
                title: "Cinematic",
                description:
                    "Distinctive architecture and dramatic landscapes offer a naturally cinematic visual language.",
            },
            {
                title: "Unexpected",
                description:
                    "A completely different experience from a traditional beach wedding, while remaining close to Da Nang.",
            },
        ],
    },
];