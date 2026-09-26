import SectionHeading from "@/components/ui/SectionHeading";
import { getMilestones } from "@/lib/data";

export default async function Achievements() {
  const milestones = await getMilestones();
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <SectionHeading title="محطات من مسيرة الفوج" align="center" />

        <ol className="relative mt-16 border-e-2 border-brand-purple/15 pe-8">
          {milestones.map((m) => (
            <li key={m.year} className="relative mb-12 last:mb-0">
              <span className="absolute -end-[41px] top-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-purple bg-white">
                <span className="h-2 w-2 rounded-full bg-brand-turquoise" />
              </span>
              <p className="font-display text-2xl font-bold text-brand-purple">
                {m.year}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-brand-ink">
                {m.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-ink/65">
                {m.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
