import { Award, Tent, Users, type LucideIcon } from "lucide-react";

import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import { getSiteStats } from "@/lib/data";

const icons: LucideIcon[] = [Award, Users, Tent];
// gold · blue · gold — accents only, purple stays the foundation
const chips = [
  "bg-brand-yellow text-brand-purple-dark",
  "bg-[var(--brand-blue)] text-white",
  "bg-brand-yellow text-brand-purple-dark",
];
const bars = [
  "bg-brand-yellow",
  "bg-[var(--brand-blue-soft)]",
  "bg-brand-yellow",
];

export default async function Impact() {
  const stats = await getSiteStats();
  if (!stats.length) return null;

  return (
    <section
      aria-label="الفوج بالأرقام"
      className="relative z-10 -mt-20 sm:-mt-24 lg:-mt-28"
    >
      <div className="container-x">
        {/* Decorative element */}
        <Reveal className="overflow-hidden rounded-2xl border border-white/10 bg-brand-purple shadow-lift">
          <div className="h-1 w-full bg-white" />
          <dl className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-x-reverse">
            {stats.map((stat, i) => {
              const Icon = icons[i % icons.length];
              return (
                <div
                  key={`${stat.label}-${i}`}
                  className="flex items-center gap-5 px-6 py-6 sm:flex-col sm:items-start sm:gap-0 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:order-first sm:mb-7 ${chips[i % chips.length]}`}
                    aria-hidden="true"
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>

                  <div className="flex min-w-0 flex-col sm:contents">
                    <dt className="order-3 mt-2 text-base font-semibold text-white/80 sm:mt-3 sm:text-lg">
                      {stat.label}
                    </dt>
                    <span
                      className={`order-2 mt-3 block h-1 w-10 rounded-full sm:mt-5 ${bars[i % bars.length]}`}
                      aria-hidden="true"
                    />
                    <dd className="order-1 font-display text-5xl font-bold leading-none text-white sm:text-6xl lg:text-7xl">
                      <CountUp value={stat.value} />
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
