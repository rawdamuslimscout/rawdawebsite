"use client";

import type { MapFilterKey } from "@/data/map";
import { FILTERS, formatNumber } from "./categories";

export default function MapFilters({
  value,
  counts,
  onChange,
}: {
  value: MapFilterKey;
  counts: Record<MapFilterKey, number>;
  onChange: (key: MapFilterKey) => void;
}) {
  return (
    <div
      role="group"
      aria-label="تصفية الأماكن حسب النوع"
      // scrolls sideways on narrow phones instead of wrapping into several rows
      className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {FILTERS.map(({ key, label }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(key)}
            className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-5 text-sm font-bold transition-colors ${
              active
                ? "border-brand-purple bg-brand-purple text-white"
                : "border-brand-purple/15 bg-white text-brand-ink/75 hover:border-brand-purple/40 hover:text-brand-purple"
            }`}
          >
            {label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                active ? "bg-white/20 text-white" : "bg-brand-purple/[0.07] text-brand-ink/55"
              }`}
            >
              {formatNumber(counts[key])}
            </span>
          </button>
        );
      })}
    </div>
  );
}
