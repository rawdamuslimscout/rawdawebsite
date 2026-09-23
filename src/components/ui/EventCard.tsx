import { CalendarDays, MapPin, Users } from "lucide-react";
import type { EventItem } from "@/data/content";

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <h3 className="font-display text-xl font-semibold text-brand-ink">
        {event.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-brand-ink/65">
        {event.description}
      </p>

      <dl className="mt-5 space-y-2.5 border-t border-brand-purple/10 pt-4 text-sm text-brand-ink/75">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-brand-turquoise-dark" />
          <dd>{event.date}</dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-brand-turquoise-dark" />
          <dd>{event.location}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0 text-brand-turquoise-dark" />
          <dd>{event.group}</dd>
        </div>
      </dl>

      <div className="mt-6 flex gap-3">
        <button className="flex-1 rounded-full bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-purple-dark">
          التفاصيل
        </button>
        <button className="flex-1 rounded-full border border-brand-purple/20 px-4 py-2.5 text-sm font-semibold text-brand-purple transition-colors hover:bg-brand-purple-tint">
          سجّل الآن
        </button>
      </div>
    </article>
  );
}
