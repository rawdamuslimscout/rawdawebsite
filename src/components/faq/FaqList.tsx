"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

type Faq = { id: string; question: string; answer: string; category: string };
type Category = { value: string; label: string };

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
  const baseId = useId();

  const available = categories.filter((c) =>
    items.some((i) => i.category === c.value),
  );

  const visible = useMemo(() => {
    const q = query.trim();
    return items.filter(
      (i) =>
        (category === "all" || i.category === category) &&
        (!q || i.question.includes(q) || i.answer.includes(q)),
    );
  }, [items, category, query]);

  const tab = (value: string, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setCategory(value)}
      aria-pressed={category === value}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
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
      {/* <div className="relative">
        <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={100}
          placeholder="ابحث في الأسئلة…"
          aria-label="ابحث في الأسئلة"
          className="w-full rounded-full border border-brand-purple/15 bg-white py-3 pe-4 ps-4 pr-11 text-sm outline-none transition-colors focus:border-brand-purple"
        />
      </div> */}

      {available.length > 1 && (
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="تصنيفات الأسئلة"
        >
          {tab("all", "الكل")}
          {available.map((c) => tab(c.value, c.label))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-8 text-center text-sm text-brand-ink/60 ring-1 ring-brand-purple/10">
          لا توجد أسئلة مطابقة لبحثك.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((faq) => {
            const open = openId === faq.id;
            const panelId = `${baseId}-p-${faq.id}`;
            const buttonId = `${baseId}-b-${faq.id}`;
            return (
              <li
                key={faq.id}
                className="overflow-hidden rounded-2xl border border-brand-purple/10 bg-white"
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenId(open ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start font-display text-base font-semibold text-brand-ink sm:text-lg"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-5 w-5 shrink-0 text-brand-purple transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!open}
                  className="border-t border-brand-purple/10 px-5 py-4"
                >
                  {/* Plain text only (React escapes it); line breaks are preserved. */}
                  <p className="whitespace-pre-line text-sm leading-7 text-brand-ink/75 sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
