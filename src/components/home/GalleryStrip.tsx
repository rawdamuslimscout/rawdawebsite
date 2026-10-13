"use client";

import { useState } from "react";

import GalleryCard from "@/components/ui/GalleryCard";
import GalleryLightbox from "@/components/ui/GalleryLightbox";
import type { GalleryItem } from "@/data/content";

/** Homepage photo strip: one row on tablets and desktop, 2x2 on phones; opens the shared lightbox. */
export default function GalleryStrip({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  if (!items.length) return null;

  return (
    <>
      <ul className="mt-8 grid grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-4 sm:gap-3 lg:gap-4">
        {items.map((item, i) => (
          <li key={item.id} className="min-w-0 overflow-hidden rounded-xl sm:rounded-2xl">
            <GalleryCard
              item={{ ...item, size: "small" }}
              onClick={() => setIndex(i)}
              aspectClassName="aspect-[4/3]"
            />
          </li>
        ))}
      </ul>
      <GalleryLightbox items={items} index={index} onClose={() => setIndex(null)} onNavigate={setIndex} />
    </>
  );
}
