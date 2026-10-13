import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  Clock,
  UserRound,
} from "lucide-react";
import { getBlogPost, getBlogPosts } from "@/lib/data";
import JsonLd from "@/components/ui/JsonLd";
import SharePdfButton from "@/components/ui/SharePdfButton";
import { readingMinutes, readingTimeLabel, toWesternDigits } from "@/components/ui/BlogCard";
import { SITE_URL, SITE_LOGO_PATH, absoluteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await paramsPromise;
  const post = await getBlogPost(params.slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${encodeURIComponent(post.slug)}`,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function BlogPostPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = await paramsPromise;
  const [post, posts] = await Promise.all([
    getBlogPost(params.slug),
    getBlogPosts(),
  ]);
  if (!post) notFound();

  const path = `/blog/${encodeURIComponent(post.slug)}`;
  const minutes = readingMinutes(post);
  const paragraphs = post.content.map((p) => p.trim()).filter(Boolean);

  // Posts are ordered newest first.
  const index = posts.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index >= 0 ? posts[index + 1] : undefined;

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            inLanguage: "ar",
            ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
            ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
            // Posts are signed by groups ("قيادة الفوج", "فرقة …"), not people.
            author: { "@type": "Organization", name: post.author },
            image: absoluteUrl(SITE_LOGO_PATH),
            publisher: { "@id": `${SITE_URL}/#organization` },
            mainEntityOfPage: absoluteUrl(path),
            isPartOf: { "@id": `${SITE_URL}/#website` },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "الرئيسية", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "الأخبار والمقالات", item: absoluteUrl("/news") },
              { "@type": "ListItem", position: 3, name: post.title, item: absoluteUrl(path) },
            ],
          },
        ]}
      />
      <section className="relative overflow-hidden bg-brand-purple-dark pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="texture-canvas absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <nav aria-label="مسار التنقل" className="mb-5 flex justify-center">
            <ol className="flex items-center gap-1.5 text-sm text-white/60">
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
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-yellow">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {post.category}
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl sm:leading-tight">
            {post.title}
          </h1>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm text-white/65">
            <li className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-white/45" aria-hidden="true" />
              {toWesternDigits(post.date)}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <UserRound className="h-4 w-4 text-white/45" aria-hidden="true" />
              {post.author}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-white/45" aria-hidden="true" />
              {readingTimeLabel(minutes)}
            </li>
          </ul>
        </div>
      </section>

      <article className="bg-brand-cream py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <div className="space-y-6 text-[1.0625rem] leading-[2.1] text-brand-ink/80 sm:text-lg sm:leading-[2.1]">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-brand-purple/10 pt-6">
            <Link
              href="/news"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-purple transition-colors hover:text-brand-purple-dark"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              العودة إلى الأخبار والمقالات
            </Link>
            <SharePdfButton
              url={path}
              title={post.title}
              shareFile={false}
              label="مشاركة المقال"
              ariaLabel="مشاركة المقال"
              shareText={post.title}
            />
          </div>

          {(newer || older) && (
            <nav
              aria-label="مقالات أخرى"
              className="mt-10 grid gap-3 sm:grid-cols-2"
            >
              {newer ? (
                <Link
                  href={`/blog/${encodeURIComponent(newer.slug)}`}
                  className="group flex min-h-11 flex-col rounded-2xl border border-brand-purple/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-purple/25 hover:shadow-md sm:p-5"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-turquoise-dark">
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                    مقال أحدث
                  </span>
                  <span className="mt-1.5 font-display text-base font-semibold leading-snug text-brand-ink transition-colors group-hover:text-brand-purple">
                    {newer.title}
                  </span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {older && (
                <Link
                  href={`/blog/${encodeURIComponent(older.slug)}`}
                  className="group flex min-h-11 flex-col rounded-2xl border border-brand-purple/10 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-purple/25 hover:shadow-md sm:p-5"
                >
                  <span className="inline-flex items-center gap-1.5 self-end text-xs font-semibold text-brand-turquoise-dark">
                    مقال أقدم
                    <ArrowLeft
                      className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1.5 font-display text-base font-semibold leading-snug text-brand-ink transition-colors group-hover:text-brand-purple">
                    {older.title}
                  </span>
                </Link>
              )}
            </nav>
          )}
        </div>
      </article>
    </>
  );
}
