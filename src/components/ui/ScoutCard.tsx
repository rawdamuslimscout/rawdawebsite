import { iconMap } from "@/lib/icons";
import type { ScoutStage } from "@/data/content";

export default function ScoutCard({ stage }: { stage: ScoutStage }) {
  const Icon = iconMap[stage.icon];

  return (
    <div className="group relative rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-[0_1px_2px_rgba(43,23,80,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_30px_-12px_rgba(75,42,130,0.25)]">
      <div className="badge-shield flex h-14 w-14 items-center justify-center bg-brand-purple text-white transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-6 w-6" strokeWidth={2} />
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
    </div>
  );
}
