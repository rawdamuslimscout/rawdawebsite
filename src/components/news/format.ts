/**
 * Small display helpers shared by the news feed, the homepage hub and the
 * gallery. Safe to import from server and client components.
 */

import type { NewsItem } from "@/data/content";

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_ARABIC = "۰۱۲۳۴۵۶۷۸۹";

/** Western digits only (the site standard), whatever the admin typed. */
export function latinDigits(text: string): string {
  return text
    .replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String(EASTERN_ARABIC.indexOf(d)));
}

const dateFormatter = new Intl.DateTimeFormat("ar-LB-u-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Beirut",
});

/** "12 أيلول 2026" from an ISO timestamp; undefined when it is missing/invalid. */
export function formatArDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : dateFormatter.format(date);
}

/** The admin's display date, falling back to the formatted publish date. */
export function displayDate(text: string | undefined, iso?: string): string {
  const label = text?.trim();
  if (label) return latinDigits(label);
  return formatArDate(iso) ?? "";
}

type NounForms = {
  /** 1 — "عنصر واحد" */
  one: string;
  /** 2 — "عنصران" */
  two: string;
  /** 3–10 — "عناصر" */
  few: string;
  /** 11–99 — "عنصرًا" */
  many: string;
  /** 100, 200… and 101/102… — "عنصر" */
  hundred: string;
};

export const ITEM_FORMS: NounForms = {
  one: "عنصر واحد",
  two: "عنصران",
  few: "عناصر",
  many: "عنصرًا",
  hundred: "عنصر",
};

export const PHOTO_FORMS: NounForms = {
  one: "صورة واحدة",
  two: "صورتان",
  few: "صور",
  many: "صورة",
  hundred: "صورة",
};

/** Number + counted noun with Arabic number–noun agreement, Western digits. */
export function arabicCount(n: number, forms: NounForms): string {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  const rest = n % 100;
  if (n > 100 && rest >= 3 && rest <= 10) return `${n} ${forms.few}`;
  if (n > 100 && rest >= 11) return `${n} ${forms.many}`;
  if (n >= 100) return `${n} ${forms.hundred}`;
  if (n >= 3 && n <= 10) return `${n} ${forms.few}`;
  if (n >= 11) return `${n} ${forms.many}`;
  return `${n} ${forms.few}`; // 0
}

/**
 * Newest first by publish date; items without one keep their existing
 * (admin) order after the dated ones. Stable.
 */
export function sortByPublished<T extends { publishedAt?: string }>(items: T[]): T[] {
  const time = (item: T) => {
    const t = item.publishedAt ? Date.parse(item.publishedAt) : NaN;
    return Number.isNaN(t) ? null : t;
  };
  return items
    .map((item, index) => ({ item, index, t: time(item) }))
    .sort((a, b) => {
      if (a.t !== null && b.t !== null) return b.t - a.t || a.index - b.index;
      if (a.t !== null) return -1;
      if (b.t !== null) return 1;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

/** Public URL of a news item's detail page. */
export const newsHref = (id: string) => `/news/${encodeURIComponent(id)}`;

/** Public URL of a blog post. */
export const blogHref = (slug: string) => `/blog/${encodeURIComponent(slug)}`;

/** All photos of a news item (the cover first). */
export function newsImages(item: Pick<NewsItem, "imageUrl" | "imageUrls">): string[] {
  return item.imageUrls?.length
    ? item.imageUrls
    : item.imageUrl
      ? [item.imageUrl]
      : [];
}
