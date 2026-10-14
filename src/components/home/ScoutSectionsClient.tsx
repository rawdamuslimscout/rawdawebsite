"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

import type { ScoutStage } from "@/data/content";
import { iconMap } from "@/lib/icons";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import StageDetailModal from "@/components/ui/StageDetailModal";

/** Homepage stages: one tall photo per stage, name and ages over it; details open in a dialog. */
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
  // focus returns to the tile that opened it.
  const closeStage = useCallback(() => {
    setSelectedStage(null);
    window.requestAnimationFrame(() =>
      triggerRef.current?.focus({ preventScroll: true }),
    );
  }, []);

  if (!stages.length) return null;

  return (
    <>
      <ul className="mt-10 grid gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-4 lg:gap-6">
        {stages.map((stage, index) => {
          const Icon = iconMap[stage.icon];
          return (
            <Reveal as="li" key={stage.id} delay={index * 90}>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={(event) => openStage(stage, event.currentTarget)}
                className="group relative block aspect-[16/11] w-full overflow-hidden rounded-2xl bg-brand-purple-dark text-start sm:aspect-[3/4]"
              >
                <SafeImage
                  src={stage.imageUrl}
                  alt=""
                  sizes="(min-width: 640px) 33vw, 100vw"
                  width={800}
                  height={1060}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  fallback={
                    <span className="texture-canvas flex h-full w-full items-center justify-center">
                      {Icon && (
                        <Icon className="h-16 w-16 text-brand-yellow/80" strokeWidth={1.25} aria-hidden="true" />
                      )}
                    </span>
                  }
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/20 to-transparent"
                />
                <span className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <span className="block text-sm font-semibold text-brand-yellow">{stage.ageRange}</span>
                  <span className="mt-1 block font-display text-2xl font-bold text-white lg:text-3xl">
                    {stage.title}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-white/85 transition-[gap] duration-200 group-hover:gap-3">
                    ماذا يتعلّم المنتسب
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </span>
                </span>
              </button>
            </Reveal>
          );
        })}
      </ul>

      {selectedStage && (
        <StageDetailModal stage={selectedStage} open onClose={closeStage} />
      )}
    </>
  );
}
