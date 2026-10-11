import PageHeader from "@/components/ui/PageHeader";

const bar = "animate-pulse rounded-full bg-brand-purple/10 motion-reduce:animate-none";

export default function JoinLoading() {
  return (
    <div aria-busy="true">
      <PageHeader title="انضم إلينا" />
      <p className="sr-only" role="status">
        جارٍ التحميل…
      </p>

      <section className="bg-white py-10 sm:py-14" aria-hidden="true">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-purple/10 bg-brand-cream px-6 py-8">
            <div className={`${bar} h-6 w-40`} />
            <div className={`${bar} h-4 w-full max-w-xl`} />
            <div className={`${bar} h-4 w-2/3 max-w-md`} />
            <div className="mt-3 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <div className={`${bar} h-12 flex-1`} />
              <div className={`${bar} h-12 flex-1`} />
            </div>
          </div>

          <div className={`${bar} mx-auto mt-14 h-8 w-36`} />
          <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex gap-4 rounded-2xl border border-brand-purple/10 p-5 sm:flex-col sm:p-6"
              >
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-2xl bg-brand-purple/10 motion-reduce:animate-none" />
                <div className="flex-1 space-y-2">
                  <div className={`${bar} h-5 w-1/2`} />
                  <div className={`${bar} h-3.5 w-full`} />
                  <div className={`${bar} h-3.5 w-4/5`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-purple-tint py-16 sm:py-20" aria-hidden="true">
        <div className="mx-auto max-w-5xl space-y-4 px-5 sm:px-8">
          <div className={`${bar} mx-auto mb-10 h-8 w-64`} />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="grid gap-4 rounded-2xl border border-brand-purple/10 bg-white p-5 sm:grid-cols-[1.3fr_1fr_1fr_1fr] sm:items-center"
            >
              <div className="space-y-2">
                <div className={`${bar} h-5 w-28`} />
                <div className={`${bar} h-3 w-16`} />
              </div>
              <div className={`${bar} h-4 w-24`} />
              <div className={`${bar} h-4 w-20`} />
              <div className={`${bar} h-4 w-28`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
