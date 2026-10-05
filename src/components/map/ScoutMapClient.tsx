"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPinOff, SearchX } from "lucide-react";
import NewsModal from "@/components/ui/NewsModal";
import {
  FILTER_CATEGORIES,
  type MapFilterKey,
  type MapPlace,
} from "@/data/map";
import MapFilters from "./MapFilters";
import MapActivityCard from "./MapActivityCard";
import MapActivityList from "./MapActivityList";
import MapSkeleton from "./MapSkeleton";
import { placesCountLabel } from "./categories";

// Leaflet (and its CSS) live in their own chunk, fetched only when the map is about to be seen.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function ScoutMapClient({ places }: { places: MapPlace[] }) {
  const [filter, setFilter] = useState<MapFilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openNewsFor, setOpenNewsFor] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  const mapBoxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<string | null>(null);

  const counts = useMemo(() => {
    const result = {} as Record<MapFilterKey, number>;
    (Object.keys(FILTER_CATEGORIES) as MapFilterKey[]).forEach((key) => {
      const allowed = FILTER_CATEGORIES[key];
      result[key] = places.filter((p) => allowed.includes(p.category)).length;
    });
    return result;
  }, [places]);

  const filtered = useMemo(() => {
    const allowed = FILTER_CATEGORIES[filter];
    return places.filter((p) => allowed.includes(p.category));
  }, [places, filter]);

  // a selected place that the current filter hides is treated as not selected
  const selected = useMemo(
    () => filtered.find((p) => p.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  // ---- load the map only when the section is near the viewport ----
  useEffect(() => {
    const el = mapBoxRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setMapVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const select = useCallback((id: string) => {
    lastSelectedRef.current = id;
    setSelectedId(id);
  }, []);

  const back = useCallback(() => setSelectedId(null), []);

  // after a selection: bring the card into view on small screens and move focus to it
  useEffect(() => {
    if (!selected) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.innerWidth < 1024) {
      cardRef.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [selected]);

  // when the card closes, return focus to the list item that opened it
  const wasSelectedRef = useRef(false);
  useEffect(() => {
    if (wasSelectedRef.current && !selected && lastSelectedRef.current) {
      const id = lastSelectedRef.current;
      listRef.current
        ?.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(id)}"]`)
        ?.focus({ preventScroll: false });
    }
    wasSelectedRef.current = !!selected;
  }, [selected]);

  const changeFilter = (key: MapFilterKey) => {
    setFilter(key);
    setSelectedId(null);
  };

  const newsPlace = places.find((p) => p.id === openNewsFor);

  return (
    <div className="mt-8 sm:mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MapFilters value={filter} counts={counts} onChange={changeFilter} />
        <p role="status" aria-live="polite" className="shrink-0 text-sm font-semibold text-brand-ink/55">
          {placesCountLabel(filtered.length)}
        </p>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-6">
        {/* ---- the map ---- */}
        <div className="lg:col-span-8">
          <div
            ref={mapBoxRef}
            className="relative h-[340px] overflow-hidden rounded-2xl border border-brand-purple/10 bg-brand-purple-tint shadow-soft sm:h-[420px] lg:h-[540px]"
          >
            {mapFailed ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <MapPinOff className="h-8 w-8 text-brand-purple/60" aria-hidden="true" />
                <p className="max-w-xs text-sm leading-7 text-brand-ink/70">
                  تعذّر عرض الخريطة الآن. يمكنك الاطّلاع على كل الأماكن من القائمة بجانبها.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <SearchX className="h-8 w-8 text-brand-purple/60" aria-hidden="true" />
                <p className="text-sm font-semibold text-brand-ink/70">لا توجد أماكن من هذا النوع بعد.</p>
                <button
                  type="button"
                  onClick={() => changeFilter("all")}
                  className="btn border border-brand-purple/20 bg-white text-brand-purple hover:bg-brand-purple-tint"
                >
                  عرض كل الأماكن
                </button>
              </div>
            ) : mapVisible ? (
              <LeafletMap
                places={filtered}
                selectedId={selected?.id ?? null}
                onSelect={select}
                onFailed={() => setMapFailed(true)}
              />
            ) : (
              <MapSkeleton label="تُحمَّل الخريطة عند الاقتراب منها…" />
            )}
          </div>
        </div>

        {/* ---- card / list ---- */}
        <div
          className="lg:col-span-4"
          onKeyDown={(e) => {
            if (e.key === "Escape" && selected) back();
          }}
        >
          {selected ? (
            <div ref={cardRef} className="scroll-mt-24 lg:max-h-[540px] lg:overflow-y-auto">
              <MapActivityCard
                ref={headingRef}
                place={selected}
                onBack={back}
                onOpenDetails={() => setOpenNewsFor(selected.id)}
              />
            </div>
          ) : (
            <div
              ref={listRef}
              className="rounded-2xl border border-brand-purple/10 bg-white p-4 shadow-soft sm:p-5 lg:max-h-[540px] lg:overflow-y-auto"
            >
              <h3 className="font-display text-lg font-bold text-brand-ink">قائمة الأماكن</h3>
              <p className="mt-1 text-sm leading-6 text-brand-ink/55">
                اختر مكانًا من القائمة أو اضغط على علامته في الخريطة.
              </p>
              {filtered.length > 0 ? (
                <div className="mt-3">
                  <MapActivityList places={filtered} selectedId={null} onSelect={select} />
                </div>
              ) : (
                <p className="mt-4 text-sm text-brand-ink/60">لا توجد أماكن من هذا النوع بعد.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <NewsModal item={newsPlace?.news ?? null} onClose={() => setOpenNewsFor(null)} />
    </div>
  );
}
