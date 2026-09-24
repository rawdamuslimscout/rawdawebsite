"use client";

import { useState } from "react";
import ResourceCard from "@/components/ui/ResourceCard";
import { libraryFilters, type LibraryResource } from "@/data/content";

export default function LibraryFilterGrid({ resources }: { resources: LibraryResource[] }) {
  const [active, setActive] = useState<string>("all");

  const filtered =
    active === "all" ? resources : resources.filter((r) => r.category === active);

  return (
    <>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {libraryFilters.map((f) => (
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

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-brand-ink/60">لا توجد ملفات في هذا التصنيف بعد.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </>
  );
}
