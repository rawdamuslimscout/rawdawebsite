"use client";

/* eslint-disable @next/next/no-img-element */

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NewsItem } from "@/data/content";

export function newsImages(item: NewsItem): string[] {
  return item.imageUrls?.length
    ? item.imageUrls
    : item.imageUrl
      ? [item.imageUrl]
      : [];
}

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function NewsModal({
  item,
  onClose,
}: {
  item: NewsItem | null;
  onClose: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const images = item ? newsImages(item) : [];
  const imageCount = images.length;

  // Callers often pass an inline `onClose`; keep it (and the image count) in a
  // ref so the open/close effect only runs when the modal actually opens or
  // closes. Otherwise every parent re-render would steal focus back to the
  // close button and lose track of the element to restore focus to.
  const latest = useRef({ onClose, imageCount });
  latest.current = { onClose, imageCount };

  const isOpen = !!item;

  useEffect(() => {
    setImageIndex(0);
  }, [item?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      const { onClose, imageCount } = latest.current;

      if (event.key === "Escape") {
        onClose();
        return;
      }

      // RTL: → is "previous", ← is "next".
      if (
        imageCount > 1 &&
        (event.key === "ArrowRight" || event.key === "ArrowLeft")
      ) {
        event.preventDefault();
        const step = event.key === "ArrowLeft" ? 1 : -1;
        setImageIndex((i) => (i + step + imageCount) % imageCount);
        return;
      }

      // Keep Tab inside the dialog.
      if (event.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const current = document.activeElement;
        if (!dialogRef.current.contains(current)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && current === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && current === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  // Warm the cache for the neighbouring photos so paging feels instant.
  useEffect(() => {
    if (imageCount < 2) return;
    const neighbours = [
      images[(imageIndex + 1) % imageCount],
      images[(imageIndex - 1 + imageCount) % imageCount],
    ];
    for (const src of neighbours) {
      const img = new Image();
      img.src = src;
    }
    // `images` is derived from `item`; its identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, imageIndex, imageCount]);

  if (!item) return null;

  const goPrev = () =>
    setImageIndex((imageIndex - 1 + images.length) % images.length);
  const goNext = () => setImageIndex((imageIndex + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-purple-dark/70 p-4 backdrop-blur-sm sm:p-5"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`news-title-${item.id}`}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="إغلاق التفاصيل"
          className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-brand-ink shadow-sm transition-colors hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>
        {images.length > 0 && (
          <div
            className="relative bg-brand-ink"
            onTouchStart={(event) => {
              touchStartX.current =
                event.touches.length === 1
                  ? (event.touches[0]?.clientX ?? null)
                  : null;
            }}
            onTouchEnd={(event) => {
              const startX = touchStartX.current;
              const endX = event.changedTouches[0]?.clientX;
              touchStartX.current = null;
              if (images.length < 2 || startX === null || endX === undefined)
                return;
              const dx = endX - startX;
              if (Math.abs(dx) < 45) return;
              // RTL: dragging the photo to the right reveals the next one.
              if (dx > 0) goNext();
              else goPrev();
            }}
          >
            <img
              src={images[imageIndex]}
              alt={
                images.length > 1
                  ? `${item.title} (${imageIndex + 1} من ${images.length})`
                  : item.title
              }
              decoding="async"
              draggable={false}
              className="h-56 w-full select-none object-contain sm:h-72"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="الصورة السابقة"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="الصورة التالية"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span
                  aria-live="polite"
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold tabular-nums text-white"
                >
                  {imageIndex + 1} / {images.length}
                </span>
              </>
            )}
          </div>
        )}
        <div className="p-6 sm:p-8">
          <p className="text-sm font-semibold text-brand-turquoise-dark">
            {item.category} · {item.date}
          </p>
          <h2
            id={`news-title-${item.id}`}
            className="mt-2 font-display text-2xl font-bold text-brand-ink"
          >
            {item.title}
          </h2>
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-brand-ink/70">
            {item.excerpt}
          </p>
        </div>
      </div>
    </div>
  );
}
