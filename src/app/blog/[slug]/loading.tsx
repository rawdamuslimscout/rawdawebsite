/** Skeleton for a blog article: hero with title/meta, then text lines. */
export default function BlogPostLoading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">جارٍ تحميل المقال…</span>

      <section className="relative overflow-hidden bg-brand-purple-dark pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="texture-canvas absolute inset-0 opacity-30" />
        <div className="relative mx-auto flex max-w-3xl animate-pulse flex-col items-center px-5 sm:px-8">
          <div className="mb-5 h-4 w-36 rounded-full bg-white/10" />
          <div className="h-7 w-24 rounded-full bg-white/10" />
          <div className="mt-5 h-9 w-full max-w-xl rounded-xl bg-white/15 sm:h-10" />
          <div className="mt-3 h-9 w-2/3 max-w-sm rounded-xl bg-white/15 sm:hidden" />
          <div className="mt-5 h-4 w-64 max-w-full rounded-full bg-white/10" />
        </div>
      </section>

      <section className="bg-brand-cream py-14 sm:py-20">
        <div className="mx-auto max-w-2xl animate-pulse space-y-8 px-5 sm:px-8">
          {[0, 1, 2].map((block) => (
            <div key={block} className="space-y-4">
              <div className="h-4 w-full rounded-full bg-brand-purple/[0.08]" />
              <div className="h-4 w-full rounded-full bg-brand-purple/[0.08]" />
              <div className="h-4 w-11/12 rounded-full bg-brand-purple/[0.08]" />
              <div className="h-4 w-3/5 rounded-full bg-brand-purple/[0.08]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
