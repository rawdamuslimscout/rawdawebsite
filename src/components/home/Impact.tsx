import { Award, Tent, Users, type LucideIcon } from "lucide-react";

import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import { getSiteStats } from "@/lib/data";

const icons: LucideIcon[] = [Award, Users, Tent];

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
      className="relative z-10 -mt-12 sm:-mt-16 lg:-mt-20"
    >
      <div className="container-x">
        <Reveal className="overflow-hidden rounded-xl border border-white/10 bg-brand-purple shadow-lift">
          <div className="h-0.5 w-full bg-white/80" />

          <dl className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-x-reverse">
            {stats.map((stat, i) => {
              const Icon = icons[i % icons.length];

              return (
                <div
                  key={`${stat.label}-${i}`}
                  className="flex items-center gap-3 px-4 py-4 sm:flex-col sm:items-start sm:gap-0 sm:px-5 sm:py-6 lg:px-7 lg:py-7"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:mb-4 ${chips[i % chips.length]}`}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>

                  <div className="flex min-w-0 flex-col sm:contents">
                    <dt className="order-3 mt-1 text-sm font-medium text-white/80 sm:mt-2 sm:text-base">
                      {stat.label}
                    </dt>

                    <span
                      className={`order-2 mt-2 block h-0.5 w-7 rounded-full sm:mt-3 ${bars[i % bars.length]}`}
                      aria-hidden="true"
                    />

                    <dd className="order-1 font-display text-3xl font-bold leading-none text-white sm:text-4xl lg:text-5xl">
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
