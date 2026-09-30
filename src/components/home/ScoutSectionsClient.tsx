"use client";

import { useState } from "react";
import type { ScoutStage } from "@/data/content";
import Reveal from "@/components/ui/Reveal";
import ScoutCard from "@/components/ui/ScoutCard";
import StageDetailModal from "@/components/ui/StageDetailModal";

export default function ScoutSectionsClient({
  stages,
}: {
  stages: ScoutStage[];
}) {
  const [selectedStage, setSelectedStage] = useState<ScoutStage | null>(null);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);

  const openStage = (stage: ScoutStage, source: HTMLButtonElement) => {
    setTrigger(source);
    setSelectedStage(stage);
  };

  const closeStage = () => {
    setSelectedStage(null);
    window.requestAnimationFrame(() => trigger?.focus());
  };

  return (
    <>
      <div className="mt-12 grid gap-6 sm:mt-14 lg:grid-cols-3 lg:gap-7">
        {stages.map((stage, index) => (
          <Reveal key={stage.id} delay={index * 90} className="h-full">
            <ScoutCard stage={stage} index={index} onOpen={openStage} />
          </Reveal>
        ))}
      </div>

      {selectedStage && (
        <StageDetailModal stage={selectedStage} open onClose={closeStage} />
      )}
    </>
  );
}
