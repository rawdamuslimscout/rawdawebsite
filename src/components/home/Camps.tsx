import { Tent, Flame, TreePine } from "lucide-react";

import SectionHeading from "@/components/ui/SectionHeading";
import { getCamps } from "@/lib/data";

export default async function Camps() {
  const camps = await getCamps();

  // Don't render the section if there are no camps
  if (!camps || camps.length === 0) {
    return null;
  }

  return (
    <section
      id="camps"
      className="relative overflow-hidden bg-brand-purple-dark py-24"
    >
      <div className="texture-canvas absolute inset-0 opacity-30" />

      {/* decorative tent silhouettes */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-brand-purple/50"
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 140 L180 30 L360 140 Z M300 140 L480 10 L660 140 Z M600 140 L780 40 L960 140 Z M900 140 L1100 20 L1300 140 Z M1200 140 L1350 50 L1440 140 Z"
          fill="currentColor"
        />
      </svg>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          title="مخيمات الفوج"
          subtitle="الطبيعة، الخيام، النيران والأصدقاء — حيث تُصنع أجمل الذكريات الكشفية."
          onDark
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {camps.map((camp, idx) => {
            const icons = [Tent, Flame, TreePine, Tent];
            const Icon = icons[idx % icons.length];

            return (
              <div
                key={camp.id}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm transition-colors hover:bg-white/[0.09]"
              >
                <Icon className="h-8 w-8 text-brand-yellow" strokeWidth={1.5} />

                <p className="mt-4 text-xs font-semibold text-brand-turquoise">
                  {camp.year} · {camp.location}
                </p>

                <h3 className="mt-2 font-display text-lg font-semibold text-white">
                  {camp.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {camp.summary}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
