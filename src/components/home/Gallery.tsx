"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import GalleryCard from "@/components/ui/GalleryCard";
import { galleryItems, galleryFilters } from "@/data/content";

export default function Gallery() {
  const [active, setActive] = useState<string>("all");

  const filtered =
    active === "all" ? galleryItems : galleryItems.filter((g) => g.category === active);

  return (
    <section id="gallery" className="bg-brand-cream py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          title="معرض الصور"
          subtitle="لحظات من رحلاتنا ومخيماتنا وأنشطتنا الكشفية."
        />

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
      </div>
    </section>
  );
}
