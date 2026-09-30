import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { getScoutStages } from "@/lib/data";
import ScoutSectionsClient from "./ScoutSectionsClient";

export default async function ScoutSections() {
  const scoutStages = await getScoutStages();
  return (
    <section
      id="sections"
      className="section-y relative overflow-hidden bg-white"
    >
      <div className="container-x">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            title="المراحل الكشفية"
            subtitle="نرافق كل فتى وفتاة من اكتشاف الذات إلى المبادرة وخدمة المجتمع."
          />
        </Reveal>

        <ScoutSectionsClient stages={scoutStages} />
      </div>
    </section>
  );
}
