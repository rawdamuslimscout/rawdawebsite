import Reveal from "@/components/ui/Reveal";
import { getValues } from "@/lib/data";

const AR = "٠١٢٣٤٥٦٧٨٩";
const ar = (n: number) => String(n).replace(/\d/g, (d) => AR[Number(d)]);

export default async function Values() {
  const values = await getValues();
  if (!values.length) return null;

  return (
    <section
      id="values"
      className="relative overflow-hidden bg-brand-purple-dark py-8 sm:py-12 lg:py-24"
    >
      <div className="texture-canvas absolute inset-0 opacity-30" />

      <div className="container-x relative">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-16">
          {/* Statement */}
          <Reveal className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              قيمنا
            </h2>

            <p className="mt-2 max-w-md text-xs leading-6 text-white/75 sm:mt-5 sm:text-lg sm:leading-8">
              قيم نعيشها في كل مخيم ورحلة ومهمة، ونبني عليها شخصية الكشاف
              والقائد.
            </p>
          </Reveal>

          {/* Values */}
          <ol className="grid grid-cols-2 sm:grid-cols-2 lg:col-span-7 lg:gap-x-10">
            {values.map((v, i) => (
              <Reveal
                as="li"
                key={v.id}
                delay={(i % 2) * 80}
                className="value-row group relative flex min-w-0 items-center gap-3 border-b border-white/10 py-3 sm:gap-4 sm:py-5"
              >
                <span className="shrink-0 font-display text-sm font-bold text-brand-yellow sm:text-xl">
                  {ar(i + 1)}
                </span>

                <span className="min-w-0 font-display text-sm font-semibold leading-snug text-white transition-transform duration-300 group-hover:-translate-x-1 sm:text-lg lg:text-2xl">
                  {v.title}
                </span>

                <span
                  aria-hidden="true"
                  className="value-bar absolute inset-x-0 bottom-[-1px] h-0.5 bg-brand-yellow"
                />
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
