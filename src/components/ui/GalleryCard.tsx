"use client";

/* eslint-disable @next/next/no-img-element */

import type { GalleryItem } from "@/data/content";

export default function GalleryCard({
  item,
  onClick,
}: {
  item: GalleryItem;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`فتح صورة: ${item.title}`}
      className="group relative h-full w-full overflow-hidden rounded-2xl bg-brand-purple-tint text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        loading="lazy"
        className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-2 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <p className="truncate text-sm font-bold text-white">{item.title}</p>
        <span
          aria-hidden="true"
          className="shrink-0 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm"
        >
          فتح
        </span>
      </div>
    </button>
  );
}
