"use client";

import { useCallback, useRef, useState } from "react";
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
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openStage = useCallback(
    (stage: ScoutStage, source: HTMLButtonElement) => {
      triggerRef.current = source;
      setSelectedStage(stage);
    },
    [],
  );

  // Stable identity so the dialog's key/focus effect is not re-run, and
  // focus returns to the card button that opened it.
  const closeStage = useCallback(() => {
    setSelectedStage(null);
    window.requestAnimationFrame(() =>
      triggerRef.current?.focus({ preventScroll: true }),
    );
  }, []);

  if (!stages.length) return null;

  return (
    <>
      <ul className="mt-12 grid gap-6 sm:mt-14 lg:grid-cols-3 lg:gap-7">
        {stages.map((stage, index) => (
          <Reveal as="li" key={stage.id} delay={index * 90} className="h-full">
            <ScoutCard stage={stage} index={index} onOpen={openStage} />
          </Reveal>
        ))}
      </ul>

      {selectedStage && (
        <StageDetailModal stage={selectedStage} open onClose={closeStage} />
      )}
    </>
  );
}
