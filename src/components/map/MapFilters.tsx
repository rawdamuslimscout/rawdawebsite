"use client";

import { useEffect, useRef } from "react";
import type { MapFilterKey } from "@/data/map";
import { FILTERS, formatNumber, placesCountLabel } from "./categories";

export default function MapFilters({
  value,
  counts,
  onChange,
}: {
  value: MapFilterKey;
  counts: Record<MapFilterKey, number>;
  onChange: (key: MapFilterKey) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Phones: the row scrolls sideways. When the filter changes from elsewhere
  // (e.g. «عرض كل الأماكن»), slide the active chip back into view — horizontally
  // only, so the page itself never jumps.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const row = rowRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
    const rowBox = row.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let delta = 0;
    if (chipBox.left < rowBox.left) delta = chipBox.left - rowBox.left - 20;
    else if (chipBox.right > rowBox.right) delta = chipBox.right - rowBox.right + 20;
    if (delta) row.scrollBy({ left: delta, behavior: reduce ? "auto" : "smooth" });
  }, [value]);

  return (
    <div
      ref={rowRef}
      role="group"
      aria-label="تصفية الأماكن حسب النوع"
      // scrolls sideways on narrow phones instead of wrapping into several rows;
      // the vertical padding leaves room for the focus ring inside the scroller
      className="no-scrollbar -mx-5 -my-1 flex gap-2 overflow-x-auto overscroll-x-contain px-5 py-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {FILTERS.map(({ key, label }) => {
        const active = value === key;
        const empty = counts[key] === 0;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(key)}
            className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-5 text-sm font-bold transition-colors ${
              active
                ? "border-brand-purple bg-brand-purple text-white"
                : `border-brand-purple/15 bg-white hover:border-brand-purple/40 hover:text-brand-purple ${
                    empty ? "text-brand-ink/45" : "text-brand-ink/75"
                  }`
            }`}
          >
            {label}
            <span
              aria-hidden="true"
              className={`rounded-full px-2 py-0.5 text-xs ${
                active ? "bg-white/20 text-white" : "bg-brand-purple/[0.07] text-brand-ink/55"
              }`}
            >
              {formatNumber(counts[key])}
            </span>
            <span className="sr-only">({placesCountLabel(counts[key])})</span>
          </button>
        );
      })}
    </div>
  );
}
