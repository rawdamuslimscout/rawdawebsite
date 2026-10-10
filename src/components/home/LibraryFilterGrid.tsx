"use client";

import { useState } from "react";
import ResourceCard from "@/components/ui/ResourceCard";
import SharePdfButton from "@/components/ui/SharePdfButton";
import { libraryFilters, type LibraryResource } from "@/data/content";

export default function LibraryFilterGrid({
  resources,
}: {
  resources: LibraryResource[];
}) {
  const [active, setActive] = useState<string>("all");

  const filtered =
    active === "all"
      ? resources
      : resources.filter((resource) => resource.category === active);

  return (
    <>
      {/* <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {libraryFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActive(filter.id)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              active === filter.id
                ? "bg-brand-purple text-white"
                : "bg-white text-brand-ink/70 ring-1 ring-brand-purple/10 hover:bg-brand-purple-tint"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-brand-ink/60">
          لا توجد ملفات في هذا التصنيف بعد.
        </p>
      ) : ( */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {filtered.map((resource) => (
          <div key={resource.id} className="flex flex-col gap-2">
            <ResourceCard resource={resource} />
          </div>
        ))}
      </div>
      {/* )} */}
    </>
  );
}
