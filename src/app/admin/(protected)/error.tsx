"use client";

import { useEffect } from "react";

/**
 * If anything inside the admin area fails unexpectedly, the admin sees this
 * calm message INSIDE the dashboard (menu still works) instead of a white page.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] page error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
      <h1 className="font-display text-xl font-bold text-brand-ink">
        حدثت مشكلة في هذه الصفحة
      </h1>
      <p className="mt-3 text-sm leading-7 text-brand-ink/65">
        لا تقلق، بياناتك المحفوظة سابقًا لم تتأثر. اضغط «إعادة المحاولة»، وإن
        استمرت المشكلة تأكد من اتصالك بالإنترنت أو سجّل الخروج ثم ادخل من جديد.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-brand-purple px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-purple-dark"
        >
          إعادة المحاولة
        </button>
        <a
          href="/admin"
          className="rounded-full border border-brand-purple/25 px-6 py-2.5 text-sm font-bold text-brand-purple transition-colors hover:bg-brand-purple-tint"
        >
          لوحة التحكم
        </a>
      </div>
    </div>
  );
}
