import { Newspaper } from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import NewsFeed from "@/components/news/NewsFeed";
import type { FeedItem } from "@/components/news/FeedCard";
import {
  blogHref,
  displayDate,
  latinDigits,
  newsHref,
  sortByPublished,
} from "@/components/news/format";
import { getBlogPosts, getNews } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "الأخبار والمقالات",
  description:
    "أخبار فوج روضة الفيحاء ومقالاته: أنشطة الفوج ومخيماته ورحلاته، ومقالات حول الكشافة والقيادة والقيم.",
  path: "/news",
});

export default async function NewsPage() {
  const [news, posts] = await Promise.all([getNews(), getBlogPosts()]);

  // Newest first by publish date; undated items follow in their admin order.
  const entries = sortByPublished([
    ...news.map((n) => ({
      publishedAt: n.publishedAt,
      item: {
        key: `n-${n.id}`,
        kind: "news",
        href: newsHref(n.id),
        title: n.title,
        category: n.category,
        date: displayDate(n.date, n.publishedAt),
        excerpt: latinDigits(n.excerpt),
        image: n.imageUrls?.[0] || n.imageUrl || undefined,
      } satisfies FeedItem,
    })),
    ...posts.map((p) => ({
      publishedAt: p.publishedAt,
      item: {
        key: `b-${p.slug}`,
        kind: "blog",
        href: blogHref(p.slug),
        title: p.title,
        category: p.category,
        date: displayDate(p.date, p.publishedAt),
        excerpt: latinDigits(p.excerpt),
        author: p.author,
      } satisfies FeedItem,
    })),
  ]);
  const items: FeedItem[] = entries.map((e) => e.item);

  return (
    <>
      <PageHeader
        title="الأخبار والمقالات"
        subtitle="آخر أخبار الفوج ونشاطاته، ومقالات من قيادة الفوج."
        path="/news"
      />
      <section className="bg-brand-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {items.length === 0 ? (
            <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-brand-purple/15 bg-white/60 px-6 py-14 text-center">
              <Newspaper
                className="h-10 w-10 text-brand-purple/30"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="mt-4 text-base font-semibold text-brand-ink/70">
                لا توجد أخبار أو مقالات منشورة بعد.
              </p>
            </div>
          ) : (
            <NewsFeed items={items} />
          )}
        </div>
      </section>
    </>
  );
}
