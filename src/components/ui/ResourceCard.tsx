import { Download, Eye, FileText, ArrowUpLeft } from "lucide-react";
import type { LibraryResource } from "@/data/content";
import SharePdfButton from "./SharePdfButton";

export default function ResourceCard({
  resource,
}: {
  resource: LibraryResource;
}) {
  const isPdf = resource.fileType.toLowerCase().includes("pdf");

  return (
    <article
      dir="rtl"
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-purple/10 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-purple/25 hover:shadow-lg sm:p-5"
    >
      {/* Resource information */}
      <div className="flex items-start gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-purple-tint text-brand-purple ring-1 ring-brand-purple/5 transition-colors duration-300 group-hover:bg-brand-purple group-hover:text-white sm:h-14 sm:w-14">
          <FileText className="h-6 w-6" strokeWidth={1.6} />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-brand-turquoise-tint px-2 py-1 text-[10px] font-bold text-brand-turquoise-dark">
              {resource.fileType}
            </span>
          </div>

          <h3 className="font-display text-base font-bold leading-7 text-brand-ink transition-colors group-hover:text-brand-purple sm:text-lg">
            {resource.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-6 text-brand-ink/65">
        {resource.description}
      </p>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-2 border-t border-brand-purple/[0.08] pt-4">
        {isPdf && (
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`معاينة ${resource.title}`}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-purple px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-purple-dark active:scale-[0.98] sm:flex-none sm:px-4"
          >
            <Eye className="h-4 w-4 shrink-0" />
            <span>معاينة الملف</span>
            <ArrowUpLeft className="h-3.5 w-3.5 opacity-70" />
          </a>
        )}

        <a
          href={resource.fileUrl}
          download
          aria-label={`تحميل ${resource.title}`}
          title="تحميل الملف"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-purple/15 text-brand-purple transition-colors hover:border-brand-purple/30 hover:bg-brand-purple-tint"
        >
          <Download className="h-4 w-4" />
        </a>

        <div className="ms-auto flex shrink-0 items-center justify-center">
          <SharePdfButton url={resource.fileUrl} title={resource.title} />
        </div>
      </div>
    </article>
  );
}
