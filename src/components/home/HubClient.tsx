"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, MapPin, Tent } from "lucide-react";

import NewsModal from "@/components/ui/NewsModal";
import type { NewsItem } from "@/data/content";

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

export default function HubClient({ items }: { items: HubItem[] }) {
  const [tab, setTab] = useState<TabId>("all");
  const [openNews, setOpenNews] = useState<NewsItem | null>(null);

  const closeNews = useCallback(() => setOpenNews(null), []);

  useEffect(() => {
    const apply = () => {
      const t = HASH_TO_TAB[window.location.hash];

      if (t) {
        setTab(t);
      }
    };

    apply();

    window.addEventListener("hashchange", apply);

    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: items.length,
    };

    for (const it of items) {
      c[it.kind] = (c[it.kind] ?? 0) + 1;
    }

    return c;
  }, [items]);

  const visibleTabs = TABS.filter((t) => (counts[t.id] ?? 0) > 0);

  const { featured, rest } = useMemo(() => {
    const pool = tab === "all" ? items : items.filter((i) => i.kind === tab);

    const feat =
      pool.find((i) => i.kind === "news" && i.image) ?? pool[0] ?? null;

    let others = pool.filter((i) => i !== feat);

    if (tab === "all") {
      // interleave kinds so the list feels mixed, not grouped
      const by = (k: string) => others.filter((i) => i.kind === k);

      const [n, e, c] = [by("news"), by("event"), by("camp")];

      const mixed: HubItem[] = [];

      for (let i = 0; i < Math.max(n.length, e.length, c.length); i++) {
        if (e[i]) mixed.push(e[i]);
        if (n[i]) mixed.push(n[i]);
        if (c[i]) mixed.push(c[i]);
      }

      others = mixed;
    }

    return {
      featured: feat,
      rest: others.slice(0, 5),
    };
  }, [items, tab]);

  if (!items.length || !featured) {
    return null;
  }

  return (
    <>
      {visibleTabs.length > 1 && (
        <div
          role="group"
          aria-label="تصفية المحتوى"
          className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {visibleTabs.map((t) => {
            const active = tab === t.id;

            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => setTab(t.id)}
                className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-5 text-sm font-bold transition-colors duration-200 ${
                  active
                    ? "bg-brand-purple text-white"
                    : "bg-white text-brand-ink/70 ring-1 ring-brand-purple/15 hover:text-brand-purple hover:ring-brand-purple/40"
                }`}
              >
                {t.label}

                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] leading-none ${
                    active ? "bg-white/20" : "bg-brand-purple/10"
                  }`}
                >
                  {counts[t.id]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div
        key={tab}
        className="animate-hub-in mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8"
      >
        {/* ---------- Featured ---------- */}
        <div className="lg:col-span-7">
          <Featured item={featured} onOpen={setOpenNews} />
        </div>

        {/* ---------- Supporting list ---------- */}
        <ul className="lg:col-span-5 divide-y divide-brand-purple/10 self-start rounded-2xl border border-brand-purple/10 bg-white shadow-soft">
          {rest.length === 0 && (
            <li className="p-6 text-sm text-brand-ink/60">
              لا توجد عناصر أخرى حاليًا.
            </li>
          )}

          {rest.map((item) => (
            <li key={item.key}>
              <Row item={item} onOpen={setOpenNews} />
            </li>
          ))}
        </ul>
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
  const Wrapper = item.news ? "button" : "div";

  const wrapperProps = item.news
    ? {
        type: "button" as const,
        onClick: () => onOpen(item.news!),
        "aria-label": `قراءة تفاصيل: ${item.title}`,
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="group relative block h-full min-h-[340px] w-full overflow-hidden rounded-2xl bg-brand-purple-dark text-start shadow-soft transition duration-300 hover:shadow-lift sm:min-h-[420px] lg:min-h-[500px]"
    >
      {item.image ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <>
          <div className="texture-canvas absolute inset-0 opacity-50" />

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

        <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
          {item.excerpt}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-white">
          {item.place && (
            <span className="inline-flex items-center gap-1.5 font-medium text-white/80">
              <MapPin
                className="h-4 w-4 text-brand-yellow"
                aria-hidden="true"
              />
              {item.place}
            </span>
          )}

          {item.news && (
            <span className="inline-flex items-center gap-2 pb-0.5">
              اقرأ التفاصيل
              <ArrowLeft
                className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </span>
          )}
        </div>
      </div>
    </Wrapper>
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
          <img
            src={item.image}
            alt=""
            width={72}
            height={72}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : Icon ? (
          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
          <span className="text-brand-purple">{KIND_LABEL[item.kind]}</span>

          <span className="text-brand-ink/55">{item.date}</span>
        </span>

        <span className="mt-1 block font-display text-base font-semibold leading-snug text-brand-ink sm:text-lg">
          {item.title}
        </span>

        {item.place && (
          <span className="mt-1 flex items-center gap-1 text-xs text-brand-ink/55">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {item.place}
          </span>
        )}
      </span>
    </>
  );

  const cls =
    "group flex w-full items-center gap-4 p-4 text-start transition-colors duration-200 sm:p-5";

  return item.news ? (
    <button
      type="button"
      onClick={() => onOpen(item.news!)}
      aria-label={`قراءة تفاصيل: ${item.title}`}
      className={`${cls} hover:bg-brand-purple-tint/60`}
    >
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
