import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { getCamps, getEvents, getNews } from "@/lib/data";
import {
  displayDate,
  latinDigits,
  newsHref,
  sortByPublished,
} from "@/components/news/format";
import HubClient, { type HubItem } from "./HubClient";

/** The homepage shows only the latest news; the full archive lives on /news. */
const HOME_NEWS_LIMIT = 6;

export default async function Hub() {
  const [news, events, camps] = await Promise.all([
    getNews(),
    getEvents(),
    getCamps(),
  ]);

  // Past events (isUpcoming === false) are stale on the homepage. Upcoming
  // ones come first, soonest first; events without real dates keep the
  // admin order after them.
  const upcoming = events
    .filter((e) => e.isUpcoming === true)
    .sort(
      (a, b) =>
        Date.parse(a.startDate ?? a.endDate ?? "") -
        Date.parse(b.startDate ?? b.endDate ?? ""),
    );
  const undated = events.filter((e) => e.isUpcoming === undefined);

  const items: HubItem[] = [
    ...sortByPublished(news)
      .slice(0, HOME_NEWS_LIMIT)
      .map(
        (n): HubItem => ({
          key: `n-${n.id}`,
          kind: "news",
          title: n.title,
          date: displayDate(n.date, n.publishedAt),
          label: n.category,
          excerpt: n.excerpt,
          image: n.imageUrls?.[0] || n.imageUrl || undefined,
          href: newsHref(n.id),
        }),
      ),
    ...[...upcoming, ...undated].map(
      (e): HubItem => ({
        key: `e-${e.id}`,
        kind: "event",
        upcoming: e.isUpcoming === true,
        title: e.title,
        date: latinDigits(e.date),
        place: e.location,
        label: e.group,
        excerpt: e.description,
      }),
    ),
    ...camps.map(
      (c): HubItem => ({
        key: `c-${c.id}`,
        kind: "camp",
        title: c.title,
        date: latinDigits(c.year),
        place: c.location,
        excerpt: c.summary,
      }),
    ),
  ];

  if (items.length === 0) return null;

  return (
    <section id="news" className="section-y relative bg-brand-purple-tint/60">
      <span
        id="camps"
        aria-hidden="true"
        className="absolute top-0 h-0 w-0 scroll-mt-24"
      />

      <div className="container-x">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            title="آخر ما يحدث في الفوج"
            subtitle="أخبار ومناسبات ومخيمات — كل ما يجري في الفوج الآن في مكان واحد."
          />
          <Link
            href="/news"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 self-start text-base font-bold text-brand-purple md:self-end"
          >
            <span className="link-underline pb-1">كل الأخبار والمقالات</span>
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </Reveal>

        <HubClient items={items} />
      </div>
    </section>
  );
}
