import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronLeft, Newspaper } from "lucide-react";

import JsonLd from "@/components/ui/JsonLd";
import SharePdfButton from "@/components/ui/SharePdfButton";
import NewsImageGallery from "@/components/news/NewsImageGallery";
import {
  displayDate,
  latinDigits,
  newsHref,
  newsImages,
} from "@/components/news/format";
import { getNews, getNewsItem } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

export const revalidate = 3600;
// Items added after the build are rendered on first request, then cached.
export const dynamicParams = true;

// getNews() throws on a DB error, so a broken database fails the build
// instead of silently shipping without news pages.
export async function generateStaticParams() {
  const news = await getNews();
  return news.map((n) => ({ id: n.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const item = await getNewsItem(id);
  if (!item) return {};
  const images = newsImages(item);
  return pageMetadata({
    title: item.title,
    description: latinDigits(item.excerpt),
    path: newsHref(item.id),
    type: "article",
    publishedTime: item.publishedAt,
    images: images.length ? [images[0]] : undefined,
  });
}

export default async function NewsItemPage({ params }: Props) {
  const { id } = await params;
  const item = await getNewsItem(id);
  if (!item) notFound();

  const path = newsHref(item.id);
  const images = newsImages(item);
  const date = displayDate(item.date, item.publishedAt);
  const body = item.body?.length ? item.body : [item.excerpt];
  const paragraphs = body.map((p) => latinDigits(p.trim())).filter(Boolean);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: item.title,
            description: latinDigits(item.excerpt),
            inLanguage: "ar",
            ...(item.publishedAt ? { datePublished: item.publishedAt } : {}),
            ...(images.length
              ? { image: images.map((src) => absoluteUrl(src)) }
              : {}),
            publisher: { "@id": `${SITE_URL}/#organization` },
            mainEntityOfPage: absoluteUrl(path),
            isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "الرئيسية", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "الأخبار والمقالات", item: absoluteUrl("/news") },
              { "@type": "ListItem", position: 3, name: item.title, item: absoluteUrl(path) },
            ],
          },
        ]}
      />

      <section className="relative overflow-hidden bg-brand-purple-dark pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="texture-canvas absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <nav aria-label="مسار التنقل" className="mb-5 flex justify-center">
            <ol className="flex items-center gap-1.5 text-sm text-white/70">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-[32px] items-center rounded transition-colors hover:text-brand-yellow"
                >
                  الرئيسية
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronLeft size={14} />
              </li>
              <li>
                <Link
                  href="/news"
                  className="inline-flex min-h-[32px] items-center rounded transition-colors hover:text-brand-yellow"
                >
                  الأخبار والمقالات
                </Link>
              </li>
            </ol>
          </nav>
          {item.category && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-yellow">
              <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
              {item.category}
            </span>
          )}
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl sm:leading-tight">
            {item.title}
          </h1>
          {date && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/75">
              <CalendarDays className="h-4 w-4 text-white/60" aria-hidden="true" />
              {item.publishedAt ? (
                <time dateTime={item.publishedAt}>{date}</time>
              ) : (
                date
              )}
            </p>
          )}
        </div>
      </section>

      <article className="bg-brand-cream py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          {images.length > 0 && (
            <div className="mb-10 sm:mb-12">
              <NewsImageGallery images={images} title={item.title} />
            </div>
          )}

          <div className="mx-auto max-w-2xl space-y-6 text-[1.0625rem] leading-[2.1] text-brand-ink/80 sm:text-lg sm:leading-[2.1]">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-between gap-3 border-t border-brand-purple/10 pt-6">
            <Link
              href="/news"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-purple transition-colors hover:text-brand-purple-dark"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              العودة إلى الأخبار والمقالات
            </Link>
            <SharePdfButton
              url={path}
              title={item.title}
              shareFile={false}
              label="مشاركة الخبر"
              ariaLabel="مشاركة الخبر"
              shareText={item.title}
            />
          </div>
        </div>
      </article>
    </>
  );
}
