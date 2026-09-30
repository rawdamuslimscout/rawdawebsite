import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { iconMap } from "@/lib/icons";
import { getActivities, getCamps, getEvents, getNews } from "@/lib/data";
import HubClient, { type HubItem } from "./HubClient";

/**
 * One content hub replaces four card-grid sections:
 * upcoming events + news + camps (tabbed, one featured item) and the
 * activities as a compact index below.
 * Anchors kept alive: #news (section), #camps (tab), #activities (index).
 */
export default async function Hub() {
  const [news, events, camps, activities] = await Promise.all([
    getNews(),
    getEvents(),
    getCamps(),
    getActivities(),
  ]);

  const items: HubItem[] = [
    ...news.map(
      (n): HubItem => ({
        key: `n-${n.id}`,
        kind: "news",
        title: n.title,
        date: n.date,
        label: n.category,
        excerpt: n.excerpt,
        image: n.imageUrls?.[0] || n.imageUrl || undefined,
        news: n,
      }),
    ),
    ...events.map(
      (e): HubItem => ({
        key: `e-${e.id}`,
        kind: "event",
        title: e.title,
        date: e.date,
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
        date: c.year,
        place: c.location,
        excerpt: c.summary,
      }),
    ),
  ];

  return (
    <>
      {items.length > 0 && (
        <section
          id="news"
          className="section-y relative bg-brand-purple-tint/60"
        >
          <span
            id="camps"
            aria-hidden="true"
            className="absolute top-0 h-0 w-0 scroll-mt-24"
          />
          <div className="container-x">
            <Reveal>
              <SectionHeading
                title="آخر ما يحدث في الفوج"
                subtitle="أخبار، مناسبات قادمة ومخيمات — كل ما يجري في الفوج الآن في مكان واحد."
              />
            </Reveal>
            <HubClient items={items} />
          </div>
        </section>
      )}

      {activities.length > 0 && (
        <section
          id="activities"
          className="relative overflow-hidden bg-brand-purple py-14 sm:py-16"
        >
          <div className="texture-canvas absolute inset-0 opacity-30" />
          <div className="container-x relative">
            <Reveal className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                الأنشطة
              </h2>
            </Reveal>

            <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {activities.map((a, i) => {
                const Icon = iconMap[a.icon];
                return (
                  <li key={a.id} className="bg-brand-purple">
                    <Reveal
                      delay={(i % 4) * 60}
                      className="group flex h-full gap-4 p-5 transition-colors duration-300 hover:bg-white/[0.06] sm:p-6"
                    >
                      <Icon
                        className="mt-1 h-6 w-6 shrink-0 text-brand-yellow transition-transform duration-300 group-hover:scale-110"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="font-display text-lg font-semibold text-white">
                          {a.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-7 text-white/70">
                          {a.description}
                        </p>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
