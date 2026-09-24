"use client";

import { useState } from "react";
import GalleryCard from "@/components/ui/GalleryCard";
import { galleryFilters, type GalleryItem } from "@/data/content";

export default function GalleryFilterGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<string>("all");

  const filtered = active === "all" ? items : items.filter((g) => g.category === active);

  return (
    <>
      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto">
        {galleryFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActive(f.id)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              active === f.id
                ? "bg-brand-purple text-white"
                : "bg-white text-brand-ink/70 ring-1 ring-brand-purple/10 hover:bg-brand-purple-tint"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid auto-rows-[180px] grid-cols-2 gap-4 sm:auto-rows-[220px] sm:grid-cols-4">
        {filtered.map((item) => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
