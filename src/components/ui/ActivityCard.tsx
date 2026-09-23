import { iconMap } from "@/lib/icons";
import type { Activity } from "@/data/content";

export default function ActivityCard({ activity }: { activity: Activity }) {
  const Icon = iconMap[activity.icon];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition-colors duration-300 hover:bg-white/[0.11]">
      <Icon className="h-7 w-7 text-brand-yellow" strokeWidth={1.75} />
      <div>
        <h3 className="font-display text-lg font-semibold text-white">
          {activity.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          {activity.description}
        </p>
      </div>
    </div>
  );
}
