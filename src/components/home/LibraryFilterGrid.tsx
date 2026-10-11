"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderOpen, RotateCcw, Search, SearchX, X } from "lucide-react";
import ResourceCard from "@/components/ui/ResourceCard";
import { libraryFilters, type LibraryResource } from "@/data/content";

/** Show the search box only once the library is big enough to need it. */
const SEARCH_THRESHOLD = 6;

/**
 * Loose Arabic matching: ignore diacritics and tatweel, and treat the
 * common spelling variants (أ/إ/آ/ا, ة/ه, ى/ي) as the same letter.
 */
function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

/** Keep the filter in the URL so it survives reloads and can be shared. */
function syncUrl(category: string, query: string) {
  const url = new URL(window.location.href);
  if (category === "all") url.searchParams.delete("category");
  else url.searchParams.set("category", category);
  if (query.trim()) url.searchParams.set("q", query.trim());
  else url.searchParams.delete("q");
  window.history.replaceState(window.history.state, "", url);
}

export default function LibraryFilterGrid({
  resources,
}: {
  resources: LibraryResource[];
}) {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map = new Map<string, number>([["all", resources.length]]);
    for (const resource of resources) {
      map.set(resource.category, (map.get(resource.category) ?? 0) + 1);
    }
    return map;
  }, [resources]);

  // Only offer categories that actually have files.
  const visibleFilters = useMemo(
    () =>
      libraryFilters.filter(
        (filter) => filter.id === "all" || (counts.get(filter.id) ?? 0) > 0,
      ),
    [counts],
  );

  // Restore the filter from the URL (?category=…&q=…) after hydration.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const q = params.get("q");
    if (category && (counts.get(category) ?? 0) > 0) setActive(category);
    if (q) setQuery(q);
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showFilters = visibleFilters.length > 2;
  const showSearch = resources.length > SEARCH_THRESHOLD;

  const filtered = useMemo(() => {
    const q = normalize(query);
    return resources.filter((resource) => {
      if (active !== "all" && resource.category !== active) return false;
      if (!q) return true;
      return normalize(`${resource.title} ${resource.description}`).includes(q);
    });
  }, [resources, active, query]);

  const changeFilter = (id: string) => {
    setActive(id);
    syncUrl(id, query);
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    syncUrl(active, value);
  };

  const reset = () => {
    setActive("all");
    setQuery("");
    syncUrl("all", "");
  };

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-brand-purple/15 bg-white/60 px-6 py-14 text-center">
        <FolderOpen
          className="h-10 w-10 text-brand-purple/30"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="mt-4 text-base font-semibold text-brand-ink/70">
          لا توجد ملفات في المكتبة بعد.
        </p>
      </div>
    );
  }

  const isFiltered = active !== "all" || query.trim() !== "";

  return (
    <>
      {(showFilters || showSearch) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {showFilters && (
            <div
              role="group"
              aria-label="تصنيف الملفات"
              className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {visibleFilters.map((filter) => {
                const isActive = active === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => changeFilter(filter.id)}
                    className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-brand-purple text-white shadow-sm"
                        : "bg-white text-brand-ink/70 ring-1 ring-brand-purple/10 hover:bg-brand-purple-tint hover:text-brand-ink"
                    }`}
                  >
                    {filter.label}
                    <span
                      className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-brand-purple/[0.06] text-brand-ink/50"
                      }`}
                    >
                      {counts.get(filter.id) ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {showSearch && (
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => changeQuery(event.target.value)}
                placeholder="ابحث في المكتبة…"
                aria-label="ابحث في ملفات المكتبة"
                enterKeyHint="search"
                className="min-h-11 w-full rounded-full border border-brand-purple/10 bg-white py-2 pe-10 ps-10 text-sm text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-purple/30 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => changeQuery("")}
                  aria-label="مسح البحث"
                  className="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-brand-ink/45 transition-colors hover:bg-brand-purple-tint hover:text-brand-ink"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Result count for screen readers after each filter / search change. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {isFiltered ? `عدد الملفات المطابقة: ${filtered.length}` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-brand-purple/15 bg-white/60 px-6 py-12 text-center">
          <SearchX
            className="h-10 w-10 text-brand-purple/30"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="mt-4 text-base font-semibold text-brand-ink/70">
            {query.trim()
              ? "لا توجد ملفات مطابقة لبحثك."
              : "لا توجد ملفات في هذا التصنيف بعد."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-purple px-5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            عرض كل الملفات
          </button>
        </div>
      ) : (
        <div
          className={`grid gap-4 sm:grid-cols-2 ${
            showFilters || showSearch ? "mt-6" : ""
          }`}
        >
          {filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </>
  );
}
