import { FileText, Download } from "lucide-react";
import type { LibraryResource } from "@/data/content";

export default function ResourceCard({ resource }: { resource: LibraryResource }) {
  return (
    <article className="flex items-start gap-4 rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="badge-shield flex h-12 w-12 shrink-0 items-center justify-center bg-brand-purple-tint text-brand-purple">
        <FileText className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold leading-snug text-brand-ink">
            {resource.title}
          </h3>
          <span className="shrink-0 rounded-full bg-brand-turquoise-tint px-2.5 py-1 text-[11px] font-bold text-brand-turquoise-dark">
            {resource.fileType}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-brand-ink/65">
          {resource.description}
        </p>
        <a
          href={resource.fileUrl}
          download
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple transition-colors hover:text-brand-purple-dark"
        >
          <Download className="h-4 w-4" />
          تحميل الملف
        </a>
      </div>
    </article>
  );
}
