type StoryFilmProps = {
    videoUrl: string;
    poster?: string;
};

function getEmbedUrl(url: string) {
    if (url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }

    if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }

    if (url.includes("vimeo.com/")) {
        const videoId = url.split("vimeo.com/")[1]?.split("?")[0];

        if (videoId) {
            return `https://player.vimeo.com/video/${videoId}`;
        }
    }

    return url;
}

export default function StoryFilm({
    videoUrl,
}: StoryFilmProps) {
    const embedUrl = getEmbedUrl(videoUrl);

    return (
        <section className="px-6 py-32 md:px-10 md:py-48">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        The Film
                    </p>

                    <span className="font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">
                        Watch
                    </span>
                </div>

                <div className="relative aspect-video overflow-hidden bg-black">
                    <iframe
                        src={embedUrl}
                        title="Wedding film"
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </section>
    );
}