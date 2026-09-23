import SectionHeading from "@/components/ui/SectionHeading";
import ScoutCard from "@/components/ui/ScoutCard";
import { scoutStages } from "@/data/content";

export default function ScoutSections() {
  return (
    <section id="sections" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          title="المراحل الكشفية"
          subtitle="رحلة تربوية متدرّجة تواكب كل فتى وفتاة من عمر البراعم حتى القيادة."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scoutStages.map((stage) => (
            <ScoutCard key={stage.id} stage={stage} />
          ))}
        </div>
      </div>
    </section>
  );
}
