import { MapPin, Tent } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { latinDigits } from "@/components/news/format";
import { getCamps } from "@/lib/data";

/** /about: the troop's camps and trips, exactly as entered in the admin (moved from the homepage). */
export default async function Camps() {
  const camps = await getCamps();
  if (camps.length === 0) return null;

  return (
    <section id="camps" className="section-y bg-white">
      <div className="container-x">
        <Reveal>
          <SectionHeading title="من مخيماتنا ورحلاتنا" />
        </Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {camps.map((c) => (
            <li key={c.id} className="flex flex-col rounded-2xl border border-brand-purple/10 bg-brand-cream p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-turquoise-dark">
                <Tent className="h-4 w-4" aria-hidden="true" />
                {latinDigits(c.year)}
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-brand-ink">{c.title}</h3>
              {c.location && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-brand-ink/70">
                  <MapPin className="h-3.5 w-3.5 text-brand-purple" aria-hidden="true" />
                  {c.location}
                </p>
              )}
              {c.summary && <p className="mt-3 text-sm leading-7 text-brand-ink/70">{c.summary}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
