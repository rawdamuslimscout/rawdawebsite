"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GalleryCard from "@/components/ui/GalleryCard";
import GalleryLightbox from "@/components/ui/GalleryLightbox";
import { galleryFilters, type GalleryItem } from "@/data/content";

// Adjust these keys to match whatever your GalleryItem["size"] union
// actually contains — anything not listed here just falls back to a
// plain 1x1 cell, so this degrades safely either way.P

const SPAN_MAP: Record<string, string> = {
  lg: "col-span-2 row-span-2",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
  sm: "col-span-1 row-span-1",
};

export default function GalleryFilterGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filters = useMemo(
    () => [{ id: "all", label: "الكل" }, ...galleryFilters],
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

  const filtered = useMemo(
    () =>
      active === "all" ? items : items.filter((g) => g.category === active),
    [items, active],
  );

  return (
    <>
      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => {
          const isActive = active === f.id;
          const count = counts.get(f.id) ?? 0;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActive(f.id)}
              disabled={count === 0 && f.id !== "all"}
              className={`relative shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isActive
                  ? "text-white"
                  : "text-brand-ink/70 ring-1 ring-brand-purple/10 hover:bg-brand-purple-tint"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="gallery-filter-pill"
                  className="absolute inset-0 rounded-full bg-brand-purple"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {f.label}
                <span
                  className={isActive ? "text-white/70" : "text-brand-ink/35"}
                >
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-1.5 text-center">
          <p className="font-display text-lg font-bold text-brand-ink">
            ما في صور بهالقسم بعد
          </p>
          <p className="text-sm text-brand-ink/50">
            جرّب قسمًا آخر أو ارجع لـ «الكل»
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="mt-8 grid auto-rows-[180px] grid-cols-2 gap-4 sm:auto-rows-[220px] sm:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25 }}
                className={
                  SPAN_MAP[item.size as string] ?? "col-span-1 row-span-1"
                }
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

      <GalleryLightbox
        items={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
