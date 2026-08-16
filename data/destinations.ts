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
            "Da Nang wedding photographer and wedding films for intimate destination weddings and beach weddings in Vietnam. The Scene Studio documents celebrations with a quiet, cinematic approach.",
        description:
            "A coastal city where modern celebrations meet beaches, mountains, and quiet moments.",

        introTitle:
            "A coastal city made for celebrations with a sense of place.",

        introText:
            "From beachfront resorts to quiet corners of the city, Da Nang offers an effortless balance between contemporary luxury and the natural beauty of Central Vietnam. It is a place where a wedding can feel intimate, relaxed, and deeply connected to the landscape.",

        weddingStyle: [
            {
                title: "Beachside",
                description:
                    "Ocean views, warm light, and celebrations that move naturally from afternoon into sunset.",
            },
            {
                title: "Intimate",
                description:
                    "Private gatherings and smaller celebrations where the people matter more than the production.",
            },
            {
                title: "Modern",
                description:
                    "Contemporary venues and refined details without losing the relaxed character of the coast.",
            },
        ],
    },

    {
        country: "vietnam",
        countryName: "Vietnam",
        slug: "hoi-an",
        name: "Hoi An",
        seoTitle:
            "Hoi An Wedding Photographer & Wedding Films | The Scene Studio",

        seoDescription:
            "Hoi An wedding photographer and wedding films for intimate destination weddings in Vietnam. The Scene Studio documents elegant, relaxed celebrations with a quiet cinematic approach.",
        region: "Central Vietnam",
        description:
            "Ancient streets, warm light, intimate venues, and a timeless atmosphere.",

        introTitle:
            "A timeless setting for stories that feel quietly cinematic.",

        introText:
            "Hoi An has a rhythm of its own. Old streets, textured walls, lantern light, and the Thu Bon River create an atmosphere that feels intimate without trying too hard. It is particularly beautiful for couples who want their wedding to feel personal and unhurried.",

        weddingStyle: [
            {
                title: "Old Town",
                description:
                    "Historic architecture, textured streets, and warm evening light create a naturally cinematic setting.",
            },
            {
                title: "Garden",
                description:
                    "Private villas and garden celebrations surrounded by tropical greenery.",
            },
            {
                title: "Slow",
                description:
                    "A destination where there is room to walk, talk, explore, and simply enjoy being together.",
            },
        ],
    },

    {
        country: "vietnam",
        countryName: "Vietnam",
        slug: "phu-quoc",
        name: "Phu Quoc",
        seoTitle:
            "Phu Quoc Wedding Photographer & Wedding Films | The Scene Studio",

        seoDescription:
            "Phu Quoc wedding photographer for intimate destination weddings and beach weddings in Vietnam. The Scene Studio creates cinematic wedding photography and films by the sea.",
        region: "Southern Vietnam",
        description:
            "A tropical island of long beaches, warm sunsets, and relaxed celebrations by the sea.",

        introTitle:
            "An island setting for celebrations shaped by the sea.",

        introText:
            "Phu Quoc brings together tropical beaches, private resorts, warm sunsets, and a slower island rhythm. It is a natural choice for couples imagining a destination wedding that feels relaxed, intimate, and connected to the ocean.",

        weddingStyle: [
            {
                title: "Tropical",
                description:
                    "Palm trees, open skies, warm water, and natural textures create an effortless island atmosphere.",
            },
            {
                title: "Resort",
                description:
                    "Beautiful beachfront resorts offer an elegant setting for intimate destination celebrations.",
            },
            {
                title: "Sunset",
                description:
                    "Golden evenings by the sea create a naturally cinematic rhythm for the celebration.",
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
            "Nha Trang wedding photographer and wedding films for destination weddings, beach weddings, and intimate celebrations along the coast of Vietnam.",
        description:
            "A coastal destination with turquoise water, island landscapes, and beautiful beachfront venues.",

        introTitle:
            "A coastal escape where celebration meets the open sea.",

        introText:
            "Nha Trang combines a vibrant coastal atmosphere with beautiful beaches, islands, and beachfront resorts. For couples looking for a destination wedding with a sense of ease and a little more energy, it offers a versatile setting.",

        weddingStyle: [
            {
                title: "Coastal",
                description:
                    "Wide beaches, blue water, and open horizons create a naturally beautiful backdrop.",
            },
            {
                title: "Resort",
                description:
                    "Beachfront venues provide a comfortable setting for celebrations with family and friends.",
            },
            {
                title: "Island",
                description:
                    "Nearby islands offer opportunities for intimate ceremonies, portraits, and relaxed experiences.",
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
            "Con Dao wedding photographer for intimate destination weddings and beach weddings in Vietnam. Cinematic wedding photography and films for couples seeking a private island celebration.",
        description:
            "An intimate island destination surrounded by untouched beaches and natural beauty.",

        introTitle:
            "For couples who want the island to become part of the story.",

        introText:
            "Con Dao feels removed from everything else. Its quiet beaches, dense landscape, and slower rhythm make it naturally suited to intimate celebrations. Here, the destination itself becomes part of the experience rather than simply a backdrop.",

        weddingStyle: [
            {
                title: "Island",
                description:
                    "Open skies, quiet beaches, and a sense of being completely away from the everyday.",
            },
            {
                title: "Private",
                description:
                    "Ideal for intimate gatherings where the experience can unfold without unnecessary distractions.",
            },
            {
                title: "Unhurried",
                description:
                    "Slow mornings, long afternoons, and celebrations that leave space for the unexpected.",
            },
        ],
    },

    {
        country: "vietnam",
        countryName: "Vietnam",
        slug: "ba-na-hills",
        name: "Ba Na Hills",
        region: "Da Nang · Vietnam",
        seoTitle:
            "Ba Na Hills Wedding Photographer & Wedding Films | The Scene Studio",

        seoDescription:
            "Ba Na Hills wedding photographer and wedding films for intimate destination weddings in Da Nang, Vietnam. Cinematic photography for mountain celebrations above the clouds.",
        description:
            "A mountain destination above the clouds, surrounded by dramatic landscapes.",

        introTitle:
            "A wedding above the clouds, surrounded by the mountains.",

        introText:
            "Ba Na Hills offers a completely different atmosphere from the coast. Mist, mountains, changing weather, and dramatic architecture create a destination that feels almost cinematic by nature.",

        weddingStyle: [
            {
                title: "Mountain",
                description:
                    "Dramatic landscapes and elevated views create a striking setting for portraits and celebrations.",
            },
            {
                title: "Dramatic",
                description:
                    "Clouds, mist, architecture, and changing light make every moment feel different.",
            },
            {
                title: "Escape",
                description:
                    "A destination experience that feels far removed from the city below.",
            },
        ],
    },
];