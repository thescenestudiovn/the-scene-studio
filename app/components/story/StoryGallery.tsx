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

export default function StoryGallery({ images, layout = "grid" }: StoryGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const imageButton = (image: StoryGalleryProps["images"][number], index: number, className: string) => (
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

  return (
    <>
      {layout === "feature" && (
        <section className="px-6 md:px-10">
          <div className="mx-auto max-w-7xl space-y-6">
            {images.map((image, index) =>
              imageButton(image, index, "relative block aspect-[16/9] w-full overflow-hidden text-left")
            )}
          </div>
        </section>
      )}

      {layout === "portrait-pair" && (
        <section className="px-6 md:px-10">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {images.map((image, index) =>
              imageButton(image, index, "relative block aspect-[2/3] w-full overflow-hidden text-left")
            )}
          </div>
        </section>
      )}

      {layout === "grid" && (
        <section className="px-6 md:px-10">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
            {images.map((image, index) =>
              imageButton(image, index, "relative block aspect-[3/2] w-full overflow-hidden text-left")
            )}
          </div>
        </section>
      )}

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
