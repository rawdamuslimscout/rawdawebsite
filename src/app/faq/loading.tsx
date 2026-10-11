import PageHeader from "@/components/ui/PageHeader";

const bar = "animate-pulse rounded-full bg-brand-purple/10 motion-reduce:animate-none";

export default function FaqLoading() {
  return (
    <div aria-busy="true">
      <PageHeader
        title="الأسئلة الشائعة"
        subtitle="إجابات مختصرة عن أهم ما يسأل عنه الأهالي والمنتسبون."
      />
      <p className="sr-only" role="status">
        جارٍ التحميل…
      </p>
      <section className="bg-brand-cream py-14 sm:py-16" aria-hidden="true">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="flex gap-2 overflow-hidden">
            {[16, 28, 24, 28].map((w, i) => (
              <div
                key={i}
                className={`${bar} h-11 shrink-0`}
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>
          <ul className="mt-6 space-y-3">
            {[85, 70, 90, 60, 75, 80].map((w, i) => (
              <li
                key={i}
                className="flex min-h-[56px] items-center justify-between gap-4 rounded-2xl border border-brand-purple/10 bg-white px-5 py-4"
              >
                <div className={`${bar} h-5`} style={{ width: `${w}%` }} />
                <div className={`${bar} h-5 w-5 shrink-0`} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
