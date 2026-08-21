"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "../../../lib/media";

type StoryLightboxProps = {
    images: {
        src: string;
        alt: string;
    }[];
    initialIndex: number;
    onClose: () => void;
};

export default function StoryLightbox({
    images,
    initialIndex,
    onClose,
}: StoryLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const activePointers = useRef<
        Map<number, { x: number; y: number }>
    >(new Map());

    const lastTouchDistance = useRef<number | null>(null);
    const touchStartX = useRef<number | null>(null);

    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const startPosition = useRef({ x: 0, y: 0 });

    const lastTapTime = useRef(0);

    const currentImage = images[currentIndex];

    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const goPrevious = () => {
        resetZoom();

        setCurrentIndex((index) =>
            index === 0 ? images.length - 1 : index - 1
        );
    };

    const goNext = () => {
        resetZoom();

        setCurrentIndex((index) =>
            index === images.length - 1 ? 0 : index + 1
        );
    };

    const getPointerDistance = () => {
        const pointers = Array.from(
            activePointers.current.values()
        );

        if (pointers.length < 2) {
            return null;
        }

        const [first, second] = pointers;

        return Math.hypot(
            first.x - second.x,
            first.y - second.y
        );
    };

    const handlePointerDown = (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        if (event.pointerType !== "touch") {
            return;
        }

        activePointers.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        /*
         * Two fingers = pinch zoom
         */
        if (activePointers.current.size === 2) {
            lastTouchDistance.current =
                getPointerDistance();

            touchStartX.current = null;
            isDragging.current = false;

            return;
        }

        /*
         * One finger
         */
        if (activePointers.current.size === 1) {
            touchStartX.current = event.clientX;

            /*
             * Double tap
             */
            const now = Date.now();

            if (now - lastTapTime.current < 300) {
                if (scale > 1) {
                    resetZoom();
                } else {
                    setScale(2);
                }

                touchStartX.current = null;
            }

            lastTapTime.current = now;

            /*
             * Start dragging if already zoomed
             */
            if (scale > 1) {
                isDragging.current = true;

                dragStart.current = {
                    x: event.clientX,
                    y: event.clientY,
                };

                startPosition.current = position;
            }
        }
    };

    const handlePointerMove = (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        if (event.pointerType !== "touch") {
            return;
        }

        if (!activePointers.current.has(event.pointerId)) {
            return;
        }

        activePointers.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        /*
         * PINCH ZOOM
         */
        if (activePointers.current.size === 2) {
            const distance = getPointerDistance();

            if (
                distance !== null &&
                lastTouchDistance.current !== null
            ) {
                const difference =
                    distance -
                    lastTouchDistance.current;

                setScale((currentScale) => {
                    const nextScale =
                        currentScale +
                        difference * 0.01;

                    return Math.min(
                        4,
                        Math.max(1, nextScale)
                    );
                });
            }

            lastTouchDistance.current = distance;

            return;
        }

        /*
         * PAN IMAGE WHEN ZOOMED
         */
        if (
            !isDragging.current ||
            scale <= 1
        ) {
            return;
        }

        const deltaX =
            event.clientX -
            dragStart.current.x;

        const deltaY =
            event.clientY -
            dragStart.current.y;

        setPosition({
            x:
                startPosition.current.x +
                deltaX,
            y:
                startPosition.current.y +
                deltaY,
        });
    };

    const handlePointerUp = (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        if (event.pointerType !== "touch") {
            return;
        }

        activePointers.current.delete(
            event.pointerId
        );

        if (activePointers.current.size < 2) {
            lastTouchDistance.current = null;
        }

        /*
         * All fingers released
         */
        if (activePointers.current.size === 0) {
            isDragging.current = false;

            /*
             * Swipe only when not zoomed
             */
            if (
                scale <= 1 &&
                touchStartX.current !== null
            ) {
                const distance =
                    touchStartX.current -
                    event.clientX;

                if (Math.abs(distance) > 50) {
                    if (distance > 0) {
                        goNext();
                    } else {
                        goPrevious();
                    }
                }
            }

            touchStartX.current = null;
        }
    };

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent
        ) => {
            if (event.key === "Escape") {
                onClose();
            }

            if (event.key === "ArrowLeft") {
                goPrevious();
            }

            if (event.key === "ArrowRight") {
                goNext();
            }

            if (event.key === "0") {
                resetZoom();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
                touchAction: "none",
            }}
        >
            {/* CLOSE */}
            <button
                type="button"
                onClick={onClose}
                className="absolute right-5 top-5 z-20 p-3 text-2xl text-white/80 transition hover:text-white"
                aria-label="Close"
            >
                ✕
            </button>

            {/* PREVIOUS */}
            <button
                type="button"
                onClick={goPrevious}
                className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 p-4 text-3xl text-white/80 transition hover:text-white md:block"
                aria-label="Previous image"
            >
                ←
            </button>

            {/* IMAGE */}
            <div className="relative h-[90vh] w-[92vw] overflow-visible">
                <Image
                    src={mediaUrl(currentImage.src)}
                    alt={currentImage.alt}
                    fill
                    priority
                    className="select-none object-contain"
                    sizes="100vw"
                    draggable={false}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin:
                            "center center",
                        transition:
                            isDragging.current
                                ? "none"
                                : "transform 150ms ease-out",
                    }}
                />
            </div>

            {/* NEXT */}
            <button
                type="button"
                onClick={goNext}
                className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 p-4 text-3xl text-white/80 transition hover:text-white md:block"
                aria-label="Next image"
            >
                →
            </button>

            {/* COUNTER */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-white/60">
                {currentIndex + 1} / {images.length}
            </div>

            {/* ZOOM INDICATOR */}
            {scale > 1 && (
                <button
                    type="button"
                    onClick={resetZoom}
                    className="absolute bottom-5 right-5 z-20 text-xs tracking-[0.15em] text-white/60 transition hover:text-white"
                >
                    {Math.round(scale * 100)}% · RESET
                </button>
            )}
        </div>
    );
}