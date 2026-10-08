"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";

import GalleryCard from "@/components/ui/GalleryCard";
import GalleryLightbox from "@/components/ui/GalleryLightbox";
import { galleryFilters, type GalleryItem } from "@/data/content";

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
const DESKTOP_SPANS: Record<string, string> = {
  large: "lg:col-span-2 lg:row-span-2",
  medium: "lg:col-span-2 lg:row-span-1",
  small: "lg:col-span-1 lg:row-span-1",

  lg: "lg:col-span-2 lg:row-span-2",
  wide: "lg:col-span-2 lg:row-span-1",
  tall: "lg:col-span-1 lg:row-span-2",
  sm: "lg:col-span-1 lg:row-span-1",
};

export default function GalleryFilterGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  const activeCount = counts.get(active) ?? 0;

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
  /* CLOSE DROPDOWN                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFilterOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
    setFilterOpen(false);
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      {/* ==================================================================== */}
      {/* FILTER                                                               */}
      {/* ==================================================================== */}

      {visibleFilters.length > 1 && (
        <div
          ref={dropdownRef}
          className="relative z-30  mt-5 max-w-[300px] sm:mt-7"
        >
          {/* ---------------------------------------------------------------- */}
          {/* FILTER TRIGGER                                                   */}
          {/* ---------------------------------------------------------------- */}

          <motion.button
            ref={triggerRef}
            type="button"
            onClick={() => setFilterOpen((current) => !current)}
            aria-expanded={filterOpen}
            aria-haspopup="listbox"
            whileTap={{ scale: 0.985 }}
            className="
              group
              flex
              min-h-[48px]
              w-full
              items-center
              justify-between
              rounded-xl
              border
              border-brand-purple/[0.10]
              bg-white
              px-3
              shadow-[0_4px_20px_rgba(53,30,88,0.045)]
              transition
              duration-200
              hover:border-brand-purple/[0.18]
              hover:shadow-[0_7px_24px_rgba(53,30,88,0.07)]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-brand-purple/20
              sm:min-h-[50px]
              sm:rounded-2xl
              sm:px-3.5
            "
          >
            {/* Left */}
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-brand-purple/[0.065]
                  text-brand-purple
                  transition
                  group-hover:bg-brand-purple/[0.09]
                "
              >
                <SlidersHorizontal size={15} strokeWidth={2} />
              </span>

              <span className="min-w-0 text-right">
                <span
                  className="
                    block
                    text-[9px]
                    font-medium
                    leading-none
                    text-brand-ink/35
                  "
                >
                  تصنيف الصور
                </span>

                <span
                  className="
                    mt-1
                    block
                    truncate
                    text-[13px]
                    font-bold
                    leading-none
                    text-brand-ink
                    sm:text-sm
                  "
                >
                  {activeFilter?.label}
                </span>
              </span>
            </span>

            {/* Right */}
            <span className="flex shrink-0 items-center gap-1.5">
              <span
                className="
                  min-w-[22px]
                  rounded-md
                  bg-brand-purple/[0.065]
                  px-1.5
                  py-1
                  text-center
                  text-[9px]
                  font-bold
                  text-brand-purple
                "
              >
                {activeCount}
              </span>

              <motion.span
                animate={{
                  rotate: filterOpen ? 180 : 0,
                }}
                transition={{ duration: 0.18 }}
                className="text-brand-ink/35"
              >
                <ChevronDown size={16} />
              </motion.span>
            </span>
          </motion.button>

          {/* ---------------------------------------------------------------- */}
          {/* FILTER MENU                                                       */}
          {/* ---------------------------------------------------------------- */}

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -5,
                  scale: 0.985,
                }}
                animate={{
                  opacity: 1,
                  y: 6,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -4,
                  scale: 0.985,
                }}
                transition={{
                  duration: 0.16,
                  ease: [0.22, 1, 0.36, 1],
                }}
                role="listbox"
                aria-label="تصنيف الصور"
                className="
                  absolute
                  left-0
                  right-0
                  top-full
                  overflow-hidden
                  rounded-xl
                  border
                  border-brand-purple/[0.10]
                  bg-white
                  p-1
                  shadow-[0_18px_45px_rgba(53,30,88,0.13)]
                  sm:rounded-2xl
                "
              >
                {visibleFilters.map((filter) => {
                  const isActive = active === filter.id;

                  const count = counts.get(filter.id) ?? 0;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => changeFilter(filter.id)}
                      className={`
                        flex
                        min-h-[43px]
                        w-full
                        items-center
                        justify-between
                        rounded-lg
                        px-3
                        text-right
                        transition
                        duration-150
                        sm:min-h-[45px]
                        sm:rounded-xl
                        ${
                          isActive
                            ? "bg-brand-purple/[0.065] text-brand-purple"
                            : "text-brand-ink/65 hover:bg-brand-purple/[0.035] hover:text-brand-ink"
                        }
                      `}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`
                            flex
                            h-[18px]
                            w-[18px]
                            items-center
                            justify-center
                            rounded-full
                            border
                            ${
                              isActive
                                ? "border-brand-purple bg-brand-purple text-white"
                                : "border-brand-ink/15"
                            }
                          `}
                        >
                          {isActive && <Check size={10} strokeWidth={3} />}
                        </span>

                        <span className="text-[13px] font-semibold">
                          {filter.label}
                        </span>
                      </span>

                      <span
                        className={`
                          min-w-[23px]
                          rounded-md
                          px-1.5
                          py-1
                          text-center
                          text-[9px]
                          font-bold
                          ${
                            isActive
                              ? "bg-brand-purple text-white"
                              : "bg-brand-purple/[0.05] text-brand-ink/40"
                          }
                        `}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ==================================================================== */}
      {/* GALLERY                                                              */}
      {/* ==================================================================== */}

      <AnimatePresence mode="wait">
        {filtered.length > 0 && (
          <motion.section
            key={active}
            aria-label={activeFilter?.label ?? "معرض الصور"}
            initial={{
              opacity: 0,
              y: 7,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -5,
            }}
            transition={{
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mx-auto
              mt-5
              w-full
              max-w-[1500px]
              sm:mt-7
            "
          >
            <div
              className="
                grid
                grid-cols-2
                gap-2
                sm:grid-cols-3
                sm:gap-3
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
                      ${DESKTOP_SPANS[item.size as string] ?? ""}
                    `}
                  >
                    <GalleryCard
                      item={item}
                      onClick={() => setLightboxIndex(index)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* LIGHTBOX                                                             */}
      {/* ==================================================================== */}

      <GalleryLightbox
        items={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
