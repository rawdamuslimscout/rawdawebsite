import { Download, Eye, FileText, ArrowUpLeft } from "lucide-react";
import type { LibraryResource } from "@/data/content";
import SharePdfButton from "./SharePdfButton";

/**
 * The `download` attribute is ignored for cross-origin files (Supabase
 * Storage), which would just open the file in a tab. Supabase forces an
 * attachment when the public URL carries `?download=<filename>`.
 */
function downloadHref(url: string, title: string, fileType: string) {
  if (!url.includes("/storage/v1/object/public/")) return url;
  const ext = fileType.toLowerCase().includes("docx") ? "docx" : "pdf";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}download=${encodeURIComponent(`${title}.${ext}`)}`;
}

export default function ResourceCard({
  resource,
}: {
  resource: LibraryResource;
}) {
  const isPdf = resource.fileType.toLowerCase().includes("pdf");
  const download = downloadHref(
    resource.fileUrl,
    resource.title,
    resource.fileType,
  );

  return (
    <article
      dir="rtl"
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-purple/10 bg-white p-4 shadow-sm transition-all duration-300 focus-within:border-brand-purple/25 hover:-translate-y-1 hover:border-brand-purple/25 hover:shadow-lg sm:p-5"
    >
      {/* Resource information */}
      <div className="flex items-start gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-purple-tint text-brand-purple ring-1 ring-brand-purple/5 transition-colors duration-300 group-hover:bg-brand-purple group-hover:text-white sm:h-14 sm:w-14">
          <FileText className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
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

      {/* Description (full text on hover when clamped) */}
      <p
        title={resource.description}
        className="mb-5 mt-3 line-clamp-2 min-h-10 text-sm leading-6 text-brand-ink/65"
      >
        {resource.description}
      </p>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 border-t border-brand-purple/[0.08] pt-4">
        {isPdf ? (
          <>
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-purple px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-purple-dark active:scale-[0.98] sm:flex-none sm:px-4"
            >
              <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>معاينة الملف</span>
              <span className="sr-only">
                : {resource.title} (يفتح في نافذة جديدة)
              </span>
              <ArrowUpLeft
                className="h-3.5 w-3.5 opacity-70"
                aria-hidden="true"
              />
            </a>

            <a
              href={download}
              download
              aria-label={`تحميل ${resource.title}`}
              title="تحميل الملف"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-purple/15 text-brand-purple transition-colors hover:border-brand-purple/30 hover:bg-brand-purple-tint"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
            </a>
          </>
        ) : (
          // Word files can't be previewed in the browser: make download the
          // primary, labelled action instead of a bare icon.
          <a
            href={download}
            download
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-purple px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-purple-dark active:scale-[0.98] sm:flex-none sm:px-4"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>تحميل الملف</span>
            <span className="sr-only">: {resource.title}</span>
          </a>
        )}

        <div className="ms-auto flex shrink-0 items-center justify-center">
          <SharePdfButton
            url={resource.fileUrl}
            title={resource.title}
            ariaLabel={`مشاركة ${resource.title}`}
          />
        </div>
      </div>
    </article>
  );
}
