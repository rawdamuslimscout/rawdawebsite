import SectionHeading from "@/components/ui/SectionHeading";
import ScoutCard from "@/components/ui/ScoutCard";
import { getScoutStages } from "@/lib/data";

export default async function ScoutSections() {
  const scoutStages = await getScoutStages();
  return (
    <section
      id="sections"
      className="relative overflow-hidden bg-brand-cream pb-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            title="المراحل الكشفية"
            subtitle="ثلاث حلقات، رحلة واحدة: نرافق كل فتى وفتاة من اكتشاف الذات إلى المبادرة وخدمة المجتمع."
          />
          <div className="flex shrink-0 items-center gap-3 text-sm font-semibold text-brand-ink/55">
            <span className="h-px w-10 bg-brand-yellow" />
            <span>تدرّج يصنع الأثر</span>
          </div>
        </div>

        <div className="relative mt-14 grid gap-5 lg:grid-cols-3 lg:gap-0">
          {scoutStages.map((stage, index) => (
            <ScoutCard key={stage.id} stage={stage} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
