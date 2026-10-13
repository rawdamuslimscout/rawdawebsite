"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Tent,
} from "lucide-react";

import { arabicCount, ITEM_FORMS } from "@/components/news/format";
import SafeImage from "@/components/ui/SafeImage";

export type HubItem = {
  key: string;
  kind: "news" | "event" | "camp";
  title: string;
  date: string;
  place?: string;
  label?: string;
  excerpt: string;
  image?: string;
  /** Detail page (news only). */
  href?: string;
  /** Events only: true when the real dates say it is still ahead. */
  upcoming?: boolean;
};

function kindLabel(item: HubItem) {
  if (item.kind === "news") return "خبر";
  if (item.kind === "camp") return "مخيم";
  // Only events with real future dates are called "upcoming".
  return item.upcoming ? "مناسبة قادمة" : "مناسبة";
}

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
  const [page, setPage] = useState(1);

  const listRef = useRef<HTMLUListElement>(null);

  // Category counts (the same numbers the chips and the summary line use).
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: items.length,
    };

    for (const item of items) {
      c[item.kind] = (c[item.kind] ?? 0) + 1;
    }

    return c;
  }, [items]);

  // Hash navigation (old links such as /#camps open the matching filter).
  useEffect(() => {
    const apply = () => {
      const t = HASH_TO_TAB[window.location.hash];

      if (t && (counts[t] ?? 0) > 0) {
        setTab(t);
        setPage(1);
      }
    };

    apply();

    window.addEventListener("hashchange", apply);

    return () => window.removeEventListener("hashchange", apply);
  }, [counts]);

  // Only offer categories that actually have items.
  const visibleTabs = TABS.filter((t) => (counts[t.id] ?? 0) > 0);

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
  };

  // The featured card counts as the first item, so the summary line and
  // the chip counts always agree.
  const total = rest.length + 1;
  const firstShown = page === 1 ? 1 : (page - 1) * PAGE_SIZE + 2;
  const lastShown = Math.min(page * PAGE_SIZE + 1, total);

  return (
    <>
      {/* Filter chips */}
      {visibleTabs.length > 2 && (
        <div
          role="group"
          aria-label="تصفية المحتوى"
          className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {visibleTabs.map((t) => {
            const active = tab === t.id;

            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => chooseTab(t.id)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand-purple text-white shadow-sm"
                    : "bg-white text-brand-ink/75 ring-1 ring-brand-purple/10 hover:bg-brand-purple-tint hover:text-brand-ink"
                }`}
              >
                {t.label}
                <span
                  className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-brand-purple/[0.06] text-brand-ink/70"
                  }`}
                >
                  {counts[t.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Featured content and list */}
      <div
        key={tab}
        className="animate-hub-in mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8"
      >
        {/* Featured */}
        <div className="lg:col-span-7">
          <Featured item={featured} />
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
                <Row item={item} />
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
          {total > 1 && (
            <p
              aria-live="polite"
              className="mt-3 text-center text-xs text-brand-ink/70"
            >
              {totalPages > 1
                ? `عرض ${firstShown}–${lastShown} من ${arabicCount(total, ITEM_FORMS)}`
                : arabicCount(total, ITEM_FORMS)}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function KindChip({ item, light }: { item: HubItem; light?: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        light
          ? "bg-brand-yellow text-brand-purple-dark"
          : "bg-brand-purple/10 text-brand-purple"
      }`}
    >
      {kindLabel(item)}
    </span>
  );
}

function Featured({ item }: { item: HubItem }) {
  // A real <article> with a heading; for news the "read more" link's
  // ::after stretches over the whole card, so the card stays one big tap
  // target without wrapping headings inside a link.
  return (
    <article className="group relative block h-full min-h-[340px] w-full overflow-hidden rounded-2xl bg-brand-purple-dark text-start shadow-soft transition duration-300 hover:shadow-lift focus-within:shadow-lift sm:min-h-[420px] lg:min-h-[500px]">
      {/* No photo, or a photo that fails to load: the same branded backdrop. */}
      <SafeImage
        src={item.image}
        alt=""
        sizes="(min-width: 1024px) 58vw, 100vw"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        fallback={
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
        }
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-brand-purple-dark via-brand-purple-dark/40 to-transparent"
      />

      <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <KindChip item={item} light />

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

          {item.href && (
            <Link
              href={item.href}
              className="inline-flex min-h-11 items-center gap-2 after:absolute after:inset-0 after:rounded-2xl after:content-['']"
            >
              اقرأ الخبر
              <span className="sr-only">: {item.title}</span>
              <ArrowLeft
                className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function Row({ item }: { item: HubItem }) {
  const Icon =
    item.kind === "event" ? CalendarDays : item.kind === "camp" ? Tent : null;

  const inner = (
    <>
      <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-purple text-brand-yellow sm:h-[72px] sm:w-[72px]">
        <SafeImage
          src={item.image}
          variant="thumb"
          alt=""
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          fallback={
            Icon ? <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" /> : null
          }
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
          <span className="text-brand-purple">{kindLabel(item)}</span>

          <span className="text-brand-ink/70">{item.date}</span>
        </span>

        <span className="mt-1 block font-display text-base font-semibold leading-snug text-brand-ink sm:text-lg">
          {item.title}
        </span>

        {item.place && (
          <span className="mt-1 flex items-center gap-1 text-xs text-brand-ink/70">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {item.place}
          </span>
        )}

        {/* Events and camps have no detail view, so show their summary
            here instead of hiding it. */}
        {!item.href && item.excerpt && (
          <span className="mt-1.5 line-clamp-2 block text-xs leading-6 text-brand-ink/70">
            {item.excerpt}
          </span>
        )}
      </span>

      {item.href && (
        <ArrowLeft
          className="h-4 w-4 shrink-0 text-brand-purple/50 transition-transform group-hover:-translate-x-1 group-hover:text-brand-purple"
          aria-hidden="true"
        />
      )}
    </>
  );

  const cls =
    "group flex w-full items-center gap-4 p-4 text-start transition-colors duration-200 sm:p-5";

  return item.href ? (
    <Link
      href={item.href}
      className={`${cls} hover:bg-brand-purple-tint/60 focus-visible:bg-brand-purple-tint/60 focus-visible:outline-offset-[-3px]`}
    >
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
