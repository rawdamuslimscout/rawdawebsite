import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { BlogPost } from "@/data/content";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-brand-purple-light to-brand-purple">
        <BookOpen className="h-9 w-9 text-white/40" strokeWidth={1.5} />
        <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-purple">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium text-brand-turquoise-dark">
          {post.date} · {post.author}
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-brand-ink">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-ink/65">
          {post.excerpt}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-purple transition-colors hover:text-brand-purple-dark"
        >
          اقرأ المقال
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
