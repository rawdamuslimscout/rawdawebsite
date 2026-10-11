"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, ChevronLeft, ImageOff, Loader2 } from "lucide-react";

import type { GalleryItem } from "@/data/content";
import { thumbUrl } from "@/lib/image-url";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Minimum horizontal travel (px) for a swipe to count as navigation. */
const SWIPE_X = 50;
/** Minimum downward travel (px) for a swipe to close the viewer. */
const SWIPE_DOWN = 90;

export default function GalleryLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const open = index !== null && index >= 0 && index < items.length;
  const item = open && index !== null ? items[index] : null;

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const multiTouch = useRef(false);

  // Which way the strip moved, so the next image slides in from the side
  // the visitor is heading to (RTL: "next" lives on the left).
  const [direction, setDirection] = useState<1 | -1>(1);
  // Full-size images the browser has finished downloading.
  const [loaded, setLoaded] = useState<Record<string, true>>({});

  const markLoaded = useCallback((src: string) => {
    setLoaded((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  }, []);

  const goPrev = useCallback(() => {
    if (index === null || items.length <= 1) return;
    setDirection(-1);
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  const goNext = useCallback(() => {
    if (index === null || items.length <= 1) return;
    setDirection(1);
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  // Keep the latest handlers in a ref so the open/close effect below runs
  // only when the viewer opens or closes (not on every navigation).
  const handlers = useRef({ onClose, goPrev, goNext });
  handlers.current = { onClose, goPrev, goNext };

  /* ---------------------------------------------------------------------- */
  /* Open / close: scroll lock, focus in, focus restore, keyboard            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Wait a frame so the dialog is mounted before moving focus into it.
    const raf = requestAnimationFrame(() => closeRef.current?.focus());

    const onKey = (event: KeyboardEvent) => {
      const { onClose, goPrev, goNext } = handlers.current;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      // RTL: the visual "start" is on the right, so → goes back, ← goes forward.
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goPrev();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goNext();
        return;
      }

      // Keep Tab cycling inside the dialog.
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

    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open]);

  /* ---------------------------------------------------------------------- */
  /* Preload the current image and its neighbours                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open || index === null) return;

    const n = items.length;
    const urls = Array.from(
      new Set(
        [index, index + 1, index - 1]
          .map((i) => items[(i + n) % n]?.imageUrl)
          .filter((url): url is string => !!url),
      ),
    );

    const images = urls.map((url) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => markLoaded(url);
      img.src = url;
      return img;
    });

    return () => {
      for (const img of images) img.onload = null;
    };
  }, [open, index, items, markLoaded]);

  /* ---------------------------------------------------------------------- */
  /* Touch: swipe sideways to navigate, down to close; never fight pinch     */
  /* ---------------------------------------------------------------------- */

  const onTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length > 1) {
      multiTouch.current = true;
      touchStart.current = null;
      return;
    }
    multiTouch.current = false;
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;

    // A pinch, or a pan while zoomed in, is not a swipe.
    const zoomed =
      typeof window !== "undefined" &&
      !!window.visualViewport &&
      window.visualViewport.scale > 1.01;
    if (!start || !touch || multiTouch.current || zoomed) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    if (Math.abs(dx) >= SWIPE_X && Math.abs(dx) > Math.abs(dy) * 1.4) {
      // RTL reading order: dragging the photo to the right reveals the next one.
      if (dx > 0) goNext();
      else goPrev();
      return;
    }

    if (dy >= SWIPE_DOWN && dy > Math.abs(dx) * 1.4) {
      onClose();
    }
  };

  const fullSrc = item?.imageUrl;
  const isLoaded = !!fullSrc && !!loaded[fullSrc];
  // Show the (usually cached) thumbnail at once, then swap in the full image.
  const displaySrc = fullSrc
    ? isLoaded
      ? fullSrc
      : thumbUrl(fullSrc)
    : undefined;
  const hasThumb = !!fullSrc && thumbUrl(fullSrc) !== fullSrc;
  const captionId = item ? `lightbox-caption-${item.id}` : undefined;

  return (
    <AnimatePresence>
      {open && item && index !== null && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            overscroll-contain
            bg-brand-ink/95
            px-3
            backdrop-blur-xl
            sm:px-6
          "
          role="dialog"
          aria-modal="true"
          aria-label="عرض الصورة"
          aria-describedby={item.title ? captionId : undefined}
          onClick={onClose}
          onTouchStart={onTouchStart}
          onTouchMove={(event) => {
            if (event.touches.length > 1) multiTouch.current = true;
          }}
          onTouchEnd={onTouchEnd}
        >
          {/* =========================
              TOP BAR
          ========================== */}
          <div
            className="
              absolute
              inset-x-0
              top-0
              z-10
              flex
              items-center
              justify-between
              px-4
              py-4
              sm:px-6
              sm:py-5
            "
          >
            {/* Counter */}
            <div
              onClick={(event) => event.stopPropagation()}
              aria-live="polite"
              aria-atomic="true"
              className="
                rounded-full
                bg-white/10
                px-3
                py-1.5
                text-xs
                font-semibold
                tabular-nums
                text-white/70
                backdrop-blur-md
              "
            >
              <span className="sr-only">الصورة </span>
              {index + 1} / {items.length}
            </div>

            {/* Close */}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-white/10
                text-white
                backdrop-blur-md
                transition-all
                hover:scale-105
                hover:bg-white/20
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white/50
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* =========================
              NAVIGATION
          ========================== */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrev();
                }}
                aria-label="الصورة السابقة"
                className="
                  absolute
                  right-2
                  top-1/2
                  z-20
                  flex
                  h-11
                  w-11
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  text-white
                  backdrop-blur-md
                  transition-all
                  hover:scale-105
                  hover:bg-white/20
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white/50
                  sm:right-6
                  sm:h-12
                  sm:w-12
                "
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                aria-label="الصورة التالية"
                className="
                  absolute
                  left-2
                  top-1/2
                  z-20
                  flex
                  h-11
                  w-11
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  text-white
                  backdrop-blur-md
                  transition-all
                  hover:scale-105
                  hover:bg-white/20
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white/50
                  sm:left-6
                  sm:h-12
                  sm:w-12
                "
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </>
          )}

          {/* =========================
              IMAGE
          ========================== */}
          <motion.div
            key={item.id}
            initial={{
              opacity: 0,
              // RTL: "next" enters from the left, "previous" from the right.
              x: direction === 1 ? -28 : 28,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(event) => event.stopPropagation()}
            className="
              relative
              flex
              max-h-[88vh]
              max-w-[calc(100vw-6.5rem)]
              flex-col
              items-center
              sm:max-w-[calc(100vw-10rem)]
            "
          >
            {displaySrc ? (
              <div className="relative">
                <img
                  src={displaySrc}
                  alt={item.title}
                  draggable={false}
                  onLoad={() => {
                    if (displaySrc === fullSrc) markLoaded(fullSrc);
                  }}
                  className={`
                    w-auto
                    max-w-full
                    select-none
                    object-contain
                    ${
                      !isLoaded && hasThumb
                        ? // Low-res preview stretched to the size the full
                          // image will take, so nothing jumps when it swaps in.
                          "h-[76vh] sm:h-[78vh]"
                        : "max-h-[76vh] rounded-2xl shadow-2xl sm:max-h-[78vh] sm:rounded-3xl"
                    }
                  `}
                />
                {!isLoaded && (
                  <span
                    role="status"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-ink/50 text-white backdrop-blur-sm">
                      <Loader2
                        className="h-5 w-5 animate-spin"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="sr-only">جارٍ تحميل الصورة</span>
                  </span>
                )}
              </div>
            ) : (
              <div className="flex h-[50vh] w-[min(80vw,40rem)] flex-col items-center justify-center gap-3 rounded-2xl bg-white/5 text-white/50 sm:rounded-3xl">
                <ImageOff
                  className="h-10 w-10"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="text-sm">الصورة غير متوفرة</span>
              </div>
            )}

            {/* Caption */}
            {item.title && (
              <p
                id={captionId}
                className="
                  mt-4
                  max-w-[90vw]
                  rounded-full
                  bg-white/10
                  px-4
                  py-2
                  text-center
                  text-sm
                  font-semibold
                  text-white/90
                  backdrop-blur-md
                  sm:px-5
                "
              >
                {item.title}
              </p>
            )}
          </motion.div>

          {/* Bottom hint: keyboard on desktop, swipe on touch screens */}
          {items.length > 1 && (
            <>
              <div
                aria-hidden="true"
                className="
                  absolute
                  bottom-5
                  hidden
                  items-center
                  gap-2
                  rounded-full
                  bg-white/5
                  px-4
                  py-2
                  text-[11px]
                  font-medium
                  text-white/40
                  sm:flex
                "
              >
                استخدم ← → للتنقل · ESC للإغلاق
              </div>
              <div
                aria-hidden="true"
                className="
                  absolute
                  bottom-4
                  rounded-full
                  bg-white/5
                  px-4
                  py-2
                  text-[11px]
                  font-medium
                  text-white/40
                  sm:hidden
                "
              >
                اسحب للتنقل بين الصور
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
