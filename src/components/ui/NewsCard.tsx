"use client";

import { ArrowLeft, Image as ImageIcon, X } from "lucide-react";
import type { NewsItem } from "@/data/content";
import { useEffect, useState } from "react";

export default function NewsCard({ item }: { item: NewsItem }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full flex-col overflow-hidden rounded-2xl border border-brand-purple/10 bg-white text-right shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none"
        aria-label={`قراءة تفاصيل خبر: ${item.title}`}
      >
        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-purple to-brand-purple-dark">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <ImageIcon className="h-10 w-10 text-white/35" strokeWidth={1.5} />
          )}
          <span className="absolute right-3 top-3 rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-purple-dark">
            {item.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-medium text-brand-turquoise-dark">{item.date}</p>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-brand-ink">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-ink/65">
            {item.excerpt}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-purple transition-colors group-hover:text-brand-purple-dark">
            اقرأ التفاصيل
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-purple-dark/70 p-5 backdrop-blur-sm"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`news-title-${item.id}`}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="إغلاق التفاصيل"
              className="absolute left-4 top-4 z-10 rounded-full bg-white/90 p-2 text-brand-ink shadow-sm transition-colors hover:bg-white"
            >
              <X className="h-5 w-5" />
            </button>
            {item.imageUrl && <img src={item.imageUrl} alt="" className="h-56 w-full object-cover" />}
            <div className="p-6 sm:p-8">
              <p className="text-sm font-semibold text-brand-turquoise-dark">{item.category} · {item.date}</p>
              <h2 id={`news-title-${item.id}`} className="mt-2 font-display text-2xl font-bold text-brand-ink">
                {item.title}
              </h2>
              <p className="mt-5 whitespace-pre-line text-base leading-8 text-brand-ink/70">{item.excerpt}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
