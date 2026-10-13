"use client";

import { useEffect, useMemo, useState } from "react";

import FeedCard, { type FeedItem } from "@/components/news/FeedCard";
import { arabicCount, ITEM_FORMS } from "@/components/news/format";
import { newsFilters } from "@/data/content";

type FilterId = (typeof newsFilters)[number]["id"];

/** Keep the filter in the URL (?type=news|blog) so it can be shared. */
function syncUrl(filter: FilterId) {
  const url = new URL(window.location.href);
  if (filter === "all") url.searchParams.delete("type");
  else url.searchParams.set("type", filter);
  window.history.replaceState(window.history.state, "", url);
}

export default function NewsFeed({ items }: { items: FeedItem[] }) {
  const [active, setActive] = useState<FilterId>("all");

  const counts = useMemo(() => {
    const map = new Map<string, number>([["all", items.length]]);
    for (const item of items) map.set(item.kind, (map.get(item.kind) ?? 0) + 1);
    return map;
  }, [items]);

  // Only offer kinds that have something published.
  const visibleFilters = newsFilters.filter(
    (f) => f.id === "all" || (counts.get(f.id) ?? 0) > 0,
  );
  const showFilters = visibleFilters.length > 2;

  // Restore ?type= after hydration.
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get("type");
    if (type && newsFilters.some((f) => f.id === type) && (counts.get(type) ?? 0) > 0) {
      setActive(type as FilterId);
    }
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered =
    active === "all" ? items : items.filter((item) => item.kind === active);

  const choose = (id: FilterId) => {
    setActive(id);
    syncUrl(id);
  };

  return (
    <>
      {showFilters && (
        <div
          role="group"
          aria-label="نوع المحتوى"
          className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {visibleFilters.map((filter) => {
            const isActive = active === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => choose(filter.id)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-purple text-white shadow-sm"
                    : "bg-white text-brand-ink/75 ring-1 ring-brand-purple/10 hover:bg-brand-purple-tint hover:text-brand-ink"
                }`}
              >
                {filter.label}
                <span
                  className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-brand-purple/[0.06] text-brand-ink/70"
                  }`}
                >
                  {counts.get(filter.id) ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {active === "all" ? "" : arabicCount(filtered.length, ITEM_FORMS)}
      </p>

      <ul
        className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
          showFilters ? "mt-6" : ""
        }`}
      >
        {filtered.map((item) => (
          <li key={item.key}>
            <FeedCard item={item} />
          </li>
        ))}
      </ul>
    </>
  );
}
