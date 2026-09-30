import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { getMilestones } from "@/lib/data";

const toNum = (s: string) =>
  parseInt(
    s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))),
    10,
  );

export default async function Achievements() {
  const raw = await getMilestones();
  if (!raw.length) return null;

  // Past → present (oldest first) when years are numeric; otherwise keep order.
  const numeric = raw.every((m) => !Number.isNaN(toNum(m.year)));
  const milestones = numeric
    ? [...raw].sort((a, b) => toNum(a.year) - toNum(b.year))
    : raw;
  const last = milestones.length - 1;
  const phase = (i: number) =>
    milestones.length < 2
      ? null
      : i === 0
        ? "البدايات"
        : i === last
          ? "الحاضر"
          : "النمو";

  return (
    <section id="history" className="section-y bg-white">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            <SectionHeading
              title="محطات من مسيرة الفوج"
              subtitle="من البدايات إلى اليوم — مسيرة تُبنى عامًا بعد عام."
            />
          </Reveal>

          <ol className="lg:col-span-8">
            {milestones.map((m, i) => (
              <Reveal
                as="li"
                key={`${m.year}-${i}`}
                delay={60}
                className="tl-item"
              >
                {/* year */}
                <p className="tl-year font-display text-3xl font-bold leading-none text-brand-purple md:text-5xl md:pt-1">
                  {m.year}
                </p>

                {/* rail */}
                <div
                  className="tl-rail relative flex justify-center"
                  aria-hidden="true"
                >
                  <span
                    className={`relative z-10 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 md:mt-3 ${
                      i === last
                        ? "border-brand-yellow bg-brand-yellow"
                        : "border-brand-purple bg-white"
                    }`}
                  >
                    {i !== last && (
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-purple" />
                    )}
                  </span>
                  {i !== last && (
                    <span className="tl-fill absolute bottom-[-2.5rem] top-6 w-0.5 bg-gradient-to-b from-brand-purple to-brand-purple/20 md:top-8" />
                  )}
                </div>

                {/* body */}
                <div className="tl-body pb-12 pt-3 md:pt-2">
                  {phase(i) && (
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        i === last
                          ? "bg-brand-yellow text-brand-purple-dark"
                          : "bg-brand-purple/10 text-brand-purple"
                      }`}
                    >
                      {phase(i)}
                    </span>
                  )}
                  <h3 className="mt-3 font-display text-xl font-bold text-brand-ink sm:text-2xl">
                    {m.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-base leading-8 text-brand-ink/70">
                    {m.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
