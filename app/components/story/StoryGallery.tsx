"use client";

import Image from "next/image";
import { useState } from "react";
import { mediaUrl } from "../../../lib/media";
import StoryLightbox from "./StoryLightbox";
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
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    if (layout === "feature") {
        return (
            <section className="px-6 md:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-6">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setLightboxIndex(index)}
                                className="relative aspect-[16/9] w-full overflow-hidden text-left"
                                aria-label={`Open image ${index + 1}`}
                            >
                                <Image
                                    src={mediaUrl(image.src)}
                                    alt={image.alt}
                                    width={2400}
                                    height={1600}
                                    className="w-full"
                                    style={{ width: "100%", height: "auto" }}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    draggable={false}
                                />
                            </button>
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
                        <button
                            key={index}
                            type="button"
                            onClick={() => setLightboxIndex(index)}
                            className="relative aspect-[2/3] w-full overflow-hidden text-left"
                            aria-label={`Open image ${index + 1}`}
                        >
                            <Image
                                src={mediaUrl(image.src)}
                                alt={image.alt}
                                width={2400}
                                height={1600}
                                className="w-full"
                                style={{ width: "100%", height: "auto" }}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                draggable={false}
                            />
                        </button>
                    ))}
                </div>
            </section>
        );
    }
    {
        lightboxIndex !== null && (
            <StoryLightbox
                images={images}
                initialIndex={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
            />
        )
    }
    return (
        <>
            <section className="px-6 md:px-10">
                <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setLightboxIndex(index)}
                            className="block w-full overflow-hidden text-left"
                            aria-label={`Open image ${index + 1}`}
                        >
                            <Image
                                src={mediaUrl(image.src)}
                                alt={image.alt}
                                width={2400}
                                height={1600}
                                className="w-full transition-transform duration-700 ease-out hover:scale-[1.01]"
                                style={{ width: "100%", height: "auto" }}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                draggable={false}
                            />
                        </button>
                    ))}
                </div>
            </section>

            {lightboxIndex !== null && (
                <StoryLightbox
                    images={images}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </>
    );
}