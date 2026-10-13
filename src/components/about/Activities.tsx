import Reveal from "@/components/ui/Reveal";
import { iconMap } from "@/lib/icons";
import { getActivities } from "@/lib/data";

/** "الأنشطة" band (moved from the homepage hub to /about). */
export default async function Activities() {
  const activities = await getActivities();
  if (!activities.length) return null;

  return (
    <section
      id="activities"
      aria-labelledby="activities-title"
      className="relative overflow-hidden bg-brand-purple py-10 sm:py-16"
    >
      <div
        aria-hidden="true"
        className="texture-canvas absolute inset-0 opacity-30"
      />

      <div className="container-x relative">
        <Reveal className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <h2
            id="activities-title"
            className="font-display text-2xl font-bold text-white sm:text-3xl"
          >
            أنشطتنا
          </h2>
          <p className="text-sm leading-7 text-white/80 sm:text-base">
            ما نقوم به على مدار السنة، ولكلّ نشاط غايته التربوية.
          </p>
        </Reveal>

        <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((a, i) => {
            const Icon = iconMap[a.icon];

            return (
              <li
                key={a.id}
                className="bg-brand-purple last:odd:col-span-2 lg:last:odd:col-span-1"
              >
                <Reveal
                  delay={(i % 4) * 60}
                  className="flex h-full gap-3 p-4 sm:gap-4 sm:p-6"
                >
                  {Icon && (
                    <Icon
                      className="mt-1 h-5 w-5 shrink-0 text-brand-yellow sm:h-6 sm:w-6"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  )}

                  <div className="min-w-0">
                    <h3 className="font-display text-base font-semibold text-white sm:text-lg">
                      {a.title}
                    </h3>

                    <p className="mt-1 text-xs leading-6 text-white/80 sm:mt-1.5 sm:text-sm sm:leading-7">
                      {a.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
