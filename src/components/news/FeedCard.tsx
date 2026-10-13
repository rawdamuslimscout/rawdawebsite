import Link from "next/link";
import { ArrowLeft, BookOpen, CalendarDays, Newspaper } from "lucide-react";

import SafeImage from "@/components/ui/SafeImage";

export type FeedItem = {
  key: string;
  kind: "news" | "blog";
  href: string;
  title: string;
  category: string;
  /** Display date (already Western digits). */
  date: string;
  excerpt: string;
  image?: string;
  author?: string;
};

const KIND_LABEL = { news: "خبر", blog: "مقال" } as const;

/** One card in the /news feed (and the homepage's latest news): a news item or a blog post. */
export default function FeedCard({
  item,
  headingLevel = 2,
  compact = false,
}: {
  item: FeedItem;
  /** 3 when the cards sit under a section heading (the homepage). */
  headingLevel?: 2 | 3;
  /** Homepage: photo beside the text on phones (vertical card from md up). */
  compact?: boolean;
}) {
  const Icon = item.kind === "news" ? Newspaper : BookOpen;
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <article className={`group relative flex h-full overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-sm transition duration-300 focus-within:shadow-lg focus-within:ring-2 focus-within:ring-brand-yellow hover:-translate-y-1 hover:shadow-lg ${compact ? "flex-row md:flex-col" : "flex-col"}`}>
      <div className={`relative overflow-hidden bg-gradient-to-br from-brand-purple-light to-brand-purple ${compact ? "w-28 shrink-0 sm:w-40 md:w-auto md:aspect-[16/10]" : "aspect-[16/10]"}`}>
        <SafeImage
          src={item.image}
          alt=""
          sizes={
            compact
              ? "(min-width: 1024px) 400px, (min-width: 768px) 33vw, 160px"
              : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          }
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallback={
            <span className="flex h-full w-full items-center justify-center">
              <Icon
                className="h-9 w-9 text-white/40 transition-transform duration-500 group-hover:scale-110"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>
          }
        />
        <span className={`absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-purple ${compact ? "hidden md:inline" : ""}`}>
          {KIND_LABEL[item.kind]}
        </span>
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${compact ? "p-4 md:p-5" : "p-5"}`}>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-brand-turquoise-dark">
          {item.category && <span>{item.category}</span>}
          {item.category && item.date && <span aria-hidden="true">·</span>}
          {item.date && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {item.date}
            </span>
          )}
        </p>
        <Heading className="mt-2 font-display text-lg font-semibold leading-snug text-brand-ink transition-colors group-hover:text-brand-purple">
          {/* Stretched link: the whole card is one tap target with a clear name. */}
          <Link
            href={item.href}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {item.title}
          </Link>
        </Heading>
        {item.excerpt && (
          <p className={`mt-2 flex-1 text-sm leading-relaxed text-brand-ink/70 ${compact ? "line-clamp-2 md:line-clamp-3" : "line-clamp-3"}`}>
            {item.excerpt}
          </p>
        )}
        <span
          aria-hidden="true"
          className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-purple transition-colors group-hover:text-brand-purple-dark"
        >
          {item.kind === "news" ? "اقرأ الخبر" : "اقرأ المقال"}
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </span>
      </div>
    </article>
  );
}
