"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

type Faq = { id: string; question: string; answer: string; category: string };
type Category = { value: string; label: string };

/** Show the search box only once the list is long enough to need it. */
const SEARCH_THRESHOLD = 6;
const HASH_PREFIX = "q-";

/**
 * Loose Arabic matching: ignore diacritics/tatweel and unify the common
 * letter variants people type interchangeably (أ/إ/آ → ا, ة → ه, ى → ي).
 */
function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

export default function FaqList({
  items,
  categories,
}: {
  items: Faq[];
  categories: Category[];
}) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const available = categories.filter((c) =>
    items.some((i) => i.category === c.value),
  );
  const showSearch = items.length > SEARCH_THRESHOLD;

  const indexed = useMemo(
    () =>
      items.map((i) => ({
        ...i,
        haystack: normalize(`${i.question} ${i.answer}`),
      })),
    [items],
  );

  const visible = useMemo(() => {
    const q = normalize(query);
    return indexed.filter(
      (i) =>
        (category === "all" || i.category === category) &&
        (!q || i.haystack.includes(q)),
    );
  }, [indexed, category, query]);

  const filtering = category !== "all" || query.trim() !== "";

  // Deep link: /faq#q-<id> opens that question (on load and on hash change).
  const openFromHash = useCallback(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash.startsWith(HASH_PREFIX)) return;
    const id = hash.slice(HASH_PREFIX.length);
    if (!items.some((i) => i.id === id)) return;
    setCategory("all");
    setQuery("");
    setOpenId(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(hash);
      if (!el) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      el.scrollIntoView({
        block: "start",
        behavior: reduce ? "auto" : "smooth",
      });
      el.querySelector("button")?.focus({ preventScroll: true });
    });
  }, [items]);

  useEffect(() => {
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [openFromHash]);

  const toggle = (id: string) => {
    const next = openId === id ? null : id;
    setOpenId(next);
    // Keep the URL shareable without adding history entries or jumping.
    const url = next
      ? `#${HASH_PREFIX}${next}`
      : window.location.pathname + window.location.search;
    window.history.replaceState(window.history.state, "", url);
  };

  const reset = () => {
    setCategory("all");
    setQuery("");
    inputRef.current?.focus();
  };

  const tab = (value: string, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setCategory(value)}
      aria-pressed={category === value}
      className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        category === value
          ? "bg-brand-purple text-white"
          : "bg-white text-brand-ink/70 ring-1 ring-brand-purple/15 hover:bg-brand-purple-tint"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      {showSearch && (
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/60"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            maxLength={100}
            placeholder="ابحث في الأسئلة…"
            aria-label="ابحث في الأسئلة"
            enterKeyHint="search"
            className="min-h-[48px] w-full rounded-full border border-brand-purple/15 bg-white py-3 pe-12 ps-11 text-base outline-none placeholder:text-brand-ink/60 transition-colors focus:border-brand-purple sm:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="مسح البحث"
              className="absolute end-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-brand-ink/65 hover:bg-brand-purple-tint hover:text-brand-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {available.length > 1 && (
        // Single scrollable row on phones (no tall wrapped block), wraps on larger screens.
        <div
          className={`no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 ${showSearch ? "mt-4" : ""}`}
          role="group"
          aria-label="تصنيفات الأسئلة"
        >
          {tab("all", "الكل")}
          {available.map((c) => tab(c.value, c.label))}
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {filtering ? `النتائج: ${visible.length} من ${items.length}` : ""}
      </p>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-8 text-center ring-1 ring-brand-purple/10">
          <p className="text-sm text-brand-ink/70">
            لا توجد أسئلة مطابقة لبحثك.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-bold text-brand-purple ring-1 ring-brand-purple/20 transition-colors hover:bg-brand-purple-tint"
          >
            عرض كل الأسئلة
          </button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((faq) => {
            const open = openId === faq.id;
            const itemId = `${HASH_PREFIX}${faq.id}`;
            const panelId = `${itemId}-panel`;
            const buttonId = `${itemId}-button`;
            return (
              <li
                key={faq.id}
                id={itemId}
                className={`scroll-mt-28 overflow-hidden rounded-2xl border bg-white transition-colors ${
                  open
                    ? "border-brand-purple/30 shadow-soft"
                    : "border-brand-purple/10"
                }`}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(faq.id)}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-start font-display text-base font-semibold text-brand-ink transition-colors hover:bg-brand-purple-tint/50 sm:text-lg"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-5 w-5 shrink-0 text-brand-purple transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                </h3>
                {/* Smooth height via grid-rows 0fr→1fr; `invisible` keeps closed answers out of the tab order and a11y tree. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none ${
                    open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-brand-purple/10 px-5 py-4">
                      {/* Plain text only (React escapes it); line breaks are preserved. */}
                      <p className="whitespace-pre-line text-sm leading-7 text-brand-ink/75 sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
