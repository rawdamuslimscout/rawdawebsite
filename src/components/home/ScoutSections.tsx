import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { getScoutStages } from "@/lib/data";
import ScoutSectionsClient from "./ScoutSectionsClient";

export default async function ScoutSections() {
  const scoutStages = await getScoutStages();
  return (
    <section
      id="sections"
      className="section-y relative overflow-hidden bg-brand-cream"
    >
      <div className="container-x">
        <Reveal>
          <SectionHeading
            title="المراحل الكشفية"
            subtitle="نرافق كل فتى وفتاة من اكتشاف الذات إلى المبادرة وخدمة المجتمع."
            align="center"
          />
        </Reveal>

        <ScoutSectionsClient stages={scoutStages} />
      </div>
    </section>
  );
}
