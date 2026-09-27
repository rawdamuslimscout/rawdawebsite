"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

import type { GalleryItem } from "@/data/content";

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
  const touchStartX = useRef<number | null>(null);

  const goPrev = useCallback(() => {
    if (index === null || items.length <= 1) return;

    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  const goNext = useCallback(() => {
    if (index === null || items.length <= 1) return;

    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        goPrev();
      }

      if (event.key === "ArrowLeft") {
        goNext();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, goPrev, goNext]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
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
            bg-brand-ink/95
            px-3
            backdrop-blur-xl
            sm:px-6
          "
          role="dialog"
          aria-modal="true"
          aria-label="عرض الصورة"
          onClick={onClose}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const startX = touchStartX.current;
            const endX = event.changedTouches[0]?.clientX;
            touchStartX.current = null;
            if (
              startX === null ||
              endX === undefined ||
              Math.abs(endX - startX) < 50
            )
              return;
            if (endX > startX) goPrev();
            else goNext();
          }}
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
              className="
                rounded-full
                bg-white/10
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white/70
                backdrop-blur-md
              "
            >
              {index + 1} / {items.length}
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="
                flex
                h-10
                w-10
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
                  right-3
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
                  left-3
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
              scale: 0.96,
              y: 8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
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
              max-w-[calc(100vw-5rem)]
              flex-col
              items-center
              sm:max-w-[calc(100vw-10rem)]
            "
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              draggable={false}
              className="
                  max-h-[76vh]
                  w-auto
                  max-w-full
                  rounded-2xl
                  object-contain
                  shadow-2xl
                  select-none
                  sm:max-h-[78vh]
                  sm:rounded-3xl
              "
            />

            {/* Caption */}
            {item.title && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
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
              </motion.div>
            )}
          </motion.div>

          {/* Bottom keyboard hint */}
          {items.length > 1 && (
            <div
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
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
