"use client";

// src/components/ui/ScoutCard.tsx
import { iconMap } from "@/lib/icons";
import type { ScoutStage } from "@/data/content";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import StageDetailModal from "./StageDetailModal";
import { stageBadges } from "@/data/stageBadges";

const accents = [
  "from-brand-turquoise to-brand-turquoise-dark",
  "from-brand-yellow to-brand-orange",
  "from-brand-purple-light to-brand-purple",
];

export default function ScoutCard({
  stage,
  index,
}: {
  stage: ScoutStage;
  index: number;
}) {
  const Icon = iconMap[stage.icon];
  const [open, setOpen] = useState(false);
  const stageNumber = ["٠١", "٠٢", "٠٣"][index] || "٠٠";
  const badgeCount = stageBadges[stage.id]?.totalCount;

  return (
    <>
      <article
        className={`group relative flex flex-col overflow-hidden border border-brand-purple/10 bg-white p-6 shadow-[0_1px_2px_rgba(43,23,80,0.06)] transition-all duration-300 hover:-translate-y-1 hover:z-10 hover:shadow-[0_18px_30px_-12px_rgba(75,42,130,0.25)] lg:rounded-none ${index === 0 ? "lg:rounded-r-3xl" : ""} ${index === 2 ? "lg:rounded-l-3xl" : ""}`}
      >
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${accents[index % accents.length]}`}
        />
        {stage.imageUrl && (
          <div className="-mx-6 -mt-6 mb-6 h-32 overflow-hidden">
            <img
              src={stage.imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="badge-shield flex h-14 w-14 shrink-0 items-center justify-center bg-brand-purple text-white transition-transform duration-300 group-hover:scale-105">
            <Icon className="h-6 w-6" strokeWidth={2} />
          </div>
          <span className="font-display text-4xl font-bold leading-none text-brand-purple/10">
            {stageNumber}
          </span>
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-brand-ink">
          {stage.title}
        </h3>
        <p className="mt-1 text-sm font-medium text-brand-turquoise-dark">
          {stage.ageRange}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-brand-ink/65">
          {stage.description}
        </p>

        {typeof badgeCount === "number" && (
          <p className="mt-4 text-xs font-bold text-brand-ink/45">
            {badgeCount}+ وسام كفاية وهواية
          </p>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 flex items-center gap-1.5 text-sm font-bold text-brand-purple transition-transform group-hover:gap-2.5"
        >
          اكتشف ما يتعلمه المنتسب
          <ArrowLeft className="h-4 w-4" />
        </button>
      </article>

      <StageDetailModal
        stage={stage}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
