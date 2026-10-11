/** Skeleton for /blog: header + a grid of post cards (matches BlogCard). */
export default function BlogLoading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">جارٍ تحميل المقالات…</span>

      <section className="relative overflow-hidden bg-brand-purple-dark pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="texture-canvas absolute inset-0 opacity-30" />
        <div className="relative mx-auto flex max-w-4xl animate-pulse flex-col items-center px-5 sm:px-8">
          <div className="mb-5 h-4 w-32 rounded-full bg-white/10" />
          <div className="h-9 w-40 rounded-xl bg-white/15 sm:h-12" />
          <div className="mt-5 h-4 w-full max-w-md rounded-full bg-white/10" />
        </div>
      </section>

      <section className="bg-brand-cream py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-sm"
            >
              <div className="h-36 bg-brand-purple/10" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-1/2 rounded-full bg-brand-purple/10" />
                <div className="h-5 w-4/5 rounded-full bg-brand-purple/10" />
                <div className="h-3 w-full rounded-full bg-brand-purple/[0.07]" />
                <div className="h-3 w-2/3 rounded-full bg-brand-purple/[0.07]" />
                <div className="h-4 w-24 rounded-full bg-brand-purple/10" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
