"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";

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
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const activeFilter =
    visibleFilters.find((filter) => filter.id === active) ?? visibleFilters[0];

  useEffect(() => {
    if (active !== "all" && (counts.get(active) ?? 0) === 0) {
      setActive("all");
      setLightboxIndex(null);
    }
  }, [active, counts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!items.length) {
    return null;
  }

  const changeFilter = (filterId: string) => {
    setActive(filterId);
    setLightboxIndex(null);
    setOpen(false);
  };

  return (
    <>
      {/* =========================================================
          FILTER DROPDOWN
      ========================================================== */}

      {visibleFilters.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-8 sm:mt-10"
        >
          <div ref={dropdownRef} className="relative mx-auto w-full max-w-xs">
            {/* Trigger */}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-haspopup="listbox"
              className="
                flex
                w-full
                items-center
                justify-between
                gap-3
                rounded-2xl
                border
                border-brand-purple/10
                bg-white
                px-4
                py-3
                text-right
                shadow-[0_6px_24px_rgba(53,30,88,0.06)]
                outline-none
                transition-all
                duration-200
                hover:border-brand-purple/20
                hover:shadow-[0_8px_28px_rgba(53,30,88,0.09)]
                focus-visible:ring-2
                focus-visible:ring-brand-purple/20
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-brand-purple/[0.07]
                    text-brand-purple
                  "
                >
                  <SlidersHorizontal size={17} strokeWidth={2} />
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-medium text-brand-ink/40">
                    تصنيف الصور
                  </span>

                  <span className="text-sm font-bold text-brand-ink">
                    {activeFilter?.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="
                    flex
                    min-w-[24px]
                    items-center
                    justify-center
                    rounded-md
                    bg-brand-purple/[0.07]
                    px-1.5
                    py-1
                    text-[10px]
                    font-bold
                    text-brand-purple
                  "
                >
                  {counts.get(active) ?? 0}
                </span>

                <motion.div
                  animate={{
                    rotate: open ? 180 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-brand-ink/40"
                >
                  <ChevronDown size={18} />
                </motion.div>
              </div>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 6,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -5,
                    scale: 0.98,
                  }}
                  transition={{
                    duration: 0.18,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    absolute
                    inset-x-0
                    top-full
                    z-50
                    overflow-hidden
                    rounded-2xl
                    border
                    border-brand-purple/10
                    bg-white
                    p-1.5
                    shadow-[0_16px_45px_rgba(53,30,88,0.12)]
                  "
                  role="listbox"
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
                          w-full
                          items-center
                          justify-between
                          rounded-xl
                          px-3.5
                          py-3
                          text-right
                          transition-colors
                          duration-150
                          ${
                            isActive
                              ? "bg-brand-purple/[0.07] text-brand-purple"
                              : "text-brand-ink/65 hover:bg-brand-purple/[0.04] hover:text-brand-ink"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`
                              flex
                              h-5
                              w-5
                              items-center
                              justify-center
                              rounded-full
                              border
                              transition-all
                              ${
                                isActive
                                  ? "border-brand-purple bg-brand-purple text-white"
                                  : "border-brand-ink/15 text-transparent"
                              }
                            `}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>

                          <span className="text-sm font-semibold">
                            {filter.label}
                          </span>
                        </div>

                        <span
                          className={`
                            min-w-[25px]
                            rounded-md
                            px-1.5
                            py-1
                            text-center
                            text-[10px]
                            font-bold
                            ${
                              isActive
                                ? "bg-brand-purple text-white"
                                : "bg-brand-purple/[0.06] text-brand-ink/40"
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
        </motion.div>
      )}

      {/* =========================================================
          GALLERY
      ========================================================== */}

      <AnimatePresence mode="wait">
        {filtered.length > 0 && (
          <motion.div
            key={active}
            initial={{
              opacity: 0,
              y: 8,
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
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mt-8
              grid
              grid-flow-dense
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
                    y: 18,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.97,
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

      {/* =========================================================
          LIGHTBOX
      ========================================================== */}

      <GalleryLightbox
        items={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
