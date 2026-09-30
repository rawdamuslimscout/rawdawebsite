"use client";

/* eslint-disable @next/next/no-img-element */

// src/components/ui/ScoutCard.tsx
import { iconMap } from "@/lib/icons";
import type { ScoutStage } from "@/data/content";
import { ArrowLeft } from "lucide-react";
import { stageBadges } from "@/data/stageBadges";

export default function ScoutCard({
  stage,
  index,
  onOpen,
}: {
  stage: ScoutStage;
  index: number;
  onOpen: (stage: ScoutStage, trigger: HTMLButtonElement) => void;
}) {
  const Icon = iconMap[stage.icon];
  const stageNumber = ["٠١", "٠٢", "٠٣"][index] || "٠٠";
  const badgeCount = stageBadges[stage.id]?.totalCount;

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
        {/* Image — same ratio for all three stages */}
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-purple-dark sm:aspect-[16/10] lg:aspect-[4/3]">
          {stage.imageUrl ? (
            <img
              src={stage.imageUrl}
              alt={stage.title}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="texture-canvas flex h-full w-full items-center justify-center">
              <Icon
                className="h-16 w-16 text-brand-yellow/80"
                strokeWidth={1.25}
                aria-hidden="true"
              />
            </div>
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-brand-purple-dark/80 via-brand-purple-dark/10 to-transparent"
          />
          <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-purple-dark">
            {stage.ageRange}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple text-brand-yellow">
              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </span>
            <h3 className="font-display text-xl font-bold text-brand-ink">
              {stage.title}
            </h3>
          </div>

          <p className="mt-4 flex-1 text-sm leading-7 text-brand-ink/70 sm:text-[15px]">
            {stage.description}
          </p>

          {typeof badgeCount === "number" && (
            <p className="mt-4 text-xs font-bold text-brand-ink/55">
              {badgeCount}+ وسام كفاية وهواية
            </p>
          )}

          <button
            type="button"
            onClick={(event) => onOpen(stage, event.currentTarget)}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 self-start border-t border-brand-purple/10 pt-4 text-sm font-bold text-brand-purple transition-[gap] duration-200 group-hover:gap-3"
          >
            اكتشف ما يتعلمه المنتسب
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </article>
    </>
  );
}
