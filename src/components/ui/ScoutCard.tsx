"use client";

// src/components/ui/ScoutCard.tsx
import { iconMap } from "@/lib/icons";
import type { ScoutStage } from "@/data/content";
import { ArrowLeft } from "lucide-react";
import { stageBadges } from "@/data/stageBadges";
import SafeImage from "@/components/ui/SafeImage";

export default function ScoutCard({
  stage,
  onOpen,
}: {
  stage: ScoutStage;
  index?: number;
  onOpen: (stage: ScoutStage, trigger: HTMLButtonElement) => void;
}) {
  const Icon = iconMap[stage.icon];
  const badgeCount = stageBadges[stage.id]?.totalCount;

  return (
    // The whole card is the tap target (the button's ::after stretches over
    // it), so the hover lift is backed by a real click/focus affordance.
    // Compact on every screen: a short, wide photo on phones (group photos
    // stay readable), photo beside the text on tablets, three columns on desktop.
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift focus-within:shadow-lift sm:flex-row lg:flex-col">
      {/* Image — same ratio for all three stages */}
      <div className="relative aspect-[21/9] w-full shrink-0 overflow-hidden bg-brand-purple-dark sm:aspect-auto sm:w-[38%] lg:aspect-[16/10] lg:w-auto">
        <SafeImage
          src={stage.imageUrl}
          alt=""
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 38vw, 100vw"
          width={800}
          height={600}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          fallback={
            <div className="texture-canvas flex h-full w-full items-center justify-center">
              <Icon
                className="h-16 w-16 text-brand-yellow/80"
                strokeWidth={1.25}
                aria-hidden="true"
              />
            </div>
          }
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-brand-purple-dark/80 via-brand-purple-dark/10 to-transparent"
        />
        <span className="absolute start-2 top-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-brand-purple-dark sm:start-4 sm:top-4 sm:px-3 sm:py-1 sm:text-xs">
          {stage.ageRange}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple text-brand-yellow sm:flex"
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <h3 className="font-display text-lg font-bold text-brand-ink sm:text-xl">
            {stage.title}
          </h3>
        </div>

        {/* Stretches only in the desktop row of three, to align the cards' footers. */}
        <p className="mt-3 text-sm leading-7 text-brand-ink/70 sm:text-[15px] lg:flex-1">
          {stage.description}
        </p>

        {typeof badgeCount === "number" && (
          <p className="mt-3 text-xs font-bold text-brand-ink/70">
            {badgeCount}+ وسام كفاية وهواية
          </p>
        )}

        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={`اكتشف ما يتعلمه المنتسب: ${stage.title}`}
          onClick={(event) => onOpen(stage, event.currentTarget)}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 self-start border-t border-brand-purple/10 pt-3 text-sm font-bold text-brand-purple transition-[gap] duration-200 after:absolute after:inset-0 after:rounded-2xl after:content-[''] group-hover:gap-3 group-focus-within:gap-3"
        >
          اكتشف ما يتعلمه المنتسب
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
