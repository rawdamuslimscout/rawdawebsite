import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import JsonLd from "@/components/ui/JsonLd";
import { absoluteUrl } from "@/lib/site";

export default function PageHeader({
  title,
  subtitle,
  path,
  children,
}: {
  title: string;
  subtitle?: string;
  /**
   * Root-relative path of the current page, e.g. "/faq". When set, the
   * visible breadcrumb is also emitted as BreadcrumbList JSON-LD.
   */
  path?: string;
  /** Optional extra content under the subtitle (e.g. a related link). */
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-brand-purple-dark pt-28 pb-16 sm:pt-36 sm:pb-20">
      {path && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "الرئيسية",
                item: absoluteUrl("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: title,
                item: absoluteUrl(path),
              },
            ],
          }}
        />
      )}
      <div className="texture-canvas absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
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
            <li aria-hidden>
              <ChevronLeft size={14} />
            </li>
            <li aria-current="page" className="font-semibold text-white/85">
              {title}
            </li>
          </ol>
        </nav>
        <h1 className="font-display text-3xl font-bold text-white sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
