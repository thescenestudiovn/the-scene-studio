"use client";

import { useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";

type GalleryImage = {
  id: string;
  src: string;
  alt: string;
};

export default function GalleryLightbox({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null || images.length < 2) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
    const deltaX = endX - touchStartX.current;
    const deltaY = endY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    if (deltaX < 0) next();
    else previous();
  };

  return (
    <>
      <div className="mx-[4%] columns-2 gap-1 md:mx-[6%] md:columns-3 md:gap-2 lg:mx-[8%] lg:columns-4 xl:mx-[10%] xl:columns-5">
        {images.map((image, index) => (
          <figure key={image.id} className="mb-1 break-inside-avoid md:mb-2">
            <button type="button" onClick={() => setActiveIndex(index)} className="group block w-full cursor-zoom-in touch-manipulation text-left" aria-label={`View photo ${index + 1} of ${images.length}`}>
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full transition-opacity duration-300 group-hover:opacity-90"
              />
            </button>
          </figure>
        ))}
      </div>

      {activeIndex !== null && images[activeIndex] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 p-3 backdrop-blur-md md:p-8" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={close} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <button type="button" onClick={close} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center text-2xl font-light text-black/50 transition hover:text-black" aria-label="Close photo viewer">×</button>

          {images.length > 1 && (
            <>
              <button type="button" onClick={event => { event.stopPropagation(); previous(); }} className="absolute left-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-3xl font-light text-black/40 transition hover:text-black md:flex md:left-6" aria-label="Previous photo">‹</button>
              <button type="button" onClick={event => { event.stopPropagation(); next(); }} className="absolute right-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-3xl font-light text-black/40 transition hover:text-black md:flex md:right-6" aria-label="Next photo">›</button>
            </>
          )}

          <img src={images[activeIndex].src} alt={images[activeIndex].alt} className="max-h-[calc(100vh-24px)] max-w-full select-none object-contain md:max-h-[calc(100vh-64px)]" draggable={false} onClick={event => event.stopPropagation()} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] text-black/40">{activeIndex + 1} / {images.length}</div>
        </div>
      )}
    </>
  );
}
