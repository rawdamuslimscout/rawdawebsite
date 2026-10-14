import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";

import FeedCard from "@/components/news/FeedCard";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { displayDate, latinDigits, newsHref } from "@/components/news/format";
import { getEvents, getNews } from "@/lib/data";
import { homeEvents, homeNews } from "@/lib/home-feed";

/**
 * Homepage "latest news": up to three dated news items, plus genuinely
 * upcoming events when there are any (see lib/home-feed.ts). The section is
 * left out entirely when neither qualifies, so the homepage never shows
 * stale or undated items. The full archive lives on /news.
 */
export default async function LatestNews() {
  const [news, events] = await Promise.all([getNews(), getEvents()]);
  const items = homeNews(news);
  const upcoming = homeEvents(events);

  if (items.length === 0 && upcoming.length === 0) return null;

  return (
    <section id="news" className="section-y bg-brand-cream">
      <div className="container-x">
        <Reveal className="flex flex-col items-center gap-4">
          <SectionHeading title="آخر الأخبار" subtitle="من نشاطات الفوج ومناسباته." align="center" />
          <Link
            href="/news"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-base font-bold text-brand-purple"
          >
            <span className="link-underline pb-1">كل الأخبار والمقالات</span>
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </Reveal>

        {upcoming.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-lg font-bold text-brand-ink">المناسبات القادمة</h3>
            <ul className="mt-3 grid gap-3 md:grid-cols-3">
              {upcoming.map((e) => (
                <li key={e.id} className="rounded-2xl border border-brand-purple/10 bg-white p-4 shadow-sm">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-turquoise-dark">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {latinDigits(e.date)}
                  </p>
                  <p className="mt-1.5 font-display text-base font-semibold text-brand-ink">{e.title}</p>
                  {e.location && (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-brand-ink/70">
                      <MapPin className="h-3.5 w-3.5 text-brand-purple" aria-hidden="true" />
                      {e.location}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {items.length > 0 && (
          <ul className={`grid gap-5 sm:gap-6 ${upcoming.length ? "mt-8" : "mt-10"} md:grid-cols-3`}>
            {items.map((n) => (
              <li key={n.id}>
                <FeedCard
                  headingLevel={3}
                  compact
                  item={{
                    key: n.id,
                    kind: "news",
                    href: newsHref(n.id),
                    title: n.title,
                    category: n.category,
                    date: displayDate(n.date, n.publishedAt),
                    excerpt: latinDigits(n.excerpt),
                    image: n.imageUrls?.[0] || n.imageUrl || undefined,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
