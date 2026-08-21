"use client";

import Image from "next/image";
import { useState } from "react";
import { mediaUrl } from "../../../lib/media";
import StoryLightbox from "./StoryLightbox";

type StoryGalleryProps = {
  title?: string;
  images: {
    src: string;
    alt: string;
  }[];
  layout?: "grid" | "feature" | "portrait-pair";
};

export default function StoryGallery({
  title,
  images,
  layout = "grid",
}: StoryGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const imageButton = (
    image: StoryGalleryProps["images"][number],
    index: number,
    className: string
  ) => (
    <button
      key={index}
      type="button"
      onClick={() => setLightboxIndex(index)}
      className={className}
      aria-label={`Open image ${index + 1}`}
    >
      <Image
        src={mediaUrl(image.src)}
        alt={image.alt}
        width={2400}
        height={1600}
        className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.01]"
        sizes="(max-width: 768px) 100vw, 50vw"
        draggable={false}
      />
    </button>
  );

  const content = (
    <div className="mx-auto max-w-7xl">
      {title && (
        <div className="mb-8">
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-[#77736c]">
            {title}
          </p>
        </div>
      )}

      {layout === "feature" && (
        <div className="space-y-6">
          {images.map((image, index) =>
            imageButton(
              image,
              index,
              "relative block aspect-[16/9] w-full overflow-hidden text-left"
            )
          )}
        </div>
      )}

      {layout === "portrait-pair" && (
        <div className="grid gap-6 md:grid-cols-2">
          {images.map((image, index) =>
            imageButton(
              image,
              index,
              "relative block aspect-[2/3] w-full overflow-hidden text-left"
            )
          )}
        </div>
      )}

      {layout === "grid" && (
        <div className="grid gap-6 md:grid-cols-2">
          {images.map((image, index) =>
            imageButton(
              image,
              index,
              "relative block aspect-[3/2] w-full overflow-hidden text-left"
            )
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <section className="px-6 md:px-10">{content}</section>

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
