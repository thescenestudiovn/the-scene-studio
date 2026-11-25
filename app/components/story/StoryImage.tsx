import Image from "next/image";
import { mediaUrl } from "../../../lib/media";

type StoryImageProps = {
    image: string;
    alt: string;
    size?: "normal" | "large" | "full";
};

export default function StoryImage({
    image,
    alt,
    size = "normal",
}: StoryImageProps) {
    return (
        <section className="px-6 md:px-10">
            <div
                className={`relative mx-auto ${size === "full" ? "max-w-none" : "max-w-7xl"
                    }`}
            >
                <Image
                    src={mediaUrl(image)}
                    alt={alt}
                    width={2400}
                    height={1600}
                    className="w-full select-none"
                    style={{
                        width: "100%",
                        height: "auto",
                    }}
                    sizes={size === "full" ? "100vw" : "(max-width: 1280px) 100vw, 1280px"}
                    loading="lazy"
                    draggable={false}
                />
            </div>
        </section>
    );
}