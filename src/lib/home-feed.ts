import { sortByPublished } from "@/components/news/format";

/**
 * What the homepage may show, so it never looks outdated or padded:
 * - news: only items with a date (a publish date, or the date label the admin
 *   entered), newest first, at most HOME_NEWS_MAX; the section is hidden when
 *   fewer than HOME_NEWS_MIN qualify;
 * - events: only those whose real dates say they are still ahead. Events
 *   without dates, and past ones, are never shown on the homepage.
 */
export const HOME_NEWS_MAX = 3;
export const HOME_NEWS_MIN = 2;
export const HOME_EVENTS_MAX = 3;

type Dated = { date?: string; publishedAt?: string };

export function hasDate(item: Dated): boolean {
  if (item.date?.trim()) return true;
  return !!item.publishedAt && !Number.isNaN(Date.parse(item.publishedAt));
}

export function homeNews<T extends Dated>(items: T[]): T[] {
  const dated = sortByPublished(items.filter(hasDate));
  return dated.length >= HOME_NEWS_MIN ? dated.slice(0, HOME_NEWS_MAX) : [];
}

type EventLike = { isUpcoming?: boolean; startDate?: string; endDate?: string };

export function homeEvents<T extends EventLike>(events: T[]): T[] {
  const at = (e: T) => Date.parse(e.startDate ?? e.endDate ?? "");
  return events
    .filter((e) => e.isUpcoming === true)
    .sort((a, b) => at(a) - at(b))
    .slice(0, HOME_EVENTS_MAX);
}
