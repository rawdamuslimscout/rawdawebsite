"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPinOff, SearchX } from "lucide-react";

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

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const mapBoxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<string | null>(null);

  // ---------------------------------------------
  // Responsive pagination
  //
  // < 640px  → 1 item
  // 640-1023 → 3 items
  // >= 1024  → 6 items
  // ---------------------------------------------
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setItemsPerPage(1);
      } else if (width < 1024) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(6);
      }
    };

    updateItemsPerPage();

    window.addEventListener("resize", updateItemsPerPage);

    return () => {
      window.removeEventListener("resize", updateItemsPerPage);
    };
  }, []);

  // ---------------------------------------------
  // Counts
  // ---------------------------------------------
  const counts = useMemo(() => {
    const result = {} as Record<MapFilterKey, number>;

    (Object.keys(FILTER_CATEGORIES) as MapFilterKey[]).forEach((key) => {
      const allowed = FILTER_CATEGORIES[key];

      result[key] = places.filter((place) =>
        allowed.includes(place.category),
      ).length;
    });

    return result;
  }, [places]);

  // ---------------------------------------------
  // Filter
  // ---------------------------------------------
  const filtered = useMemo(() => {
    const allowed = FILTER_CATEGORIES[filter];

    return places.filter((place) => allowed.includes(place.category));
  }, [places, filter]);

  // ---------------------------------------------
  // Pagination
  // ---------------------------------------------
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const paginatedPlaces = useMemo(() => {
    const start = (page - 1) * itemsPerPage;

    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, page, itemsPerPage]);

  // Keep current page valid after resize/filter.
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // ---------------------------------------------
  // Selected place
  // ---------------------------------------------
  const selected = useMemo(
    () => paginatedPlaces.find((place) => place.id === selectedId) ?? null,
    [paginatedPlaces, selectedId],
  );

  // ---------------------------------------------
  // Lazy-load map
  // ---------------------------------------------
  useEffect(() => {
    const element = mapBoxRef.current;

    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setMapVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "400px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // ---------------------------------------------
  // Select
  // ---------------------------------------------
  const select = useCallback((id: string) => {
    lastSelectedRef.current = id;
    setSelectedId(id);
  }, []);

  // ---------------------------------------------
  // Back
  // ---------------------------------------------
  const back = useCallback(() => {
    setSelectedId(null);
  }, []);

  // ---------------------------------------------
  // Scroll selected card into view
  // ---------------------------------------------
  useEffect(() => {
    if (!selected) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (window.innerWidth < 1024) {
      cardRef.current?.scrollIntoView({
        block: "nearest",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }

    headingRef.current?.focus({
      preventScroll: true,
    });
  }, [selected]);

  // ---------------------------------------------
  // Restore focus
  // ---------------------------------------------
  const wasSelectedRef = useRef(false);

  useEffect(() => {
    if (wasSelectedRef.current && !selected && lastSelectedRef.current) {
      const id = lastSelectedRef.current;

      listRef.current
        ?.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(id)}"]`)
        ?.focus({
          preventScroll: false,
        });
    }

    wasSelectedRef.current = !!selected;
  }, [selected]);

  // ---------------------------------------------
  // Filter change
  // ---------------------------------------------
  const changeFilter = (key: MapFilterKey) => {
    setFilter(key);
    setSelectedId(null);
    setPage(1);
  };

  // ---------------------------------------------
  // Page change
  // ---------------------------------------------
  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    setSelectedId(null);
    setPage(newPage);

    requestAnimationFrame(() => {
      mapBoxRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  // ---------------------------------------------
  // Pagination numbers
  // ---------------------------------------------
  const paginationPages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, totalPages];
    }

    if (page >= totalPages - 2) {
      return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, page - 1, page, page + 1, totalPages];
  }, [page, totalPages]);

  const newsPlace = places.find((place) => place.id === openNewsFor);

  return (
    <div className="mt-6 w-full min-w-0 overflow-hidden sm:mt-8 lg:mt-10">
      {/* -----------------------------------------
          FILTERS
      ------------------------------------------ */}
      <div
        className="
          flex
          min-w-0
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="min-w-0 flex-1 overflow-x-auto pb-1">
          <MapFilters value={filter} counts={counts} onChange={changeFilter} />
        </div>

        <p
          role="status"
          aria-live="polite"
          className="
            shrink-0
            text-xs
            font-semibold
            text-brand-ink/55
            sm:text-sm
          "
        >
          {placesCountLabel(filtered.length)}
        </p>
      </div>

      {/* -----------------------------------------
          MAP + LIST
      ------------------------------------------ */}
      <div
        className="
          mt-3
          grid
          min-w-0
          gap-4
          sm:mt-4
          sm:gap-5
          lg:grid-cols-12
          lg:items-start
          lg:gap-6
        "
      >
        {/* ---------------------------------------
            MAP
        ---------------------------------------- */}
        <div className="min-w-0 lg:col-span-8">
          <div
            ref={mapBoxRef}
            className="
              relative
              h-[220px]
              w-full
              overflow-hidden
              rounded-xl
              border
              border-brand-purple/10
              bg-brand-purple-tint
              shadow-soft
              sm:h-[340px]
              sm:rounded-2xl
              md:h-[400px]
              lg:h-[540px]
            "
          >
            {mapFailed ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center sm:p-6">
                <MapPinOff
                  className="h-7 w-7 text-brand-purple/60 sm:h-8 sm:w-8"
                  aria-hidden="true"
                />

                <p className="max-w-xs text-xs leading-6 text-brand-ink/70 sm:text-sm sm:leading-7">
                  تعذّر عرض الخريطة الآن. يمكنك الاطّلاع على كل الأماكن من
                  القائمة بجانبها.
                </p>
              </div>
            ) : paginatedPlaces.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center sm:p-6">
                <SearchX
                  className="h-7 w-7 text-brand-purple/60 sm:h-8 sm:w-8"
                  aria-hidden="true"
                />

                <p className="text-xs font-semibold text-brand-ink/70 sm:text-sm">
                  لا توجد أماكن من هذا النوع بعد.
                </p>

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
                places={paginatedPlaces}
                selectedId={selected?.id ?? null}
                onSelect={select}
                onFailed={() => setMapFailed(true)}
              />
            ) : (
              <MapSkeleton label="تُحمَّل الخريطة عند الاقتراب منها…" />
            )}
          </div>
        </div>

        {/* ---------------------------------------
            LIST / CARD
        ---------------------------------------- */}
        <div
          className="min-w-0 lg:col-span-4"
          onKeyDown={(event) => {
            if (event.key === "Escape" && selected) {
              back();
            }
          }}
        >
          {selected ? (
            <div
              ref={cardRef}
              className="
                min-w-0
                scroll-mt-24
                lg:max-h-[540px]
                lg:overflow-y-auto
              "
            >
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
              className="
                min-w-0
                rounded-xl
                border
                border-brand-purple/10
                bg-white
                p-4
                shadow-soft
                sm:rounded-2xl
                sm:p-5
                lg:max-h-[540px]
                lg:overflow-y-auto
              "
            >
              <h3
                className="
                  font-display
                  text-base
                  font-bold
                  text-brand-ink
                  sm:text-lg
                "
              >
                قائمة الأماكن
              </h3>

              <p className="mt-1 text-xs leading-5 text-brand-ink/55 sm:text-sm sm:leading-6">
                اختر مكانًا من القائمة أو اضغط على علامته في الخريطة.
              </p>

              {paginatedPlaces.length > 0 ? (
                <div className="mt-3">
                  <MapActivityList
                    places={paginatedPlaces}
                    selectedId={null}
                    onSelect={select}
                  />
                </div>
              ) : (
                <p className="mt-4 text-xs text-brand-ink/60 sm:text-sm">
                  لا توجد أماكن من هذا النوع بعد.
                </p>
              )}

              {/* -----------------------------------
                  PAGINATION
              ------------------------------------ */}
              {totalPages > 1 && (
                <div
                  className="
                    mt-4
                    flex
                    items-center
                    justify-between
                    gap-2
                    border-t
                    border-brand-purple/10
                    pt-3
                    sm:mt-5
                    sm:pt-4
                  "
                  dir="rtl"
                >
                  {/* Previous */}
                  <button
                    type="button"
                    onClick={() => changePage(page - 1)}
                    disabled={page === 1}
                    aria-label="الصفحة السابقة"
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-brand-purple/10
                      bg-white
                      text-brand-purple
                      transition
                      hover:bg-brand-purple-tint
                      disabled:pointer-events-none
                      disabled:opacity-30
                      sm:h-9
                      sm:w-9
                      sm:rounded-xl
                    "
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>

                  {/* Pages */}
                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-1
                      overflow-hidden
                      sm:gap-1.5
                    "
                  >
                    {paginationPages.map((pageNumber, index) => {
                      const previous = paginationPages[index - 1];

                      const showDots = previous && pageNumber - previous > 1;

                      return (
                        <div
                          key={pageNumber}
                          className="flex items-center gap-1 sm:gap-1.5"
                        >
                          {showDots && (
                            <span className="px-0.5 text-xs text-brand-ink/40">
                              …
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => changePage(pageNumber)}
                            aria-current={
                              pageNumber === page ? "page" : undefined
                            }
                            className={`
                                flex
                                h-8
                                min-w-8
                                items-center
                                justify-center
                                rounded-lg
                                px-1.5
                                text-[11px]
                                font-bold
                                transition
                                sm:px-2
                                sm:text-xs
                                ${
                                  pageNumber === page
                                    ? "bg-brand-purple text-white"
                                    : "text-brand-ink/60 hover:bg-brand-purple-tint hover:text-brand-purple"
                                }
                              `}
                          >
                            {pageNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => changePage(page + 1)}
                    disabled={page === totalPages}
                    aria-label="الصفحة التالية"
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-brand-purple/10
                      bg-white
                      text-brand-purple
                      transition
                      hover:bg-brand-purple-tint
                      disabled:pointer-events-none
                      disabled:opacity-30
                      sm:h-9
                      sm:w-9
                      sm:rounded-xl
                    "
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* News modal */}
      <NewsModal
        item={newsPlace?.news ?? null}
        onClose={() => setOpenNewsFor(null)}
      />
    </div>
  );
}
