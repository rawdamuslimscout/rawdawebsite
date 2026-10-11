"use client";

import { useEffect } from "react";

/**
 * Catches any unexpected error while rendering a public page, so visitors see
 * a friendly message with a retry button instead of the browser's blank
 * "Application error: a client-side exception has occurred" screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site] page error", error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-5 pb-20 pt-32">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold text-brand-ink sm:text-3xl">
          حدث خطأ غير متوقع
        </h1>
        <p className="mt-3 text-base leading-8 text-brand-ink/65">
          نعتذر، تعذّر تحميل هذه الصفحة الآن. جرّب مرة أخرى، وإن استمرت المشكلة
          عُد إلى الصفحة الرئيسية.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="min-h-[44px] rounded-full bg-brand-purple px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark"
          >
            إعادة المحاولة
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full reload is intentional after an error */}
          <a
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-full border border-brand-purple/25 px-6 py-2.5 text-sm font-bold text-brand-purple transition-colors hover:bg-brand-purple-tint"
          >
            الصفحة الرئيسية
          </a>
        </div>
      </div>
    </section>
  );
}
