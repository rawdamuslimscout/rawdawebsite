"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import GalleryCard from "@/components/ui/GalleryCard";
import GalleryLightbox from "@/components/ui/GalleryLightbox";

import { galleryFilters, type GalleryItem } from "@/data/content";

const SPAN_MAP: Record<string, string> = {
  large: "col-span-2 row-span-2",
  medium: "col-span-2 row-span-1",
  small: "col-span-1 row-span-1",

  lg: "col-span-2 row-span-2",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
  sm: "col-span-1 row-span-1",
};

export default function GalleryFilterGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filters = useMemo(
    () =>
      galleryFilters.filter(
        (filter, index, allFilters) =>
          allFilters.findIndex((candidate) => candidate.id === filter.id) ===
          index,
      ),
    [],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();

    map.set("all", items.length);

    for (const item of items) {
      map.set(item.category, (map.get(item.category) ?? 0) + 1);
    }

    return map;
  }, [items]);

  const visibleFilters = useMemo(() => {
    return filters.filter((filter) => {
      if (filter.id === "all") return true;

      return (counts.get(filter.id) ?? 0) > 0;
    });
  }, [filters, counts]);

  const filtered = useMemo(() => {
    if (active === "all") {
      return items;
    }

    return items.filter((item) => item.category === active);
  }, [items, active]);

  /*
   * If a category disappears because the data changed,
   * safely return to "all".
   */
  useEffect(() => {
    if (active !== "all" && (counts.get(active) ?? 0) === 0) {
      setActive("all");
      setLightboxIndex(null);
    }
  }, [active, counts]);

  /*
   * Empty gallery.
   *
   * This is mainly a safety fallback.
   * Gallery.tsx already prevents the entire section from rendering.
   */
  if (!items.length) {
    return null;
  }

  const changeFilter = (filterId: string) => {
    setActive(filterId);
    setLightboxIndex(null);
  };

  return (
    <>
      {/* =========================
          FILTERS
      ========================== */}
      {visibleFilters.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8 sm:mt-10"
        >
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
            {visibleFilters.map((filter) => {
              const isActive = active === filter.id;
              const count = counts.get(filter.id) ?? 0;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => changeFilter(filter.id)}
                  aria-pressed={isActive}
                  className={`
                    group
                    relative
                    flex
                    shrink-0
                    items-center
                    gap-2
                    overflow-hidden
                    rounded-full
                    px-3.5
                    py-2
                    text-sm
                    font-semibold
                    transition-colors
                    duration-300
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-brand-purple/40
                    focus-visible:ring-offset-2
                    ${
                      isActive
                        ? "text-white"
                        : "bg-white/70 text-brand-ink/60 ring-1 ring-brand-purple/10 hover:bg-white hover:text-brand-purple"
                    }
                  `}
                >
                  {isActive && (
                    <motion.span
                      layoutId="gallery-filter-pill"
                      className="absolute inset-0 rounded-full bg-brand-purple"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                    />
                  )}

                  <span className="relative">{filter.label}</span>

                  <span
                    className={`
                      relative
                      flex
                      min-w-5
                      items-center
                      justify-center
                      rounded-full
                      px-1.5
                      py-0.5
                      text-[10px]
                      font-bold
                      leading-none
                      transition-colors
                      ${
                        isActive
                          ? "bg-white/15 text-white/80"
                          : "bg-brand-purple/5 text-brand-ink/40 group-hover:bg-brand-purple/10 group-hover:text-brand-purple/70"
                      }
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* =========================
          GALLERY
      ========================== */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 && (
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="
              mt-8
              grid
              auto-rows-[145px]
              grid-cols-2
              gap-3
              sm:mt-10
              sm:auto-rows-[190px]
              sm:grid-cols-4
              sm:gap-4
              lg:auto-rows-[220px]
            "
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: 20,
                    scale: 0.97,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.96,
                  }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.035, 0.2),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`
                    min-h-0
                    overflow-hidden
                    rounded-2xl
                    sm:rounded-3xl
                    ${SPAN_MAP[item.size as string] ?? "col-span-1 row-span-1"}
                  `}
                >
                  <GalleryCard
                    item={item}
                    onClick={() => setLightboxIndex(index)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================
          LIGHTBOX
      ========================== */}
      <GalleryLightbox
        items={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
