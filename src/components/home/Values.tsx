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
      className="section-y relative overflow-hidden bg-brand-purple-dark"
    >
      <div className="texture-canvas absolute inset-0 opacity-30" />
      <div className="container-x relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Statement */}
          <Reveal className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <h2 className="font-display text-3xl font-bold leading-[1.3] text-white sm:text-4xl lg:text-5xl">
              قيمنا
            </h2>
            <p className="mt-5 max-w-md text-base leading-8 text-white/75 sm:text-lg">
              قيم نعيشها في كل مخيم ورحلة ومهمة، ونبني عليها شخصية الكشاف
              والقائد.
            </p>
          </Reveal>

          {/* Numbered values */}
          <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7">
            {values.map((v, i) => (
              <Reveal
                as="li"
                key={v.id}
                delay={(i % 2) * 80}
                className="value-row group relative flex items-center gap-5 border-b border-white/10 py-6 sm:py-7"
              >
                <span className="w-10 shrink-0 font-display text-2xl font-bold text-brand-yellow sm:text-3xl">
                  {ar(i + 1)}
                </span>
                <span className="font-display text-xl font-semibold text-white transition-transform duration-300 group-hover:-translate-x-1 sm:text-2xl">
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
