"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

import GalleryCard from "@/components/ui/GalleryCard";
import GalleryLightbox from "@/components/ui/GalleryLightbox";
import { arabicCount, PHOTO_FORMS } from "@/components/news/format";
import { galleryFilters, type GalleryItem } from "@/data/content";
import { fillGalleryGaps, type TileSpan } from "@/lib/gallery-layout";

/* -------------------------------------------------------------------------- */
/*                              DESKTOP LAYOUT                                */
/* -------------------------------------------------------------------------- */

/**
 * Important:
 * These spans intentionally start at lg.
 *
 * Mobile + tablet = clean predictable grid
 * Desktop = editorial / masonry-inspired composition
 */
const DESKTOP_SPANS: Record<string, TileSpan> = {
  large: { col: 2, row: 2 },
  medium: { col: 2, row: 1 },
  small: { col: 1, row: 1 },

  lg: { col: 2, row: 2 },
  wide: { col: 2, row: 1 },
  tall: { col: 1, row: 2 },
  sm: { col: 1, row: 1 },
};

// Literal class names so Tailwind generates them (index = span).
const BASE_COL_SPAN = ["", "col-span-1", "col-span-2"];
const SM_COL_SPAN = ["", "sm:col-span-1", "sm:col-span-2", "sm:col-span-3"];
const LG_COL_SPAN = ["", "lg:col-span-1", "lg:col-span-2", "lg:col-span-3", "lg:col-span-4"];
const LG_ROW_SPAN = ["", "lg:row-span-1", "lg:row-span-2", "lg:row-span-3", "lg:row-span-4", "lg:row-span-5", "lg:row-span-6"];
// Below desktop, rows take their height from the tiles' 4:3 ratio; a tile
// widened to fill the last row keeps the same height with a wider ratio.
const BASE_ASPECT = ["", "aspect-[4/3]", "aspect-[8/3]"];
const SM_ASPECT = ["", "sm:aspect-[4/3]", "sm:aspect-[8/3]", "sm:aspect-[4/1]"];
const ONE: TileSpan = { col: 1, row: 1 };

export default function GalleryFilterGrid({
  items,
  withFilters = true,
}: {
  items: GalleryItem[];
  /** false for the homepage teaser: no category chips, just the grid. */
  withFilters?: boolean;
}) {
  const [active, setActive] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /* ------------------------------------------------------------------------ */
  /* FILTERS                                                                  */
  /* ------------------------------------------------------------------------ */

  const filters = useMemo(() => {
    return galleryFilters.filter(
      (filter, index, allFilters) =>
        allFilters.findIndex((candidate) => candidate.id === filter.id) ===
        index,
    );
  }, []);

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

  const activeFilter =
    visibleFilters.find((filter) => filter.id === active) ?? visibleFilters[0];

  // Tile sizes per breakpoint with every hole filled (see lib/gallery-layout.ts):
  // 2 columns on phones, 3 on tablets, 4 (admin-chosen sizes) on desktop.
  const layout = useMemo(() => {
    const ones = filtered.map(() => ONE);
    return {
      base: fillGalleryGaps(ones, 2),
      sm: fillGalleryGaps(ones, 3),
      lg: fillGalleryGaps(
        filtered.map((item) => DESKTOP_SPANS[item.size as string] ?? ONE),
        4,
      ),
    };
  }, [filtered]);

  /* ------------------------------------------------------------------------ */
  /* RESET INVALID FILTER                                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (active !== "all" && (counts.get(active) ?? 0) === 0) {
      setActive("all");
      setLightboxIndex(null);
    }
  }, [active, counts]);

  /* ------------------------------------------------------------------------ */
  /* EMPTY STATE                                                              */
  /* ------------------------------------------------------------------------ */

  if (!items.length) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* FILTER CHANGE                                                            */
  /* ------------------------------------------------------------------------ */

  const changeFilter = (filterId: string) => {
    setActive(filterId);
    setLightboxIndex(null);
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <MotionConfig reducedMotion="user">
      {/* ==================================================================== */}
      {/* FILTER                                                               */}
      {/* ==================================================================== */}

      {/* Chips are only useful with at least two real categories. */}
      {withFilters && visibleFilters.length > 2 && (
        <div
          role="group"
          aria-label="تصنيف الصور"
          className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:mt-7 sm:flex-wrap sm:px-0"
        >
          {visibleFilters.map((filter) => {
            const isActive = active === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => changeFilter(filter.id)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-purple text-white shadow-sm"
                    : "bg-white text-brand-ink/75 ring-1 ring-brand-purple/10 hover:bg-brand-purple-tint hover:text-brand-ink"
                }`}
              >
                {filter.label}
                <span
                  className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-brand-purple/[0.06] text-brand-ink/70"
                  }`}
                >
                  {counts.get(filter.id) ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* GALLERY                                                              */}
      {/* ==================================================================== */}

      {/* Announce the new result count to screen readers after filtering. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {withFilters && visibleFilters.length > 2
          ? `${activeFilter?.label ?? ""}: ${arabicCount(filtered.length, PHOTO_FORMS)}`
          : ""}
      </p>

      {filtered.length > 0 && (
        <section
          aria-label={activeFilter?.label ?? "معرض الصور"}
          className="
              mx-auto
              mt-5
              w-full
              max-w-[1500px]
              sm:mt-7
            "
        >
          {/* Dense packing: smaller tiles fill the holes the 2x2 / 2x1 tiles leave
              on desktop (reading and tab order still follow the list). */}
          <div
            className="
                grid
                grid-cols-2
                gap-2
                sm:grid-cols-3
                sm:gap-3
                lg:grid-flow-dense
                lg:auto-rows-[190px]
                lg:grid-cols-4
                lg:gap-4
                xl:auto-rows-[220px]
                2xl:auto-rows-[235px]
              "
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.985,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.025, 0.15),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`
                      group
                      min-w-0
                      min-h-0
                      overflow-hidden
                      rounded-xl
                      sm:rounded-2xl
                      ${BASE_COL_SPAN[layout.base[index]?.col ?? 1]}
                      ${SM_COL_SPAN[layout.sm[index]?.col ?? 1]}
                      ${LG_COL_SPAN[layout.lg[index]?.col ?? 1]}
                      ${LG_ROW_SPAN[layout.lg[index]?.row ?? 1]}
                    `}
                >
                  <GalleryCard
                    item={item}
                    onClick={() => setLightboxIndex(index)}
                    aspectClassName={`${BASE_ASPECT[layout.base[index]?.col ?? 1]} ${SM_ASPECT[layout.sm[index]?.col ?? 1]} lg:aspect-auto`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* LIGHTBOX                                                             */}
      {/* ==================================================================== */}

      <GalleryLightbox
        items={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </MotionConfig>
  );
}
