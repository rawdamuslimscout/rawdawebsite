/** Skeleton for /library: header, filter chips and resource cards. */
export default function LibraryLoading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">جارٍ تحميل المكتبة…</span>

      <section className="relative overflow-hidden bg-brand-purple-dark pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="texture-canvas absolute inset-0 opacity-30" />
        <div className="relative mx-auto flex max-w-4xl animate-pulse flex-col items-center px-5 sm:px-8">
          <div className="mb-5 h-4 w-32 rounded-full bg-white/10" />
          <div className="h-9 w-40 rounded-xl bg-white/15 sm:h-12" />
          <div className="mt-5 h-4 w-full max-w-md rounded-full bg-white/10" />
        </div>
      </section>

      <section className="bg-brand-cream py-16 sm:py-20">
        <div className="mx-auto max-w-5xl animate-pulse px-5 sm:px-8">
          <div className="flex gap-2 overflow-hidden">
            {[20, 28, 32, 24].map((w, i) => (
              <div
                key={i}
                className="h-11 shrink-0 rounded-full bg-white ring-1 ring-brand-purple/10"
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-brand-purple/10 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-brand-purple/10 sm:h-14 sm:w-14" />
                  <div className="flex-1 space-y-2.5 pt-1">
                    <div className="h-4 w-10 rounded bg-brand-purple/10" />
                    <div className="h-5 w-3/4 rounded-full bg-brand-purple/10" />
                  </div>
                </div>
                <div className="mb-5 mt-4 space-y-2">
                  <div className="h-3 w-full rounded-full bg-brand-purple/[0.07]" />
                  <div className="h-3 w-2/3 rounded-full bg-brand-purple/[0.07]" />
                </div>
                <div className="flex items-center gap-2 border-t border-brand-purple/[0.08] pt-4">
                  <div className="h-11 w-32 rounded-xl bg-brand-purple/10" />
                  <div className="h-11 w-11 rounded-xl bg-brand-purple/[0.07]" />
                  <div className="ms-auto h-11 w-24 rounded-xl bg-brand-purple/[0.07]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
