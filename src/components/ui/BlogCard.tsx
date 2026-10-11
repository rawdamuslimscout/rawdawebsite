import Link from "next/link";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import type { BlogPost } from "@/data/content";

/** Estimated reading time in minutes (~180 words per minute for Arabic). */
export function readingMinutes(post: Pick<BlogPost, "content">) {
  const words = post.content
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

/** "قراءة في دقيقة" / "دقيقتين" / "٣ دقائق" / "١٢ دقيقة" — Arabic number agreement. */
export function readingTimeLabel(minutes: number) {
  if (minutes <= 1) return "قراءة في دقيقة";
  if (minutes === 2) return "قراءة في دقيقتين";
  if (minutes <= 10) return `قراءة في ${minutes} دقائق`;
  return `قراءة في ${minutes} دقيقة`;
}

export default function BlogCard({ post }: { post: BlogPost }) {
  const minutes = readingMinutes(post);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-sm transition duration-300 focus-within:shadow-lg focus-within:ring-2 focus-within:ring-brand-yellow hover:-translate-y-1 hover:shadow-lg">
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-brand-purple-light to-brand-purple">
        <BookOpen
          className="h-9 w-9 text-white/40 transition-transform duration-500 group-hover:scale-110"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-purple">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs font-medium text-brand-turquoise-dark">
          <span>
            {post.date} · {post.author}
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {readingTimeLabel(minutes)}
          </span>
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-brand-ink transition-colors group-hover:text-brand-purple">
          {/* The title link is stretched over the whole card (after:inset-0),
              so the entire card is one click/tap target with a clear name. */}
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-ink/65">
          {post.excerpt}
        </p>
        <span
          aria-hidden="true"
          className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-purple transition-colors group-hover:text-brand-purple-dark"
        >
          اقرأ المقال
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </span>
      </div>
    </article>
  );
}
