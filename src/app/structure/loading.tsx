import PageHeader from "@/components/ui/PageHeader";

const bar = "animate-pulse rounded-full bg-brand-purple/10 motion-reduce:animate-none";
const block = "animate-pulse bg-brand-purple/10 motion-reduce:animate-none";

function SectionHead() {
  return (
    <div className="flex items-center gap-3">
      <div className={`${block} h-10 w-10 rounded-xl`} />
      <div className={`${bar} h-6 w-40`} />
    </div>
  );
}

export default function StructureLoading() {
  return (
    <div aria-busy="true">
      <PageHeader
        title="الهيكل التنظيمي"
        subtitle="من الجمعية إلى المفوضية إلى الفوج: من نحن وكيف نعمل."
      />
      <p className="sr-only" role="status">
        جارٍ التحميل…
      </p>
      <section className="bg-brand-cream py-14 sm:py-16" aria-hidden="true">
        <div className="mx-auto max-w-6xl space-y-12 px-5 sm:px-8">
          {/* Lineage strip */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-brand-purple/10 bg-white p-3 sm:flex-1"
              >
                <div className={`${block} h-11 w-11 shrink-0 rounded-xl`} />
                <div className="flex-1 space-y-2">
                  <div className={`${bar} h-3 w-14`} />
                  <div className={`${bar} h-4 w-3/4`} />
                </div>
              </div>
            ))}
          </div>

          {/* Dean */}
          <div>
            <SectionHead />
            <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl border border-brand-purple/10 bg-white p-6 sm:flex-row sm:p-8">
              <div className={`${block} h-24 w-24 shrink-0 rounded-full sm:h-28 sm:w-28`} />
              <div className="flex w-full flex-col items-center gap-2 sm:items-start">
                <div className={`${bar} h-6 w-48`} />
                <div className={`${bar} h-4 w-28`} />
              </div>
            </div>
          </div>

          {/* Council grid */}
          <div>
            <SectionHead />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-2xl border border-brand-purple/10 bg-white p-4"
                >
                  <div className={`${block} h-14 w-14 shrink-0 rounded-full`} />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className={`${bar} h-4 w-3/4`} />
                    <div className={`${bar} h-3.5 w-1/2`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
