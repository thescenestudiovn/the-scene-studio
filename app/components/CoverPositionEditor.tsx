"use client";

import { useEffect } from "react";

export default function CoverPositionEditor() {
  useEffect(() => {
    if (!window.location.pathname.startsWith("/admin/stories/")) return;

    const key = `story-cover-position:${window.location.pathname}`;
    let cleanup: (() => void) | undefined;

    const setup = () => {
      cleanup?.();

      const editButton = Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Edit Cover",
      );
      const section = editButton?.closest("section");
      const image = section?.querySelector("img");
      const frame = image?.parentElement;

      if (!section || !image || !frame) return false;

      const saved = window.localStorage.getItem(key);
      if (saved) image.style.objectPosition = saved;

      image.style.cursor = "grab";
      image.style.userSelect = "none";
      image.draggable = false;

      const hint = document.createElement("div");
      hint.textContent = "Drag image to adjust cover · Double-click to reset";
      hint.className =
        "pointer-events-none absolute left-5 top-5 z-10 hidden bg-black/55 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-white backdrop-blur sm:block";
      section.appendChild(hint);

      let dragging = false;
      let startX = 50;
      let startY = 50;
      let pointerStartX = 0;
      let pointerStartY = 0;

      const getPosition = () => {
        const match = image.style.objectPosition.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
        return match ? [Number(match[1]), Number(match[2])] : [50, 50];
      };

      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) return;
        dragging = true;
        [startX, startY] = getPosition();
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        image.style.cursor = "grabbing";
        image.setPointerCapture(event.pointerId);
        event.preventDefault();
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!dragging) return;

        const rect = frame.getBoundingClientRect();
        const naturalWidth = image.naturalWidth || rect.width;
        const naturalHeight = image.naturalHeight || rect.height;
        const scale = Math.max(rect.width / naturalWidth, rect.height / naturalHeight);
        const renderedWidth = naturalWidth * scale;
        const renderedHeight = naturalHeight * scale;
        const overflowX = Math.max(0, renderedWidth - rect.width);
        const overflowY = Math.max(0, renderedHeight - rect.height);

        const nextX = overflowX > 0
          ? startX - ((event.clientX - pointerStartX) / overflowX) * 100
          : 50;
        const nextY = overflowY > 0
          ? startY - ((event.clientY - pointerStartY) / overflowY) * 100
          : 50;

        const x = Math.max(0, Math.min(100, nextX));
        const y = Math.max(0, Math.min(100, nextY));
        image.style.objectPosition = `${x}% ${y}%`;
        window.localStorage.setItem(key, image.style.objectPosition);
      };

      const stopDragging = () => {
        if (!dragging) return;
        dragging = false;
        image.style.cursor = "grab";
      };

      const onDoubleClick = () => {
        image.style.objectPosition = "50% 50%";
        window.localStorage.removeItem(key);
      };

      image.addEventListener("pointerdown", onPointerDown);
      image.addEventListener("pointermove", onPointerMove);
      image.addEventListener("pointerup", stopDragging);
      image.addEventListener("pointercancel", stopDragging);
      image.addEventListener("dblclick", onDoubleClick);

      cleanup = () => {
        image.removeEventListener("pointerdown", onPointerDown);
        image.removeEventListener("pointermove", onPointerMove);
        image.removeEventListener("pointerup", stopDragging);
        image.removeEventListener("pointercancel", stopDragging);
        image.removeEventListener("dblclick", onDoubleClick);
        hint.remove();
      };

      return true;
    };

    if (setup()) return () => cleanup?.();

    const observer = new MutationObserver(() => {
      if (setup()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cleanup?.();
    };
  }, []);

  return null;
}
