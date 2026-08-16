import Image from "next/image";

type StoryGalleryProps = {
    images: {
        src: string;
        alt: string;
    }[];
    layout?: "grid" | "feature" | "portrait-pair";
};

export default function StoryGallery({
    images,
    layout = "grid",
}: StoryGalleryProps) {
    if (layout === "feature") {
        return (
            <section className="px-6 md:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-6">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className="relative aspect-[16/9] overflow-hidden"
                            >
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    width={2400}
                                    height={1600}
                                    className="w-full"
                                    style={{ width: "100%", height: "auto" }}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (layout === "portrait-pair") {
        return (
            <section className="px-6 md:px-10">
                <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="relative aspect-[2/3] overflow-hidden"
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                width={2400}
                                height={1600}
                                className="w-full"
                                style={{ width: "100%", height: "auto" }}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="px-6 md:px-10">
            <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="overflow-hidden"
                    >
                        <Image
                            src={image.src}
                            alt={image.alt}
                            width={2400}
                            height={1600}
                            className="w-full"
                            style={{ width: "100%", height: "auto" }}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}