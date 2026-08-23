"use client";

import { useEffect, useState } from "react";

type GalleryImage = {
  id: string;
  src: string;
  alt: string;
};

export default function GalleryLightbox({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = () => setActiveIndex(null);
  const previous = () => setActiveIndex(index => index === null ? null : (index - 1 + images.length) % images.length);
  const next = () => setActiveIndex(index => index === null ? null : (index + 1) % images.length);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex]);

  return (
    <>
      <div className="columns-2 gap-1 md:columns-3 md:gap-2 lg:columns-4 xl:columns-5">
        {images.map((image, index) => (
          <figure key={image.id} className="mb-1 break-inside-avoid md:mb-2">
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group block w-full cursor-zoom-in text-left"
              aria-label={`View photo ${index + 1} of ${images.length}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="block h-auto w-full transition-opacity duration-300 group-hover:opacity-90"
              />
            </button>
          </figure>
        ))}
      </div>

      {activeIndex !== null && images[activeIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center text-2xl font-light text-white/80 transition hover:text-white"
            aria-label="Close photo viewer"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={event => { event.stopPropagation(); previous(); }}
                className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-3xl font-light text-white/70 transition hover:text-white md:left-6"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={event => { event.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-3xl font-light text-white/70 transition hover:text-white md:right-6"
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}

          <img
            src={images[activeIndex].src}
            alt={images[activeIndex].alt}
            className="max-h-[calc(100vh-24px)] max-w-full object-contain md:max-h-[calc(100vh-64px)]"
            onClick={event => event.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] text-white/60">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
