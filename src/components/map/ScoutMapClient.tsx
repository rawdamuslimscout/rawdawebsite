"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPinOff,
  RotateCw,
  SearchX,
} from "lucide-react";

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
import { formatNumber, placesCountLabel } from "./categories";

/* -------------------------------------------------------------------------- */
/*                                    MAP                                     */
/* -------------------------------------------------------------------------- */

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/**
 * One fixed page size for every screen: the server HTML and the first client
 * render match (no list jump after hydration), and phones are not reduced to
 * one place per page.
 */
const ITEMS_PER_PAGE = 6;

const LIST_ID = "map-places-list";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function ScoutMapClient({ places }: { places: MapPlace[] }) {
  const [filter, setFilter] = useState<MapFilterKey>("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [openNewsFor, setOpenNewsFor] = useState<string | null>(null);

  const [mapVisible, setMapVisible] = useState(false);

  const [mapFailed, setMapFailed] = useState(false);

  const [page, setPage] = useState(1);

  const itemsPerPage = ITEMS_PER_PAGE;

  const mapBoxRef = useRef<HTMLDivElement>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);

  const listRef = useRef<HTMLDivElement>(null);

  const lastSelectedRef = useRef<string | null>(null);

  const wasSelectedRef = useRef(false);

  /* ------------------------------------------------------------------------ */
  /* COUNTS                                                                  */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* FILTERED                                                                */
  /* ------------------------------------------------------------------------ */

  /**
   * This is the complete set of places matching the active filter.
   *
   * IMPORTANT:
   * The map uses this array.
   * Pagination only affects the list below.
   */
  const filtered = useMemo(() => {
    const allowed = FILTER_CATEGORIES[filter];

    return places.filter((place) => allowed.includes(place.category));
  }, [places, filter]);

  /* ------------------------------------------------------------------------ */
  /* PAGINATION                                                              */
  /* ------------------------------------------------------------------------ */

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  /**
   * Only the visible/list items are paginated.
   */
  const paginatedPlaces = useMemo(() => {
    const start = (page - 1) * itemsPerPage;

    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, page, itemsPerPage]);

  /* ------------------------------------------------------------------------ */
  /* KEEP PAGE VALID                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  /* ------------------------------------------------------------------------ */
  /* SELECTED PLACE                                                          */
  /* ------------------------------------------------------------------------ */

  /**
   * IMPORTANT:
   * Search inside `filtered`, NOT `paginatedPlaces`.
   *
   * This means a place can remain selected even if it is not
   * on the currently visible pagination page.
   */
  const selected = useMemo(
    () => filtered.find((place) => place.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  /* ------------------------------------------------------------------------ */
  /* LAZY LOAD MAP                                                           */
  /* ------------------------------------------------------------------------ */

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
        rootMargin: "500px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* SELECT                                                                  */
  /* ------------------------------------------------------------------------ */

  const select = useCallback(
    (id: string) => {
      lastSelectedRef.current = id;
      setSelectedId(id);

      // A pin picked on the map may live on another list page. Move the list
      // there so «كل الأماكن» returns to (and focuses) that same place.
      const index = filtered.findIndex((place) => place.id === id);

      if (index >= 0) {
        setPage(Math.floor(index / itemsPerPage) + 1);
      }
    },
    [filtered, itemsPerPage],
  );

  /* ------------------------------------------------------------------------ */
  /* BACK                                                                    */
  /* ------------------------------------------------------------------------ */

  const back = useCallback(() => {
    setSelectedId(null);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* SELECTED CARD UX                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!selected) return;

    const reduceMotion = prefersReducedMotion();

    /**
     * Mobile / tablet:
     * Bring the top of the selected card into view
     * (it sits below the map).
     *
     * Desktop:
     * No automatic scroll because the card
     * is already visible beside the map.
     */
    if (window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        cardRef.current?.scrollIntoView({
          block: "start",
          behavior: reduceMotion ? "auto" : "smooth",
        });
      });
    }

    requestAnimationFrame(() => {
      headingRef.current?.focus({
        preventScroll: true,
      });
    });
  }, [selected]);

  /* ------------------------------------------------------------------------ */
  /* RESTORE FOCUS                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (wasSelectedRef.current && !selected && lastSelectedRef.current) {
      const id = lastSelectedRef.current;

      requestAnimationFrame(() => {
        const item = listRef.current?.querySelector<HTMLElement>(
          `[data-place-id="${CSS.escape(id)}"]`,
        );

        if (item) {
          item.focus({ preventScroll: true });

          item.scrollIntoView({
            block: "nearest",
            behavior: prefersReducedMotion() ? "auto" : "smooth",
          });
        } else {
          // e.g. the filter changed while the card was open
          panelRef.current?.focus({ preventScroll: true });
        }
      });
    }

    wasSelectedRef.current = !!selected;
  }, [selected]);

  /* ------------------------------------------------------------------------ */
  /* FILTER CHANGE                                                           */
  /* ------------------------------------------------------------------------ */

  const changeFilter = (key: MapFilterKey) => {
    setFilter(key);

    // Reset selection because the selected place may
    // no longer belong to the new filter.
    setSelectedId(null);

    // Always start from the first list page.
    setPage(1);

    // Allow the map to recover if the previous state failed.
    setMapFailed(false);
  };

  /* ------------------------------------------------------------------------ */
  /* PAGE CHANGE                                                             */
  /* ------------------------------------------------------------------------ */

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    // Pagination affects the LIST only.
    setSelectedId(null);
    setPage(newPage);

    /**
     * Show the new page from its first item:
     * - desktop: the list box scrolls internally → reset it to the top;
     * - mobile/tablet: if the list's top is above the viewport, bring it back
     *   (the map is NOT scrolled to — the user is reading the list).
     */
    requestAnimationFrame(() => {
      const list = listRef.current;

      if (!list) return;

      const behavior: ScrollBehavior = prefersReducedMotion()
        ? "auto"
        : "smooth";

      list.scrollTo({ top: 0, behavior });

      if (list.getBoundingClientRect().top < 0) {
        list.scrollIntoView({ block: "start", behavior });
      }
    });
  };

  /* ------------------------------------------------------------------------ */
  /* SHOW SELECTED ON MAP (mobile: the map is above the card)               */
  /* ------------------------------------------------------------------------ */

  const showOnMap = () => {
    mapBoxRef.current?.scrollIntoView({
      block: "center",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  /* ------------------------------------------------------------------------ */
  /* PAGINATION NUMBERS                                                      */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* NEWS                                                                    */
  /* ------------------------------------------------------------------------ */

  const newsPlace = places.find((place) => place.id === openNewsFor);

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <section
      className="
        mt-5
        w-full
        min-w-0
        sm:mt-7
        lg:mt-9
      "
    >
      {/* ================================================================== */}
      {/* FILTER HEADER                                                      */}
      {/* ================================================================== */}

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
        {/* Filters (MapFilters scrolls sideways itself, edge to edge on phones) */}
        <div className="min-w-0 max-w-full">
          <MapFilters value={filter} counts={counts} onChange={changeFilter} />
        </div>

        {/* Results count */}
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

      {/* ================================================================== */}
      {/* MAIN CONTENT                                                       */}
      {/* ================================================================== */}

      <div
        className="
          mt-3
          grid
          min-w-0
          gap-3
          sm:mt-4
          sm:gap-4
          lg:grid-cols-12
          lg:items-start
          lg:gap-5
          xl:gap-6
        "
      >
        {/* ================================================================= */}
        {/* MAP                                                               */}
        {/* ================================================================= */}

        <div
          className="
            relative
            min-w-0
            lg:col-span-8
          "
        >
          {/* Keyboard users can jump past the map and its pins to the list. */}
          {filtered.length > 0 && !mapFailed && (
            <a
              href={`#${LIST_ID}`}
              onClick={(event) => {
                event.preventDefault();
                panelRef.current?.focus();
              }}
              className="
                sr-only
                focus:not-sr-only
                focus:absolute
                focus:right-3
                focus:top-3
                focus:z-[1000]
                focus:rounded-xl
                focus:bg-white
                focus:px-4
                focus:py-3
                focus:text-sm
                focus:font-bold
                focus:text-brand-purple
                focus:shadow-soft
              "
            >
              تخطَّ الخريطة إلى قائمة الأماكن
            </a>
          )}

          <div
            ref={mapBoxRef}
            className="
              relative
              h-[300px]
              w-full
              overflow-hidden
              rounded-2xl
              border
              border-brand-purple/[0.09]
              bg-brand-purple-tint
              shadow-soft
              sm:h-[380px]
              md:h-[430px]
              lg:h-[540px]
              xl:h-[580px]
              2xl:h-[620px]
              lg:rounded-3xl
            "
          >
            {/* =========================================================== */}
            {/* MAP ERROR                                                    */}
            {/* =========================================================== */}

            {mapFailed ? (
              <div
                className="
                  absolute
                  inset-0
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-3
                  px-5
                  text-center
                "
              >
                <span
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-brand-purple/[0.07]
                  "
                >
                  <MapPinOff
                    className="
                      h-5
                      w-5
                      text-brand-purple/65
                    "
                    aria-hidden="true"
                  />
                </span>

                <p
                  className="
                    max-w-xs
                    text-xs
                    leading-6
                    text-brand-ink/65
                    sm:text-sm
                    sm:leading-7
                  "
                >
                  تعذّر عرض الخريطة الآن. يمكنك الاطلاع على الأماكن من القائمة.
                </p>

                <button
                  type="button"
                  onClick={() => setMapFailed(false)}
                  className="
                    inline-flex
                    min-h-[44px]
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-brand-purple/15
                    bg-white
                    px-4
                    text-sm
                    font-bold
                    text-brand-purple
                    shadow-sm
                    transition
                    hover:bg-brand-purple-tint
                  "
                >
                  <RotateCw className="h-4 w-4" aria-hidden="true" />
                  إعادة المحاولة
                </button>
              </div>
            ) : filtered.length === 0 ? (
              /* ========================================================== */
              /* EMPTY                                                        */
              /* ========================================================== */

              <div
                className="
                  absolute
                  inset-0
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-3
                  px-5
                  text-center
                "
              >
                <span
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-brand-purple/[0.07]
                  "
                >
                  <SearchX
                    className="
                      h-5
                      w-5
                      text-brand-purple/60
                    "
                    aria-hidden="true"
                  />
                </span>

                <p
                  className="
                    text-xs
                    font-semibold
                    text-brand-ink/65
                    sm:text-sm
                  "
                >
                  لا توجد أماكن من هذا النوع بعد.
                </p>

                <button
                  type="button"
                  onClick={() => changeFilter("all")}
                  className="
                    min-h-[44px]
                    rounded-xl
                    border
                    border-brand-purple/15
                    bg-white
                    px-4
                    text-sm
                    font-bold
                    text-brand-purple
                    shadow-sm
                    transition
                    hover:bg-brand-purple-tint
                  "
                >
                  عرض كل الأماكن
                </button>
              </div>
            ) : mapVisible ? (
              /* ========================================================== */
              /* ACTUAL MAP                                                  */
              /* ========================================================== */

              <LeafletMap
                /*
                 * IMPORTANT:
                 * The map receives ALL filtered places.
                 *
                 * Do NOT use `paginatedPlaces` here.
                 *
                 * This is what makes the mobile map show every
                 * location while the list still has pagination.
                 */
                places={filtered}
                selectedId={selectedId}
                onSelect={select}
                onFailed={() => setMapFailed(true)}
              />
            ) : (
              <MapSkeleton label="تُحمَّل الخريطة عند الاقتراب منها…" />
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* LIST / DETAILS                                                    */}
        {/* ================================================================= */}

        <div
          ref={panelRef}
          id={LIST_ID}
          tabIndex={-1}
          className="
            min-w-0
            scroll-mt-24
            outline-none
            lg:col-span-4
          "
          onKeyDown={(event) => {
            if (event.key === "Escape" && selected) {
              back();
            }
          }}
        >
          {selected ? (
            /* ============================================================ */
            /* SELECTED PLACE                                               */
            /* ============================================================ */

            <div
              ref={cardRef}
              className="
                min-w-0
                scroll-mt-24
                rounded-2xl
                border
                border-brand-purple/[0.09]
                bg-white
                p-2
                shadow-soft
                sm:rounded-3xl
                sm:p-2.5
                lg:max-h-[540px]
                lg:overflow-y-auto
                lg:overscroll-contain
                lg:p-2
                xl:max-h-[580px]
                2xl:max-h-[620px]
              "
            >
              <MapActivityCard
                ref={headingRef}
                place={selected}
                onBack={back}
                onOpenDetails={() => setOpenNewsFor(selected.id)}
                onShowOnMap={mapFailed ? undefined : showOnMap}
              />
            </div>
          ) : (
            /* ============================================================ */
            /* PLACES LIST                                                  */
            /* ============================================================ */

            <div
              ref={listRef}
              className="
                min-w-0
                rounded-2xl
                border
                border-brand-purple/[0.09]
                bg-white
                p-3
                shadow-soft
                sm:rounded-3xl
                scroll-mt-24
                sm:p-4
                lg:max-h-[540px]
                lg:overflow-y-auto
                lg:overscroll-contain
                lg:p-4
                xl:max-h-[580px]
                xl:p-5
                2xl:max-h-[620px]
              "
            >
              {/* -------------------------------------------------------- */}
              {/* LIST HEADER                                               */}
              {/* -------------------------------------------------------- */}

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >
                <div className="min-w-0">
                  <h3
                    className="
                      font-display
                      text-[15px]
                      font-bold
                      leading-tight
                      text-brand-ink
                      sm:text-base
                      lg:text-lg
                    "
                  >
                    قائمة الأماكن
                  </h3>

                  <p
                    className="
                      mt-1
                      max-w-sm
                      text-xs
                      leading-5
                      text-brand-ink/55
                      sm:leading-6
                    "
                  >
                    اختر مكانًا من القائمة أو اضغط على علامته في الخريطة.
                  </p>
                </div>

                {/* Current page */}
                {totalPages > 1 && (
                  <span
                    className="
                      shrink-0
                      rounded-lg
                      bg-brand-purple/[0.06]
                      px-2
                      py-1
                      text-xs
                      font-bold
                      text-brand-purple
                    "
                  >
                    <span className="sr-only">
                      الصفحة {formatNumber(page)} من {formatNumber(totalPages)}
                    </span>
                    <span aria-hidden="true">
                      {formatNumber(page)} / {formatNumber(totalPages)}
                    </span>
                  </span>
                )}
              </div>

              {/* -------------------------------------------------------- */}
              {/* LIST                                                        */}
              {/* -------------------------------------------------------- */}

              {paginatedPlaces.length > 0 ? (
                <div className="mt-3">
                  <MapActivityList
                    places={paginatedPlaces}
                    selectedId={null}
                    onSelect={select}
                  />
                </div>
              ) : (
                <p
                  className="
                    mt-4
                    rounded-xl
                    bg-brand-purple/[0.035]
                    px-3
                    py-4
                    text-center
                    text-sm
                    text-brand-ink/60
                  "
                >
                  لا توجد أماكن من هذا النوع بعد.
                </p>
              )}

              {/* ======================================================== */}
              {/* PAGINATION                                                 */}
              {/* ======================================================== */}

              {totalPages > 1 && (
                <nav
                  aria-label="تنقّل صفحات الأماكن"
                  className="
                    mt-4
                    border-t
                    border-brand-purple/[0.08]
                    pt-3
                    sm:mt-5
                    sm:pt-4
                  "
                  dir="rtl"
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-2
                    "
                  >
                    {/* Previous */}
                    <button
                      type="button"
                      onClick={() => changePage(page - 1)}
                      disabled={page === 1}
                      aria-label="الصفحة السابقة"
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-brand-purple/[0.09]
                        bg-white
                        text-brand-purple
                        transition
                        hover:bg-brand-purple-tint
                        disabled:pointer-events-none
                        disabled:opacity-25
                        lg:h-10
                        lg:w-10
                      "
                    >
                      <ChevronRight
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>

                    {/* Page numbers */}
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-0.5
                        overflow-hidden
                        sm:gap-1
                      "
                    >
                      {paginationPages.map((pageNumber, index) => {
                        const previous = paginationPages[index - 1];

                        const showDots = previous && pageNumber - previous > 1;

                        return (
                          <div
                            key={pageNumber}
                            className="
                              flex
                              items-center
                              gap-0.5
                              sm:gap-1
                            "
                          >
                            {showDots && (
                              <span
                                aria-hidden="true"
                                className="
                                  px-0.5
                                  text-xs
                                  text-brand-ink/40
                                "
                              >
                                …
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => changePage(pageNumber)}
                              aria-current={
                                pageNumber === page ? "page" : undefined
                              }
                              aria-label={`الصفحة ${formatNumber(pageNumber)}`}
                              className={`
                                flex
                                h-11
                                min-w-[2.25rem]
                                items-center
                                justify-center
                                rounded-xl
                                px-1.5
                                text-sm
                                font-bold
                                transition
                                lg:h-10
                                lg:min-w-[2.5rem]
                                ${
                                  pageNumber === page
                                    ? "bg-brand-purple text-white shadow-sm"
                                    : "text-brand-ink/60 hover:bg-brand-purple/[0.05] hover:text-brand-purple"
                                }
                              `}
                            >
                              {formatNumber(pageNumber)}
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
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-brand-purple/[0.09]
                        bg-white
                        text-brand-purple
                        transition
                        hover:bg-brand-purple-tint
                        disabled:pointer-events-none
                        disabled:opacity-25
                        lg:h-10
                        lg:w-10
                      "
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </nav>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* NEWS MODAL                                                         */}
      {/* ================================================================== */}

      <NewsModal
        item={newsPlace?.news ?? null}
        onClose={() => setOpenNewsFor(null)}
      />
    </section>
  );
}
