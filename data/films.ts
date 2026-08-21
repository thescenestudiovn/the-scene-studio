export type Film = {
    title: string;
    location: string;
    description: string;
    youtubeUrl: string;
};

export const films: Film[] = [
    {
        title: "Haley & David",
        location: "Da Nang · Vietnam",
        description:
            "An intimate destination wedding film capturing Haley and David's celebration by the coast of Da Nang, Vietnam.",
        youtubeUrl: "https://www.youtube.com/watch?v=XST30jLkZbM",
    },

    {
        title: "Anna & James",
        location: "Hoi An · Vietnam",
        description: "Hoi An wedding film capturing Anna and James' intimate celebration in the historic town of Hoi An, Vietnam.",
        youtubeUrl: "https://www.youtube.com/watch?v=o7oHhcxrpXE",
    },

    {
        title: "Sarah & Tom",
        location: "Côn Đảo · Vietnam",
        description:
            "A cinematic destination wedding film capturing Sarah and Tom's celebration on the beautiful island of Côn Đảo, Vietnam.",
        youtubeUrl: "https://www.youtube.com/watch?v=VMVzFgmL3FA",
    },
];