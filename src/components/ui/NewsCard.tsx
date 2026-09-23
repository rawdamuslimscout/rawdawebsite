import { ArrowLeft, Tent } from "lucide-react";
import type { NewsItem } from "@/data/content";

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-brand-purple to-brand-purple-dark">
        <Tent className="h-10 w-10 text-white/40" strokeWidth={1.5} />
        <span className="absolute top-3 right-3 rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-purple-dark">
          {item.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium text-brand-turquoise-dark">{item.date}</p>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-brand-ink">
          {item.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-ink/65">
          {item.excerpt}
        </p>
        <button className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-purple transition-colors hover:text-brand-purple-dark">
          اقرأ المزيد
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </button>
      </div>
    </article>
  );
}
