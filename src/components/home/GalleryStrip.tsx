"use client";

import { useState } from "react";

import GalleryCard from "@/components/ui/GalleryCard";
import GalleryLightbox from "@/components/ui/GalleryLightbox";
import type { GalleryItem } from "@/data/content";

/** Homepage photo grid: three across on tablets and desktop, two on phones; opens the shared lightbox. */
export default function GalleryStrip({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  if (!items.length) return null;

  return (
    <>
      <ul className="mt-8 grid grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-3 sm:gap-3 lg:gap-4">
        {items.map((item, i) => (
          <li
            key={item.id}
            // Odd count: the first photo spans the phone's two columns so no tile sits alone.
            className={`min-w-0 overflow-hidden rounded-xl sm:rounded-2xl ${
              items.length % 2 === 1 && i === 0 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
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
