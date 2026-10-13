"use client";

import { ImageIcon } from "lucide-react";

import SafeImage from "@/components/ui/SafeImage";
import type { GalleryItem } from "@/data/content";

// Mirrors GalleryFilterGrid: 2 cols on phones, 3 on tablets, 4 on desktop,
// where every size except "small" spans two columns.
const SMALL_TILE = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";
const WIDE_TILE = "(min-width: 1024px) 50vw, (min-width: 640px) 33vw, 50vw";

export default function GalleryCard({
  item,
  onClick,
  priority = false,
  aspectClassName = "aspect-[4/3] lg:aspect-auto",
}: {
  item: GalleryItem;
  onClick?: () => void;
  /** Only for an image that is visible without scrolling (e.g. an article's lead photo). */
  priority?: boolean;
  /** The tile's ratio; grids with fixed desktop rows switch to lg:aspect-auto. */
  aspectClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`فتح صورة: ${item.title}`}
      className={`group relative block h-full w-full overflow-hidden rounded-2xl bg-brand-purple-tint text-right focus-visible:outline-none ${aspectClassName}`}
    >
      <SafeImage
        src={item.imageUrl}
        alt={item.title}
        sizes={item.size === "small" ? SMALL_TILE : WIDE_TILE}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
        fallback={
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center text-brand-purple/35">
            <ImageIcon className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only">الصورة غير متاحة: {item.title}</span>
          </span>
        }
      />
      {/* Caption: on hover/focus with a mouse; always shown on touch screens, which have no hover. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-2 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
        <p className="truncate text-sm font-bold text-white">{item.title}</p>
        <span
          aria-hidden="true"
          className="shrink-0 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm"
        >
          فتح
        </span>
      </div>
      {/* Focus ring drawn inside the tile: the grid cell clips anything outside. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-inset ring-brand-yellow group-focus-visible:ring-4"
      />
    </button>
  );
}
