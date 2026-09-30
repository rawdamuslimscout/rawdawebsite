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

export default function NewsModal({
  item,
  onClose,
}: {
  item: NewsItem | null;
  onClose: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setImageIndex(0);
  }, [item?.id]);

  useEffect(() => {
    if (!item) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [item, onClose]);

  if (!item) return null;
  const images = newsImages(item);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-purple-dark/70 p-4 backdrop-blur-sm sm:p-5"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`news-title-${item.id}`}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
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
          <div className="relative bg-brand-ink">
            <img
              src={images[imageIndex]}
              alt={item.title}
              className="h-56 w-full object-contain sm:h-72"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setImageIndex(
                      (imageIndex - 1 + images.length) % images.length,
                    )
                  }
                  aria-label="الصورة السابقة"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setImageIndex((imageIndex + 1) % images.length)}
                  aria-label="الصورة التالية"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
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
