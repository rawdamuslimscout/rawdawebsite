"use client";

import { useState } from "react";

import GalleryCard from "@/components/ui/GalleryCard";
import GalleryLightbox from "@/components/ui/GalleryLightbox";
import type { GalleryItem } from "@/data/content";

/**
 * A news item's photos: the first one large, the rest in a grid; any photo
 * opens the shared lightbox.
 */
export default function NewsImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState<number | null>(null);

  const items: GalleryItem[] = images.map((url, i) => ({
    id: `${i}-${url}`,
    title:
      images.length > 1 ? `${title} (${i + 1} من ${images.length})` : title,
    category: "events",
    // "large" asks GalleryCard for wide-tile sizes (full width here).
    size: i === 0 ? "large" : "small",
    imageUrl: url,
  }));

  if (!items.length) return null;
  const [first, ...rest] = items;

  return (
    <>
      {/* Fixed ratios: GalleryCard fills its box (it drops its own ratio at lg). */}
      <div className="aspect-[16/10] overflow-hidden rounded-2xl shadow-soft">
        {/* The lead photo sits above the fold on the article page: load it first. */}
        <GalleryCard item={first} onClick={() => setIndex(0)} priority />
      </div>

      {rest.length > 0 && (
        <ul
          aria-label="صور الخبر"
          className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3"
        >
          {rest.map((item, i) => (
            <li
              key={item.id}
              className="aspect-[4/3] overflow-hidden rounded-xl sm:rounded-2xl"
            >
              <GalleryCard item={item} onClick={() => setIndex(i + 1)} />
            </li>
          ))}
        </ul>
      )}

      <GalleryLightbox
        items={items}
        index={index}
        onClose={() => setIndex(null)}
        onNavigate={setIndex}
      />
    </>
  );
}
