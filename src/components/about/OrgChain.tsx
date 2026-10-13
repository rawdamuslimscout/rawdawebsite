import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronLeft } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { ORG_NAME } from "@/lib/site";

/**
 * Where the troop sits: association → northern commission → troop.
 * Names only; the full, admin-managed tree lives on /structure.
 */
export default function OrgChain({ troopName }: { troopName: string }) {
  const steps = [
    { level: "الجمعية", name: ORG_NAME },
    { level: "المفوضية", name: "مفوضية الشمال" },
    { level: "الفوج", name: troopName },
  ];
  const last = steps.length - 1;

  return (
    <section
      id="belonging"
      className="section-y bg-white"
    >
      <div className="container-x">
        <Reveal>
          <SectionHeading
            title="إلى من ننتمي"
            subtitle={`${troopName} أحد أفواج ${ORG_NAME} ضمن مفوضية الشمال.`}
          />
        </Reveal>

        <ol className="mt-10 flex flex-col items-stretch gap-3 sm:mt-12 lg:flex-row lg:items-center lg:gap-4">
          {steps.map((step, i) => (
            <Reveal
              as="li"
              key={step.level}
              delay={i * 90}
              className="flex flex-col items-center gap-3 lg:flex-1 lg:flex-row lg:gap-4"
            >
              <div
                className={`w-full rounded-2xl p-5 text-center shadow-soft sm:p-6 ${
                  i === last
                    ? "bg-brand-purple text-white"
                    : "border border-brand-purple/10 bg-brand-cream text-brand-ink"
                }`}
                aria-current={i === last ? "true" : undefined}
              >
                <p
                  className={`text-xs font-bold ${
                    i === last ? "text-brand-yellow" : "text-brand-purple"
                  }`}
                >
                  {step.level}
                </p>
                <p className="mt-2 font-display text-lg font-bold leading-snug sm:text-xl">
                  {step.name}
                </p>
              </div>
              {i !== last && (
                <>
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-brand-purple/60 lg:hidden"
                    aria-hidden="true"
                  />
                  <ChevronLeft
                    className="hidden h-6 w-6 shrink-0 text-brand-purple/60 lg:block"
                    aria-hidden="true"
                  />
                </>
              )}
            </Reveal>
          ))}
        </ol>

        <Link
          href="/structure"
          className="group mt-8 inline-flex min-h-11 items-center gap-2 text-base font-bold text-brand-purple"
        >
          <span className="link-underline pb-1">اطّلع على الهيكل التنظيمي</span>
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
