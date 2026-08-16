import Image from "next/image";

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
                    src={image}
                    alt={alt}
                    width={2400}
                    height={1600}
                    className="w-full"
                    style={{ width: "100%", height: "auto" }}
                    sizes="100vw"
                />
            </div>
        </section>
    );
}