"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Tent,
} from "lucide-react";

import NewsModal from "@/components/ui/NewsModal";
import type { NewsItem } from "@/data/content";
import { responsiveImage, thumbUrl } from "@/lib/image-url";

export type HubItem = {
  key: string;
  kind: "news" | "event" | "camp";
  title: string;
  date: string;
  place?: string;
  label?: string;
  excerpt: string;
  image?: string;
  news?: NewsItem;
};

const KIND_LABEL = {
  news: "خبر",
  event: "مناسبة قادمة",
  camp: "مخيم",
} as const;

const TABS = [
  { id: "all", label: "الكل" },
  { id: "news", label: "الأخبار" },
  { id: "event", label: "المناسبات" },
  { id: "camp", label: "المخيمات" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const HASH_TO_TAB: Record<string, TabId> = {
  "#news": "news",
  "#camps": "camp",
};

const PAGE_SIZE = 5;

export default function HubClient({ items }: { items: HubItem[] }) {
  const [tab, setTab] = useState<TabId>("all");
  const [openNews, setOpenNews] = useState<NewsItem | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filterRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLUListElement>(null);

  const closeNews = useCallback(() => setOpenNews(null), []);

  // Hash navigation
  useEffect(() => {
    const apply = () => {
      const t = HASH_TO_TAB[window.location.hash];

      if (t) {
        setTab(t);
        setPage(1);
      }
    };

    apply();

    window.addEventListener("hashchange", apply);

    return () => window.removeEventListener("hashchange", apply);
  }, []);

  // While the filter menu is open: close on outside click/tap or Escape
  // (Escape hands focus back to the trigger).
  useEffect(() => {
    if (!filterOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFilterOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [filterOpen]);

  // Category counts
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: items.length,
    };

    for (const item of items) {
      c[item.kind] = (c[item.kind] ?? 0) + 1;
    }

    return c;
  }, [items]);

  const visibleTabs = TABS.filter((t) => (counts[t.id] ?? 0) > 0);

  // Move focus into the menu (onto the current choice) when it opens.
  useEffect(() => {
    if (!filterOpen) return;
    const index = Math.max(
      0,
      visibleTabs.findIndex((t) => t.id === tab),
    );
    optionRefs.current[index]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOpen]);

  // Featured item and supporting list
  const { featured, rest } = useMemo(() => {
    const pool =
      tab === "all" ? items : items.filter((item) => item.kind === tab);

    const feat =
      pool.find((item) => item.kind === "news" && item.image) ??
      pool[0] ??
      null;

    let others = pool.filter((item) => item !== feat);

    if (tab === "all") {
      // Interleave kinds so the list feels mixed, not grouped
      const by = (kind: string) => others.filter((item) => item.kind === kind);

      const [news, events, camps] = [by("news"), by("event"), by("camp")];

      const mixed: HubItem[] = [];

      for (
        let i = 0;
        i < Math.max(news.length, events.length, camps.length);
        i++
      ) {
        if (events[i]) mixed.push(events[i]);
        if (news[i]) mixed.push(news[i]);
        if (camps[i]) mixed.push(camps[i]);
      }

      others = mixed;
    }

    return {
      featured: feat,
      rest: others,
    };
  }, [items, tab]);

  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));

  const paginatedItems = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [tab]);

  // Keep page valid if the available items change
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (!items.length || !featured) {
    return null;
  }

  const selectedTab = TABS.find((t) => t.id === tab);

  const changePage = (nextPage: number) => {
    const target = Math.max(1, Math.min(nextPage, totalPages));
    if (target === page) return;
    setPage(target);

    // If the top of the list has scrolled out of view (long lists on
    // phones), bring it back so the new page starts where the eye expects.
    const list = listRef.current;
    if (list && list.getBoundingClientRect().top < 80) {
      list.scrollIntoView({ block: "start" });
    }
  };

  const chooseTab = (id: TabId) => {
    setTab(id);
    setPage(1);
    setFilterOpen(false);
    triggerRef.current?.focus();
  };

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const options = optionRefs.current.slice(0, visibleTabs.length).filter(
      (el): el is HTMLButtonElement => Boolean(el),
    );
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;

    if (event.key === "ArrowDown") next = (current + 1) % options.length;
    else if (event.key === "ArrowUp")
      next = (current - 1 + options.length) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else if (event.key === "Tab") setFilterOpen(false);

    if (next >= 0) {
      event.preventDefault();
      options[next]?.focus();
    }
  };

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setFilterOpen(true);
    }
  };

  const firstShown = Math.min((page - 1) * PAGE_SIZE + 1, rest.length);
  const lastShown = Math.min(page * PAGE_SIZE, rest.length);

  return (
    <>
      {/* Filter dropdown */}
      {visibleTabs.length > 1 && (
        <div ref={filterRef} className="relative mt-8 flex justify-start">
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={filterOpen}
            aria-haspopup="menu"
            aria-controls="hub-filter-menu"
            onClick={() => setFilterOpen((prev) => !prev)}
            onKeyDown={onTriggerKeyDown}
            className="inline-flex min-h-11 min-w-[180px] items-center justify-between gap-5 rounded-xl border border-brand-purple/15 bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink shadow-sm transition-colors hover:border-brand-purple/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40"
          >
            <span className="flex items-center gap-2">
              <span className="sr-only">تصفية المحتوى: </span>
              <span>{selectedTab?.label ?? "الكل"}</span>

              <span className="rounded-full bg-brand-purple/10 px-2 py-0.5 text-xs text-brand-purple">
                {counts[tab]}
              </span>
            </span>

            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 text-brand-ink/50 transition-transform duration-200 ${
                filterOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {filterOpen && (
            <div
              id="hub-filter-menu"
              role="menu"
              aria-label="تصفية المحتوى"
              onKeyDown={onMenuKeyDown}
              className="absolute start-0 top-full z-30 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-brand-purple/10 bg-white p-1.5 shadow-lg"
            >
              {visibleTabs.map((t, i) => {
                const active = tab === t.id;

                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      optionRefs.current[i] = el;
                    }}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    tabIndex={-1}
                    onClick={() => chooseTab(t.id)}
                    className={`flex min-h-11 w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-start text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40 ${
                      active
                        ? "bg-brand-purple/5 font-bold text-brand-purple"
                        : "text-brand-ink/75 hover:bg-brand-purple-tint/50 focus-visible:bg-brand-purple-tint/50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {t.label}

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${
                          active
                            ? "bg-brand-purple/10 text-brand-purple"
                            : "bg-brand-ink/5 text-brand-ink/60"
                        }`}
                      >
                        {counts[t.id]}
                      </span>
                    </span>

                    {active && (
                      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Featured content and list */}
      <div
        key={tab}
        className="animate-hub-in mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8"
      >
        {/* Featured */}
        <div className="lg:col-span-7">
          <Featured item={featured} onOpen={setOpenNews} />
        </div>

        {/* Supporting list and pagination */}
        <div className="lg:col-span-5">
          <ul
            ref={listRef}
            className="scroll-mt-24 divide-y divide-brand-purple/10 self-start overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-soft"
          >
            {paginatedItems.length === 0 && (
              <li className="p-6 text-sm text-brand-ink/70">
                لا توجد عناصر أخرى حاليًا.
              </li>
            )}

            {paginatedItems.map((item) => (
              <li key={item.key}>
                <Row item={item} onOpen={setOpenNews} />
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="التنقل بين صفحات المحتوى"
              className="mt-5 flex flex-wrap items-center justify-center gap-2"
            >
              {/* Previous */}
              <button
                type="button"
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                aria-label="الصفحة السابقة"
                className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-lg border border-brand-purple/15 bg-white px-3 text-sm font-semibold text-brand-purple transition hover:bg-brand-purple/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => changePage(p)}
                      aria-label={`الصفحة ${p}`}
                      aria-current={page === p ? "page" : undefined}
                      className={`h-11 min-w-11 rounded-lg px-3 text-sm font-bold transition ${
                        page === p
                          ? "bg-brand-purple text-white"
                          : "border border-brand-purple/15 bg-white text-brand-purple hover:bg-brand-purple/5"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              {/* Next */}
              <button
                type="button"
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                aria-label="الصفحة التالية"
                className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-lg border border-brand-purple/15 bg-white px-3 text-sm font-semibold text-brand-purple transition hover:bg-brand-purple/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}

          {/* Results count (announced when the page or filter changes) */}
          {rest.length > 0 && (
            <p
              aria-live="polite"
              className="mt-3 text-center text-xs text-brand-ink/60"
            >
              عرض {firstShown}–{lastShown} من {rest.length} عناصر
            </p>
          )}
        </div>
      </div>

      <NewsModal item={openNews} onClose={closeNews} />
    </>
  );
}

function KindChip({ kind, light }: { kind: HubItem["kind"]; light?: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        light
          ? "bg-brand-yellow text-brand-purple-dark"
          : "bg-brand-purple/10 text-brand-purple"
      }`}
    >
      {KIND_LABEL[kind]}
    </span>
  );
}

function Featured({
  item,
  onOpen,
}: {
  item: HubItem;
  onOpen: (n: NewsItem) => void;
}) {
  // A real <article> with a heading; for news the "read more" button's
  // ::after stretches over the whole card, so the card stays one big tap
  // target without wrapping headings inside a <button>.
  return (
    <article className="group relative block h-full min-h-[340px] w-full overflow-hidden rounded-2xl bg-brand-purple-dark text-start shadow-soft transition duration-300 hover:shadow-lift focus-within:shadow-lift sm:min-h-[420px] lg:min-h-[500px]">
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          sizes="(min-width: 1024px) 58vw, 100vw"
          alt=""
          loading="lazy"
          decoding="async"
          {...responsiveImage(item.image)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="texture-canvas absolute inset-0 opacity-50"
          />

          <svg
            className="absolute inset-x-0 bottom-0 h-1/2 w-full text-brand-purple/60"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 200 L0 120 L80 50 L160 130 L240 20 L320 120 L400 60 L400 200Z"
              fill="currentColor"
            />
          </svg>
        </>
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-brand-purple-dark via-brand-purple-dark/40 to-transparent"
      />

      <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <KindChip kind={item.kind} light />

          <span className="text-sm font-semibold text-white/85">
            {item.date}
          </span>

          {item.label && (
            <span className="text-sm text-brand-yellow">{item.label}</span>
          )}
        </div>

        <h3 className="mt-4 font-display text-2xl font-bold leading-snug text-white sm:text-3xl">
          {item.title}
        </h3>

        <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
          {item.excerpt}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-white">
          {item.place && (
            <span className="inline-flex items-center gap-1.5 font-medium text-white/85">
              <MapPin
                className="h-4 w-4 text-brand-yellow"
                aria-hidden="true"
              />
              {item.place}
            </span>
          )}

          {item.news && (
            <button
              type="button"
              onClick={() => onOpen(item.news!)}
              aria-haspopup="dialog"
              className="inline-flex min-h-11 items-center gap-2 after:absolute after:inset-0 after:rounded-2xl after:content-['']"
            >
              اقرأ التفاصيل
              <span className="sr-only">: {item.title}</span>
              <ArrowLeft
                className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function Row({
  item,
  onOpen,
}: {
  item: HubItem;
  onOpen: (n: NewsItem) => void;
}) {
  const Icon =
    item.kind === "event" ? CalendarDays : item.kind === "camp" ? Tent : null;

  const inner = (
    <>
      <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-purple text-brand-yellow sm:h-[72px] sm:w-[72px]">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            width={72}
            height={72}
            loading="lazy"
            decoding="async"
            src={thumbUrl(item.image)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : Icon ? (
          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
          <span className="text-brand-purple">{KIND_LABEL[item.kind]}</span>

          <span className="text-brand-ink/60">{item.date}</span>
        </span>

        <span className="mt-1 block font-display text-base font-semibold leading-snug text-brand-ink sm:text-lg">
          {item.title}
        </span>

        {item.place && (
          <span className="mt-1 flex items-center gap-1 text-xs text-brand-ink/60">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {item.place}
          </span>
        )}

        {/* Events and camps have no detail view, so show their summary
            here instead of hiding it. */}
        {!item.news && item.excerpt && (
          <span className="mt-1.5 line-clamp-2 block text-xs leading-6 text-brand-ink/70">
            {item.excerpt}
          </span>
        )}
      </span>

      {item.news && (
        <ArrowLeft
          className="h-4 w-4 shrink-0 text-brand-purple/50 transition-transform group-hover:-translate-x-1 group-hover:text-brand-purple"
          aria-hidden="true"
        />
      )}
    </>
  );

  const cls =
    "group flex w-full items-center gap-4 p-4 text-start transition-colors duration-200 sm:p-5";

  return item.news ? (
    <button
      type="button"
      onClick={() => onOpen(item.news!)}
      aria-haspopup="dialog"
      className={`${cls} hover:bg-brand-purple-tint/60 focus-visible:bg-brand-purple-tint/60 focus-visible:outline-offset-[-3px]`}
    >
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
